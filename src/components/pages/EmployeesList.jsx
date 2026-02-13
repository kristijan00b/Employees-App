import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Link } from "react-router-dom";

const EmployeesList = () => {
  const [employeesList, setEmployeesList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [sortBy, setSortBy] = useState("first_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selected, setSelected] = useState("start_work_date-asc");
  const [searchEmployee, setSearchEmployee] = useState("");

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
      .select(`*,Position (name), WorkStatus (name)`)
      .order(sortBy, { ascending: sortOrder === "asc" });

    if (error) {
      console.log("Error fetching all employees", error);
    } else {
      console.log(data)
      setEmployeesList(data);
    }
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
    <div className="overflow-x-auto p-4 ">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        >
          Add Employee
        </Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 rounded-2xl shadow-lg bg-white px-4 py-3 w-md focus-within:ring-2 focus-within:ring-black/10 transition">
          <input
            type="text"
            placeholder="🔍︎ Search employees"
            onChange={(e) => setSearchEmployee(e.target.value)}
            className="w-full outline-none text-sm placeholder:text-gray-400"
          />
        </div>
        <div>
          <div>
            <select
              value={selected}
              onChange={handleChangeSort}
              className="hover:cursor-pointer flex items-center gap-2 rounded-2xl shadow-lg bg-white px-4 py-3 w-2xs focus-within:ring-2 focus-within:ring-black/10 transition"
            >
              <option value="start_work_date-asc">Start work date ⬇</option>
              <option value="start_work_date-desc">Start work date ⬆</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <table className="min-w-full border border-gray-200 shadow-lg">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Full name</th>
              <th className="px-4 py-2 text-left">Position</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">E-mail</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">View</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((employee, index) => (
              <tr
                key={employee.id}
                className={
                  index % 2 === 0
                    ? "hover:bg-yellow-50 bg-gray-50"
                    : "hover:bg-yellow-50 bg-white"
                }
              >
                <td className="px-4 py-2 border-b border-gray-200">
                  {index + currentPage * 10 - 9}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {employee.id}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {employee.first_name} {employee.last_name}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {employee.Position?.name}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {employee.WorkStatus?.name}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {employee.email}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {employee.phone}
                </td>
                <td
                  className="hover:cursor-pointer px-4 py-2 border-b border-gray-200 text-center"
                  onClick={() => setSelectedEmployeeId(employee.id)}
                >
                  📝
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        <button
          className="hover:cursor-pointer px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="hover:cursor-pointer px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmployeesList;
