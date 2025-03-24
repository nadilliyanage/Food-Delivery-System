import React, { useEffect, useState } from "react";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useUser from "../../hooks/useUser";
import visa from "../../assets/gallery/cards/visa.png";
import master from "../../assets/gallery/cards/mastercard.png";
import amex from "../../assets/gallery/cards/amex.png";
import axios, { HttpStatusCode } from "axios";
import Swal from "sweetalert2";
import Scroll from "../../hooks/useScroll.jsx";

const CardPayment = () => {
  const { currentUser } = useUser();
  const [cardNumber, setCardNumber] = useState("");
  const [formattedCardNumber, setFormattedCardNumber] = useState("");
  const [cardType, setCardType] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cvv, setCvv] = useState("");
  const location = useLocation();
  const { amount } = location.state || {};
  const [clientSecret, setClientSecret] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const createPaymentIntent = async () => {
      if (currentUser && amount) {
        try {
          const response = await axios.post(
            `http://localhost:3000/api/payments/createPaymentIntent`,
            {
              userId: currentUser._id,
              amount: Number(amount),
              currency: "LKR",
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.status === HttpStatusCode.Ok) {
            setClientSecret(response.data.clientSecret);
          }
        } catch (error) {
          console.error("Error in create payment intent:", error);
        }
      }
    };

    createPaymentIntent();
  }, [amount, currentUser]);

  // Function to detect card type based on card number
  const detectCardType = (number) => {
    const visaRegex = /^4[0-9]{0,}$/;
    const mastercardRegex = /^5[1-5][0-9]{0,}$/;
    const amexRegex = /^3[47][0-9]{0,}$/;

    if (visaRegex.test(number)) {
      return "visa";
    } else if (mastercardRegex.test(number)) {
      return "mastercard";
    } else if (amexRegex.test(number)) {
      return "amex";
    } else {
      return ""; // Unknown card type
    }
  };

  // Format the card number with spaces
  const formatCardNumber = (number) => {
    return number
      .replace(/\s?/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
  };

  // Handle card number input change and card type detection
  const handleCardNumberChange = (e) => {
    let number = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
    const formattedNumber = formatCardNumber(number); // Format card number
    setFormattedCardNumber(formattedNumber);
    setCardNumber(number);

    const detectedCardType = detectCardType(number);
    setCardType(detectedCardType);
  };

  // Handle expiration date input (MM/YY)
  const handleExpiryDateChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
    if (input.length <= 4) {
      if (input.length > 2) {
        input = `${input.slice(0, 2)}/${input.slice(2)}`; // Format as MM/YY
      }
      setExpiryDate(input);
    }
  };

  const handleCardHolderNameChange = (e) => {
    const input = e.target.value;
    setCardHolderName(input);
  };

  // Handle CVV input (3 or 4 digits based on card type)
  const handleCvvChange = (e) => {
    const maxCvvLength = cardType === "amex" ? 4 : 3; // American Express uses 4 digits for CVV, others use 3
    const input = e.target.value.replace(/\D/g, "").slice(0, maxCvvLength);
    setCvv(input);
  };

  // Function to render the card type logo
  const renderCardTypeLogo = () => {
    switch (cardType) {
      case "visa":
        return <img src={visa} alt="Visa" className="w-10 h-10" />;
      case "mastercard":
        return <img src={master} alt="MasterCard" className="w-10 h-10" />;
      case "amex":
        return <img src={amex} alt="AmericanExpress" className="w-10 h-10" />;
      default:
        return <div className="w-10 h-10 bg-gray-200 rounded"></div>; // Empty placeholder
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:3000/api/payments/confirmPayment`,
        {
          userId: currentUser._id,
          amount: Number(amount),
          cardNumber: cardNumber,
          cvv: cvv,
          expiryDate: expiryDate,
          clientSecret: clientSecret,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === HttpStatusCode.Ok) {
        Swal.fire({
          icon: "success",
          title: "Payment successful!",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/payments");
      } else {
        Swal.fire({
          icon: "error",
          title: "Payment failed!",
          text: "Please check your details and try again.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Payment failed!",
        text: "Something went wrong. Please try again later.",
      });
    }
  };

  return (
    <div className="min-h-screen p-6 flex justify-center items-center">
      <Scroll />
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-6">
        <Link to="../../payments/make-payment">
          <MdOutlineArrowBackIosNew className="text-3xl mb-4" />
        </Link>

        <h2 className="text-center text-2xl font-bold mb-8">Card Payment</h2>

        <form onSubmit={handleSubmit}>
          {/* Card Number Input with Card Type Image */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <div className="flex items-center">
              {renderCardTypeLogo()}
              <input
                type="text"
                value={formattedCardNumber}
                onChange={handleCardNumberChange}
                maxLength="19"
                className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 ml-4"
                placeholder="Enter card number"
              />
            </div>
          </div>

          {/* Name on Card */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name on Card
            </label>
            <input
              type="text"
              onChange={handleCardHolderNameChange}
              value={cardHolderName}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter name as on card"
            />
          </div>

          {/* Expiration Date and CVV */}
          <div className="mb-10 flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                maxLength="5"
                className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="MM/YY"
              />
            </div>
            {/* CVV */}
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="password"
                value={cvv}
                onChange={handleCvvChange}
                maxLength={cardType === "amex" ? 4 : 3}
                className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="CVV"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-secondary rounded-xl p-4 text-white px-20 hover:scale-105 duration-300"
          >
            {amount && <div>Pay Rs. {Number(amount).toFixed(2)}</div>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CardPayment;
