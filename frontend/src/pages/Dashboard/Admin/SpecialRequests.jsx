import { useNavigate } from "react-router-dom";
import useAxiosFetch from "../../../hooks/useAxiosFetch";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import SpecialReqReport from "./Reports/SpecialReqReports";
import { BlobProvider } from "@react-pdf/renderer";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import { writeFile } from "xlsx";

// Reusable components
import Button from "../../../components/Button/Button";
import Table from "../../../components/Table/Table";
import InputField from "../../../components/InputField/InputField";

const SpecialRequests = () => {
  const axiosFetch = useAxiosFetch();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const [specialRequests, setSpecialRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [reqFilter, setReqFilter] = useState("");

  useEffect(() => {
    axiosFetch
      .get("/api/garbageRequests")
      .then((res) => {
        const specialReq = res.data.filter(
          (request) => request.type !== "Normal Waste"
        );
        setSpecialRequests(specialReq);
      })
      .catch((err) => console.log(err));
  }, []);

  const filteredSpecialReq = specialRequests.filter((specialReq) => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const matchesSearch =
      specialReq?.type?.toLowerCase().includes(lowercasedQuery) ||
      specialReq?.username?.toLowerCase().includes(lowercasedQuery);

    const matchesReq = reqFilter
      ? specialReq?.type?.toLowerCase() === reqFilter.toLowerCase()
      : true;

    return matchesSearch && matchesReq;
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure you want to delete the special request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete special request!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure
          .delete(`/api/garbageRequests/${id}`)
          .then(() => {
            Swal.fire("Deleted!", "Special request deleted.", "success");
            setSpecialRequests(specialRequests.filter((req) => req._id !== id));
          })
          .catch((err) => console.log(err));
      }
    });
  };

  const generateExcelFile = () => {
    const filteredDataList = filteredSpecialReq.map((specialReq) => ({
      Name: specialReq.username,
      Type: specialReq.type,
      Description: specialReq.description,
      Date: new Date(specialReq.date).toLocaleDateString(),
      Time: specialReq.time,
      Status: specialReq.status,
      RecyclableQuantity: specialReq.recyclableQuantity,
      CashbackPrice: specialReq.cashbackPrice,
      TotalCost: specialReq.totalCost,
      CreatedAt: new Date(specialReq.createdAt).toLocaleString(),
    }));

    if (filteredDataList.length === 0) {
      Swal.fire("No Data", "There are no records to export.", "info");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(filteredDataList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Special Requests Report");
    writeFile(wb, "special_request_report.xlsx");
  };

  const columns = [
    { label: "Name", accessor: "username", cell: (item) => item.username },
    { label: "Type", accessor: "type", cell: (item) => item.type },
    { label: "Description", accessor: "description", cell: (item) => item.description },
    { label: "Date", accessor: "date", cell: (item) => new Date(item.date).toLocaleDateString() },
    { label: "Time", accessor: "time", cell: (item) => item.time },
    { label: "Status", accessor: "status", cell: (item) => item.status },
    { label: "Recyclable Quantity", accessor: "recyclableQuantity", cell: (item) => item.recyclableQuantity },
    { label: "Cashback Price", accessor: "cashbackPrice", cell: (item) => item.cashbackPrice },
    { label: "Total Cost", accessor: "totalCost", cell: (item) => item.totalCost },
    { label: "Created At", accessor: "createdAt", cell: (item) => new Date(item.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-center text-4xl font-bold my-7">Special Requests</h1>

      <div className="mb-4 flex gap-4">
        <InputField
          type="text"
          placeholder="Search pending requests by name or type"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <InputField
          type="select"
          value={reqFilter}
          onChange={(e) => setReqFilter(e.target.value)}
          options={[
            { label: "All Types", value: "" },
            { label: "E Waste", value: "e waste" },
            { label: "Bulk Waste", value: "bulk" },
            { label: "Hazardous Waste", value: "hazardous waste" },
            { label: "Other Special Waste", value: "Other Special waste" },
          ]}
        />

        <BlobProvider
          document={<SpecialReqReport dataList={filteredSpecialReq} />}
          fileName="SpecialRequestsReport.pdf"
        >
          {({ url }) => (
            <a href={url} target="_blank" className="flex items-center">
              <FaFilePdf className="text-3xl text-red-600" />
            </a>
          )}
        </BlobProvider>

        <Button onClick={generateExcelFile}>
          <FaFileExcel className="text-3xl text-green-600" />
        </Button>
      </div>

      <Table
        columns={columns}
        data={filteredSpecialReq}
        renderRowActions={(item) => (
          <Button
            onClick={() => handleDelete(item._id)}
            className="bg-red-600 text-white flex items-center"
          >
            Delete <MdDelete className="ml-2" />
          </Button>
        )}
      />
    </div>
  );
};

export default SpecialRequests;
