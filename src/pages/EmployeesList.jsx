import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

const EmployeesList = () => {
  const [employeesList, setEmployeesList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selected, setSelected] = useState("start_work_date-asc");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  useEffect(() => {
    if (searchEmployee == "") {
      fetchAllEmployees();
    } else {
      fetchEmployees(searchEmployee);
    }
  }, [searchEmployee, sortBy, sortOrder]);

  const fetchEmployees = async (searchEmployee) => {
    const { data, error } = await supabase
      .from("Employee")
      .select(`*,Position (name), WorkStatus (name)`)
      .or(
        `first_name.ilike.${searchEmployee}%,last_name.ilike.${searchEmployee}%`,
      )
      .order(sortBy, { ascending: sortOrder === "asc" });

    if (error) {
      console.log("Error searching employees", error);
    } else if (data.length > 0) {
      setEmployeesList(data);
    } else {
      fetchAllEmployees();
    }
  };

  const fetchAllEmployees = async () => {
    const { data, error } = await supabase
      .from("Employee")
      .select(`*,Position (name), WorkStatus (name)`);

    if (error) {
      console.log("Error fetching all employees", error);
      return;
    }

    let sortedData = [...data];

    if (sortBy === "position") {
      sortedData.sort((a, b) => {
        const posA = a.Position?.name || "";
        const posB = b.Position?.name || "";

        if (sortOrder === "asc") {
          return posA.localeCompare(posB);
        } else {
          return posB.localeCompare(posA);
        }
      });
    } else {
      sortedData.sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];

        if (sortOrder === "asc") {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
    }

    setEmployeesList(sortedData);
  };

  const handleChangeSort = (e) => {
    const value = e.target.value;
    setSelected(value);

    const [newSortBy, newSortOrder] = value.split("-");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };
  // podesavanje stranica tabele
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = employeesList.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(employeesList.length / rowsPerPage);

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Employees</h2>
        <Link
          to="/dashboard/employee-add"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        >
          Add Employee
        </Link>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        {/* Search input */}
        <div className="flex items-center gap-2 rounded-2xl shadow-lg bg-white px-4 py-3 w-full md:w-md focus-within:ring-2 focus-within:ring-black/10 transition">
          <input
            type="text"
            placeholder="🔍︎ Search employees"
            onChange={(e) => setSearchEmployee(e.target.value)}
            className="w-full outline-none text-sm placeholder:text-gray-400"
          />
        </div>

        {/* Sort dropdown */}
        <div className="w-full md:w-auto">
          <select
            value={selected}
            onChange={handleChangeSort}
            className="hover:cursor-pointer flex items-center gap-2 rounded-2xl shadow-lg bg-white px-4 py-3 w-full md:w-3xs focus-within:ring-2 focus-within:ring-black/10 transition"
          >
            {/* START WORK DATE */}
            <option value="start_work_date-asc">Start work date ⬇</option>
            <option value="start_work_date-desc">Start work date ⬆</option>

            {/* ID */}
            <option value="id-asc">ID ⬇</option>
            <option value="id-desc">ID ⬆</option>

            {/* FIRST NAME */}
            <option value="first_name-asc">First name A–Z</option>
            <option value="first_name-desc">First name Z–A</option>

            {/* LAST NAME */}
            <option value="last_name-asc">Last name A–Z</option>
            <option value="last_name-desc">Last name Z–A</option>

            {/* POSITION */}
            <option value="position-asc">Position A–Z</option>
            <option value="position-desc">Position Z–A</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentRows.map((employee, index) => (
          <div
            key={employee.id}
            className="bg-white shadow-md rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition"
          >
            <div className="mb-2 border-b border-gray-200">
              <p className="text-xs text-gray-500">
                {index + currentPage * rowsPerPage - rowsPerPage + 1} employee
              </p>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500">ID</p>
              <p className="font-semibold text-lg">{employee.id}</p>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="font-semibold text-lg">
                {employee.first_name} {employee.last_name}
              </p>
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-500">Position</p>
              <p className="font-medium">{employee.Position?.name}</p>
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm break-all">{employee.email}</p>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm">{employee.phone}</p>
            </div>

            <Link
              to={`/dashboard/employee-profile/${employee.id}`}
              className="block text-center bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition text-sm"
            >
              View Profile
            </Link>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        <button
          className={`px-3 py-1 rounded 
                      ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 hover:bg-gray-300 hover:cursor-pointer"
                      }
                    `}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          {"<<"} Prev
        </button>

        <span className="px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>

        <button
          className={`px-3 py-1 rounded 
                      ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 hover:bg-gray-300 hover:cursor-pointer"
                      }
                    `}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next {">>"}
        </button>
      </div>
    </div>
  );
};

export default EmployeesList;
