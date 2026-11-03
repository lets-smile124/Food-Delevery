import React, { useContext, useEffect } from 'react'
import "./Verify.css"
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import orderService from '../../services/OrderService';

const Verify = () => {

    const [searchParams,setSearchParams] = useSearchParams();
    const success = searchParams.get("success")
    const orderId = searchParams.get("orderId")
    const {url} = useContext(StoreContext);
    const navigate = useNavigate();

    const verifyPayment = async () => {
        try {
            const response = { data: await orderService.verifyOrder(orderId, success) };
            if (response.data.success) {
                navigate("/myorders");
            } else {
                navigate("/");
            }
        } catch (error) {
            console.log("Verify payment error:", error);
            navigate("/myorders");
        }
    };

    useEffect(() => {
        verifyPayment();
    }, [success, orderId]);


  return (
    <div  className='verify'>
        <div className="spinner">

        </div>
    </div>
  )
}

export default Verify