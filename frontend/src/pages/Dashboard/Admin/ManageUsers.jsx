import React, { useEffect, useState } from "react";
import useAxiosFetch from "../../../hooks/useAxiosFetch";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useUser from "../../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import { GrUpdate } from "react-icons/gr";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import UserReport from "./Reports/UserReports";
import { BlobProvider } from "@react-pdf/renderer";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import * as XLSX from "xlsx";
import { writeFile } from "xlsx";
import Button from "../../../components/Button/Button";
import InputField from "../../../components/InputField/InputField";

const ManageUsers = () => {
  const axiosFetch = useAxiosFetch();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    axiosFetch
      .get("/users")
      .then((res) => {
        const user = res.data.filter((user) => user.role === "user");
        const sortedUsers = user.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setUsers(sortedUsers);
        setDataList(sortedUsers);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure you want to delete the user?",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete User!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure
          .delete(`/delete-user/${id}`)
          .then(() => {
            Swal.fire({
              title: "Deleted!",
              text: "You have successfully deleted the user.",
              icon: "success",
            }).then(() => {
              window.location.reload();
            });
          })
          .catch((err) => console.log(err));
      }
    });
  };

  const generateExcelFile = () => {
    const filteredDataList = dataList.filter((user) => {
      const matchesRole = roleFilter ? user.role === roleFilter : true; // Check if role matches or no role is selected
      return matchesRole;
    });

    const rearrangedDataList = filteredDataList.map((user) => ({
      Name: user.name,
      Email: user.email,
      Role: user.role,
      Address: user.address,
      Telephone: user.phone,
      Latitude: user.latitude,
      Longitude: user.longitude,
    }));

    const ws = XLSX.utils.json_to_sheet(rearrangedDataList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users Report");
    writeFile(wb, "users_report.xlsx");
  };

  const handleButtonClick = () => {
    generateExcelFile();
  };

  // Filter users by search query and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user?.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter ? user?.role === roleFilter : true; // Check if role matches or no role is selected
    return matchesSearch && matchesRole;
  });

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-center text-4xl font-bold my-7">
        Manage <span className="text-secondary">Users</span>
      </h1>

      {/* Search and Filter Inputs */}
      <div className="mb-4 flex gap-4">
        <InputField
          placeholder="Search users by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex space-x-4">
          <BlobProvider
            document={<UserReport dataList={filteredUsers} />}
            fileName="UserReport.pdf"
          >
            {({ url }) => (
              <Button onClick={() => window.open(url)}>
                <FaFilePdf className="text-3xl text-red-600" />
              </Button>
            )}
          </BlobProvider>
          <Button onClick={handleButtonClick}>
            <FaFileExcel className="text-3xl text-green-600" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex flex-col">
          <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-gray-500">No users found</p>
              ) : (
                <table className="min-w-full text-left text-sm font-light">
                  <thead className="border-b font-medium hidden md:table-header-group">
                    <tr>
                      <th scope="col" className="px-4 py-4">
                        #
                      </th>
                      <th scope="col" className="px-4 py-4">
                        PHOTO
                      </th>
                      <th scope="col" className="px-4 py-4">
                        NAME
                      </th>
                      <th scope="col" className="px-4 py-4">
                        ROLE
                      </th>
                      <th scope="col" className="px-4 py-4">
                        UPDATE
                      </th>
                      <th scope="col" className="px-4 py-4">
                        DELETE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, idx) => (
                      <tr
                        key={user._id}
                        className="border-b transition duration-300 ease-in-out hover:bg-neutral-100"
                      >
                        <td className="whitespace-nowrap px-4 py-4 font-medium">
                          {idx + 1}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <img
                            src={user?.photoUrl}
                            alt=""
                            className="h-[35px] w-[35px] object-cover rounded-full"
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {user?.name}{" "}
                          {currentUser?._id === user._id && (
                            <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md">
                              You
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {user?.role}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <Button
                            className="bg-green-500 text-white flex items-center justify-between gap-2 px-4 py-2"
                            onClick={() =>
                              navigate(
                                navigate(`/dashboard/update-user/${user._id}`)
                              )
                            }
                          >
                            <span>Update</span>
                            <GrUpdate className="text-white" />
                          </Button>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <Button
                            className="bg-red-600 text-white flex items-center justify-between gap-2 px-4 py-2"
                            onClick={() => handleDelete(user._id)}
                          >
                            <span>Delete</span>
                            <MdDelete className="text-white" />
                          </Button>
                        </td>
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

export default ManageUsers;
