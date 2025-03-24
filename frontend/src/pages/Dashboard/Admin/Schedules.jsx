import { useNavigate } from "react-router-dom";
import useAxiosFetch from "../../../hooks/useAxiosFetch";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Table from "../../../components/Table/Table";
import InputField from "../../../components/InputField/InputField";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { BlobProvider } from "@react-pdf/renderer";
import ReqReport from "./Reports/ScheduleReports";
import * as XLSX from "xlsx";
import { writeFile } from "xlsx";
import Button from "../../../components/Button/Button";

const SchedulesWithExport = () => {
  const axiosFetch = useAxiosFetch();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [reqFilter, setReqFilter] = useState("");

  useEffect(() => {
    axiosFetch
      .get("/api/garbageRequests")
      .then((res) => {
        setRequests(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const filteredReq = requests.filter((request) => {
    const matchesSearch =
      request?.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request?.username?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesReq = reqFilter
      ? request?.type?.toLowerCase() === reqFilter.toLowerCase()
      : true;

    return matchesSearch && matchesReq;
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure you want to delete the schedule?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete schedule!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure
          .delete(`/api/garbageRequests/${id}`)
          .then(() => {
            Swal.fire({
              title: "Deleted!",
              text: "You have successfully deleted the schedule.",
              icon: "success",
            }).then(() => {
              window.location.reload();
            });
          })
          .catch((err) => console.log(err));
      }
    });
  };

  const generateExcelFile = (filteredDataList) => {
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
    XLSX.utils.book_append_sheet(wb, ws, "Request Report");
    writeFile(wb, "request_report.xlsx");
  };

  const handleExcelClick = () => {
    const filteredDataList = filteredReq.map((request) => ({
      Name: request.username,
      Type: request.type,
      Description: request.description,
      Date: new Date(request.date).toLocaleDateString(),
      Time: request.time,
      Status: request.status,
      RecyclableQuantity: request.recyclableQuantity,
      CashbackPrice: request.cashbackPrice,
      TotalCost: request.totalCost,
      CreatedAt: new Date(request.createdAt).toLocaleString(),
    }));
    generateExcelFile(filteredDataList);
  };

  const columns = [
    { accessor: "username", label: "Name", cell: (item) => item.username },
    { accessor: "type", label: "Type", cell: (item) => item.type },
    {
      accessor: "description",
      label: "Description",
      cell: (item) => item.description,
    },
    {
      accessor: "date",
      label: "Date",
      cell: (item) => new Date(item.date).toLocaleDateString(),
    },
    { accessor: "time", label: "Time", cell: (item) => item.time },
    { accessor: "status", label: "Status", cell: (item) => item.status },
    {
      accessor: "recyclableQuantity",
      label: "Recyclable Quantity",
      cell: (item) => item.recyclableQuantity,
    },
    {
      accessor: "cashbackPrice",
      label: "Cashback Price",
      cell: (item) => item.cashbackPrice,
    },
    {
      accessor: "totalCost",
      label: "Total Cost",
      cell: (item) => item.totalCost,
    },
    {
      accessor: "createdAt",
      label: "Created At",
      cell: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-center text-4xl font-bold my-7">Schedules</h1>
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
            { label: "Normal Waste", value: "normal waste" },
            { label: "Hazardous Waste", value: "hazardous waste" },
            { label: "E Waste", value: "e Waste" },
            { label: "Bulk Waste", value: "bulk" },
            { label: "Other Special Waste", value: "other special waste" },
          ]}
        />
        <div className="mb-4 flex gap-4">
          <BlobProvider
            document={<ReqReport dataList={filteredReq} />}
            fileName="SchedulesReport.pdf"
          >
            {({ url }) => (
              <a href={url} target="_blank" className="flex items-center">
                <FaFilePdf className="text-3xl text-red-600" />
              </a>
            )}
          </BlobProvider>
          <Button
            onClick={handleExcelClick}
            className="flex items-center py-2 px-4 rounded-md text-green-500"
          >
            <FaFileExcel className="text-3xl" />
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        data={filteredReq}
        renderRowActions={(item) => (
          <Button
            onClick={() => handleDelete(item.id)}
            className="bg-red-600 text-white flex items-center"
          >
            Delete
          </Button>
        )}
      />
    </div>
  );
};

export default SchedulesWithExport;
