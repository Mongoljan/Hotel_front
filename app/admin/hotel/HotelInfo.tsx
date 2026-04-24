"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Hotel {
  pk: number;
  register: string;
  CompanyName: string;
  PropertyName: string;
  location: string;
  property_type: string;
  phone: string;
  mail: string;
  is_approved: boolean;
  created_at: string;
}

export default function HotelInfo() {
  const { user } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  const getHotelId = (): string | null => {
    return user?.hotel || null;
  };

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const hotelId = getHotelId();
        if (!hotelId) throw new Error("Hotel ID not found in localStorage");

        const response = await fetch(`https://dev.kacc.mn/api/properties/${hotelId}`);
        if (!response.ok) throw new Error("Failed to fetch hotel data");

        const data = await response.json();
        setHotel(data);
      } catch (error) {
        console.error("Error fetching hotel info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, []);

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading...</div>;
  if (!hotel) return <div className="text-center text-destructive py-10">No hotel info available</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-card border border-border shadow-sm rounded-xl space-y-4">
      <h2 className="text-xl font-semibold text-center text-foreground">{hotel.PropertyName}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-foreground">
        <Info label="Company" value={hotel.CompanyName} />
        <Info label="Registered" value={hotel.register} />
        <Info label="Location" value={hotel.location} />
        <Info label="Type" value={hotel.property_type} />
        <Info label="Phone" value={hotel.phone} />
        <Info label="Email" value={hotel.mail} />
        <Info label="Approved" value={hotel.is_approved ? "Yes" : "No"} />
        <Info label="Created at" value={new Date(hotel.created_at).toLocaleString()} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}:</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
