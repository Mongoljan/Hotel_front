// import { getDictionary } from "../../dictionaries";
import Cookies from "js-cookie";
import AdminDashboardClient from "./AdminDashboard";

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
  params: Promise<{}>;
};

export default async function AdminDashboardPage({ params }: Props) {
  // const dict = await getDictionary(lang);
  const hotelName = Cookies.get('hotelName');

  // Fetch owners' data on the server-side
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/all-owners/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const owners: Owner[] = await response.json();

  // Pass the fetched data to the client-side component as props
  return (
    <AdminDashboardClient
      // owners={owners}
      hotelName={hotelName}       // dict={dict}
    />
  );
}
