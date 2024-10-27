'use client'
import AdminDashboard from './Dashboard';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

// Define interface for the hotel data
interface Hotel {
  pk: number;
  hotel_name: string;
  email: string;
  contact: string;
  address: string;
  map_url: string;
  gst_number: string;
  food_gst_percentage: string;
  room_gst_percentage: string;
  joined_date: string;
  hotel_owner: number;
}

export default function Dashboard() {
  const [hotels, setHotels] = useState<Hotel[]>([]); // Type the hotel state
  const [loading, setLoading] = useState<boolean>(true); // Type the loading state
  const [error, setError] = useState<string | null>(null); // Type the error state

  useEffect(() => {
    async function fetchData() {
      try {
        const requestBody = {
          hotel_owner: Cookies.get('pk'),
          token: Cookies.get('jwtToken'),
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hotels/owner/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data: Hotel[] = await response.json(); // Type the response as an array of Hotel
        console.log('Here is the data:', data);
        setHotels(data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError((err as Error).message); // Ensure err is typed as an Error object
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="text-black mt-[20px] p-[20px]">
       <div className="text-black flex flex-wrap gap-x-12 gap-y-5  ">
      {hotels.length > 0 ? (
          hotels.map((hotel) => (
            <div className="bg-white  rounded-[5px] w-[350px] h-[200px] p-5  " key={hotel.pk}>
              <h3>{hotel.hotel_name}</h3>
              <p>Email: {hotel.email}</p>
              <p>Contact: {hotel.contact}</p>
              <p>Address: {hotel.address}</p>
              <a href={hotel.map_url} target="_blank" rel="noopener noreferrer">
                View on map
              </a>
            </div>
          ))
        ) : (
          <p>No hotels available.</p>
        )}
              </div>
      {/* <AdminDashboard /> */}
     
        

    </div>
  );
}
