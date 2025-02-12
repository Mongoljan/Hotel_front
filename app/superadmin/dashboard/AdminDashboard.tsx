'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VISIBLE_FIELDS = ['user_name', 'hotel_name', 'hotel_address', 'user_mail', 'user_phone', 'approved'];

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
      console.error('Error fetching owners:', error);
      toast.error('Failed to load owners data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleApprove = async (owner_pk: number, currentApprovalStatus: boolean) => {
    try {
      const res = await fetch('https://dev.kacc.mn/api/approve_user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner_pk,
          approved: !currentApprovalStatus,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to approve user');
      }

      await fetchOwners();

      toast.success(
        currentApprovalStatus ? 'User disapproved successfully!' : 'User approved successfully!'
      );
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Error approving/disapproving user.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="text-black">
      <h1>SuperAdmin Dashboard</h1>
      <div className="text-black text-[30px]">{hotelName}</div>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={ownerList.map((owner) => ({ id: owner.owner_pk, ...owner }))}
          columns={VISIBLE_FIELDS.map((field) => ({ field, headerName: field, width: 150 }))}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          getRowId={(row) => row.owner_pk}
        />
      </div>

      <ToastContainer />
    </div>
  );
}
