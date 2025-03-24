import { useEffect, useState } from "react";
import useAxiosFetch from "../../../hooks/useAxiosFetch";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { BlobProvider } from "@react-pdf/renderer";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import { writeFile } from "xlsx";
import Swal from "sweetalert2"; // Make sure you import Swal
import PaymentReport from "./Reports/PaymentReports";
import Button from "../../../components/Button/Button";
import InputField from "../../../components/InputField/InputField";

const PaymentDetails = () => {
  const axiosFetch = useAxiosFetch();
  const axiosSecure = useAxiosSecure();
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    axiosFetch
      .get("/api/payments/")
      .then((res) => {
        const data = Array.isArray(res.data?.transactionLogs) ? res.data.transactionLogs : [];
        setPaymentDetails(data);
        fetchUserNames(data);
      })
      .catch((err) => console.error("Error fetching payments:", err));
  }, []);

  const fetchUserNames = async (payments) => {
    const updatedUserNames = { ...userNames };
    const fetchPromises = payments.map(async (payment) => {
      if (!updatedUserNames[payment.userId]) {
        try {
          const response = await axiosSecure.get(`users/${payment.userId}`);
          updatedUserNames[payment.userId] = response.data?.name || 'Unknown';
        } catch (error) {
          console.error(`Error fetching user name for user ID ${payment.userId}:`, error);
          updatedUserNames[payment.userId] = error.response
            ? `Error ${error.response.status}: ${error.response.data.message || 'User not found'}`
            : 'Network error';
        }
      }
    });
  
    await Promise.all(fetchPromises);
    setUserNames(updatedUserNames);
  };  

  const generateExcelFile = () => {
    const filteredDataList = filteredPayment.map((payment) => ({
      Id: payment._id,
      User: userNames[payment.userId] || "Unknown",
      Amount: payment.amount,
      TransactionType: payment.transactionType,
      Date: new Date(payment.date).toLocaleString(),
    }));

    if (filteredDataList.length === 0) {
      Swal.fire({
        title: "No Data",
        text: "There are no records to export.",
        icon: "info",
      });
      return;
    }

    const ws = XLSX.utils.json_to_sheet(filteredDataList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payment Details Report");
    writeFile(wb, "payment_details_report.xlsx");
  };

  const handleButtonClick = () => {
    generateExcelFile();
  };

  const filteredPayment = Array.isArray(paymentDetails)
    ? paymentDetails
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .filter((payment) => {
          const matchesSearch = payment.transactionType?.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesPayment = paymentFilter ? payment?.transactionType?.toLowerCase() === paymentFilter.toLowerCase() : true;
          return matchesSearch && matchesPayment;
        })
    : [];

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-center text-4xl font-bold my-7">Financial Details</h1>

      {/* Search and Filter Inputs */}
      <div className="mb-4 flex gap-4">
        <InputField
          type="text"
          placeholder="Search payment by user name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <InputField
          type="select"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          options={[
            { value: "", label: "All Types" },
            { value: "cashback", label: "Cashback" },
            { value: "monthly fee", label: "Monthly Fee" },
            { value: "bill payment", label: "Bill Payment" },
            { value: "special waste fee", label: "Special Waste Fee" },
          ]}
        />

        <BlobProvider
          document={<PaymentReport dataList={filteredPayment} />}
          fileName="PaymentDetailReport.pdf"
        >
          {({ url }) => (
            <a href={url} target="_blank" className="flex items-center">
              <FaFilePdf className="text-3xl text-red-600" />
            </a>
          )}
        </BlobProvider>

        <Button onClick={handleButtonClick} className="flex items-center">
          <FaFileExcel className="text-3xl text-green-600" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="flex flex-col">
          <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              {filteredPayment.length === 0 ? (
                <p className="text-center text-gray-500">No payment found</p>
              ) : (
                <table className="min-w-full text-left text-sm font-light">
                  <thead className="border-b font-medium hidden md:table-header-group">
                    <tr>
                      <th scope="col" className="px-4 py-4">#</th>
                      <th scope="col" className="px-4 py-4">User Name</th>
                      <th scope="col" className="px-4 py-4">Amount</th>
                      <th scope="col" className="px-4 py-4">Transaction Type</th>
                      <th scope="col" className="px-4 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayment.map((payment, idx) => (
                      <tr
                        key={payment._id}
                        className="border-b transition duration-300 ease-in-out hover:bg-neutral-100"
                      >
                        <td className="whitespace-nowrap px-4 py-4 font-medium">{idx + 1}</td>
                        <td className="whitespace-nowrap px-4 py-4">{userNames[payment.userId] || "Loading..."}</td>
                        <td className="whitespace-nowrap px-4 py-4">{payment?.amount}</td>
                        <td className="whitespace-nowrap px-4 py-4">{payment?.transactionType}</td>
                        <td className="whitespace-nowrap px-4 py-4">{payment?.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
