'use client'
import RegisterPage from "@/app/auth/register/Hotel/page";
// import HotelInfo from "./HotelInfo";
import Proceed from "@/app/auth/register/Hotel/Proceed";
import SixStepInfo from "./SixStepInfo";
import { useEffect, useState } from "react";


export default  function  registeHotel(){

    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  
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