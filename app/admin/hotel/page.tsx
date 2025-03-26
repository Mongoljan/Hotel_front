'use client'
import RegisterPage from "@/app/auth/register/Hotel/Hotel";
// import HotelInfo from "./HotelInfo";
import Proceed from "@/app/auth/register/Hotel/Proceed";
import SixStepInfo from "./SixStepInfo";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";


export default  function  registeHotel(){

    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  if(token){
    const user =jwtDecode(token);
    console.log(user);
  }

  
  
      const [proceed, setProceed] = useState(0);
      console.log(proceed);
      useEffect(() => {
        console.log("Proceed value changed:", proceed);
        // You can add other logic here based on proceed value
      }, [proceed]);


    return(
        <div className="p-8">
            <div className="hidden">
             <SixStepInfo  proceed={proceed} setProceed={setProceed} />
             </div>
            {proceed == 2 && 
            <div>
              <h2 className="text-xl">HI, Welcome {userInfo?.name} !</h2>
              {userInfo?.email}
            
            <SixStepInfo proceed={proceed} setProceed={setProceed} />
            </div>
}
       
          
          {proceed ==0 &&       <div>
                <h2 className="text-xl">HI, Welcome {userInfo?.name} !</h2>
                {userInfo?.email}
                <Proceed proceed={proceed} setProceed={setProceed} />

            </div>
}
{proceed == 1 && <RegisterPage proceed={proceed} setProceed={setProceed}/>
            }

           


        </div>
    )
}