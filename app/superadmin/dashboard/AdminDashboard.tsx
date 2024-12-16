'use client'
import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

type Owner = {
  owner_pk: number;
  user_name: string;
  hotel_name: string;
  hotel_address: string;
  user_mail: string;
  user_phone: string;
  approved: boolean;
};

type Props = {
  hotelName: string | undefined;

};

export default function AdminDashboardClient({ hotelName }: Props) {
  const [ownerList, setOwnerList] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch owners' data from the API on the client side
  const fetchOwners = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/all-owners/`);
      if (!response.ok) {
        throw new Error('Failed to fetch owners');
      }
      const ownersData: Owner[] = await response.json();
      setOwnerList(ownersData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching owners:", error);
      toast.error("Failed to load owners data.");
      setLoading(false);
    }
  };

  // Fetch owners data when the component mounts
  useEffect(() => {
    fetchOwners();
  }, []);

  // Approve user function
  const handleApprove = async (owner_pk: number, currentApprovalStatus: boolean) => {
    try {
      const res = await fetch('https://dev.kacc.mn/api/approve_user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner_pk,
          approved: !currentApprovalStatus, // Toggle approval status
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to approve user');
      }

      // After approving, refetch the owners list to keep in sync with database
      await fetchOwners();

      // Show success toast based on the action performed
      toast.success(
        currentApprovalStatus
          ? "User disapproved successfully!"
          : "User approved successfully!"
      );
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Error approving/disapproving user.");
    }
  };

  if (loading) {
    return <div>Loading...</div>; // You can show a loader while fetching data
  }

  return (
    <div className="text-black">
      <h1>SuperAdmin Dashboard</h1>

      <div>
         <div className="text-black text-[30px]">{hotelName}</div>
      </div>

      <table className="w-full mt-4 border-collapse border bg-white border-primary">
        <thead>
          <tr className="bg-primary text-white">
            <th className="border p-2">Owner Name</th>
            <th className="border p-2">Hotel Name</th>
            <th className="border p-2">Hotel Address</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Approved</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {ownerList.map((owner) => (
            <tr key={owner.owner_pk} className="text-center">
              <td className="border p-2">{owner.user_name}</td>
              <td className="border p-2">{owner.hotel_name}</td>
              <td className="border p-2">{owner.hotel_address}</td>
              <td className="border p-2">{owner.user_mail}</td>
              <td className="border p-2">{owner.user_phone}</td>
              <td className="border p-2">{owner.approved ? <div className="text-green-500">Зөвшөөрсөн</div> : <div className="text-red-500">Цуцалсан</div>}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleApprove(owner.owner_pk, owner.approved)}
                  className={`px-4 py-2 w-[120px] rounded ${
                    owner.approved ? 'bg-blue-500' : 'bg-blue-500'
                  } text-white`}
                >
                  {owner.approved ? 'Цуцлах' : 'Зөвшөөрөх'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Toast notification container */}
      <ToastContainer />
    </div>
  );
}
