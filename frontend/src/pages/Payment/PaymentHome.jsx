import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios, {HttpStatusCode} from 'axios';
import useUser from '../../hooks/useUser.jsx';
import garbage_money from '../../assets/gallery/cards/trash_money.png';
import Scroll from '../../hooks/useScroll.jsx';

const PaymentHome = () => {
    const [amount, setAmount] = useState(0);
    const navigate = useNavigate();
    const {currentUser} = useUser();
    const [isOverDue, setIsOverDue] = useState(false);

    useEffect(() => {
        const fetchDueAmount = async () => {
            if (currentUser) {
                try {
                    const response = await axios.get(`http://localhost:3000/api/payments/totalDueAmount/${currentUser._id}`);
                    if (response.status === HttpStatusCode.Ok) {
                        setAmount(Number(response.data.balance));
                        setIsOverDue(response.data.isOverDue);
                    }
                } catch (error) {
                    console.error('Payment error:', error);
                }
            }
        };

        fetchDueAmount();
    }, [currentUser]);

    return (
        <div className="min-h-screen p-6 flex justify-center items-center mt-6">
            <Scroll/>
            <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-6">
                {/* Image Section */}
                <div className="flex justify-center py-4 ">
                    <img
                        src={garbage_money} alt="Garbage"
                        className="h-40 w-auto"
                    />
                </div>

                {/* Total Due Amount Section */}
                {!isOverDue && <div className="bg-yellow-200 text-center py-4 rounded-xl mx-4">
                    <p className="text-xl font-semibold">Total Due Amount</p>
                    <p className="text-2xl text-red-600 font-bold">Rs. {amount.toFixed(2)}</p>
                    <p className="text-sm">Overdue On: Rs.6000.00</p>
                </div>}

                {/* Payment Overdue Section */}
                {isOverDue && <div className="bg-red-200 text-center py-4 px-4 rounded-xl mx-4">
                    <p className="text-xl font-bold text-red-600">Payment Overdue!!</p>
                    <p className="text-sm text-gray-700">
                        Dear customer, unfortunately one or more of your payments are overdue.
                    </p>
                    <p className="text-sm text-gray-700">
                        The total overdue charges is found below,
                    </p>
                    <p className="text-2xl text-red-600 font-bold">Total Overdue Amount: </p>
                    <p className="text-2xl text-red-600 font-bold">Rs. {amount.toFixed(2)}</p>
                </div>}

                {/* Buttons Section */}
                <div className="p-4 space-y-4">
                    <button
                        onClick={() => navigate(`/payments/make-payment`)}
                        className="w-full bg-secondary rounded-xl p-4  text-white px-10 hover:scale-105 duration-300"
                    >
                        Make Payments
                    </button>

                    <button
                        onClick={() => navigate(`/payments/payment-history`)}
                        className="w-full bg-secondary rounded-xl p-4 text-white px-10 hover:scale-105 duration-300"
                    >
                        View Transaction History
                    </button>

                    
                </div>
            </div>
        </div>
    );
};

export default PaymentHome;
