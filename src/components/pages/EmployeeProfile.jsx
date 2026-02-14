import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

const EmployeeProfile = () => {
  const { employeeId } = useParams();
  const [employeeData, setEmployeeData] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const navigate = useNavigate();

  const fetchEmployee = async () => {
    const { data, error } = await supabase
      .from("Employee")
      .select(`*,Position (name), WorkStatus (name)`)
      .eq("id", employeeId)
      .single();

    if (error) {
      console.log("Error fetching all employees", error);
    } else {
      console.log(data);
      setEmployeeData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployee();
  }, [employeeId]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!employeeData)
    return <p className="text-center mt-10">Employee not found</p>;

  return (
    <div className="overflow-x-auto p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-1">
          {employeeData.first_name} {employeeData.last_name}
        </h2>

        <button
          className="hover:cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          onClick={() =>
            navigate(`/dashboard/employee-profile/${employeeId}/edit`)
          }
        >
          Edit Employee
        </button>
      </div>

      {/* Personal Info */}
      <div className="mb-5">
        <h3 className="text-xl font-semibold mb-3 pb-1 pl-3 bg-blue-500 text-white rounded-md">
          Personal Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-500 text-xs">First Name</p>
            <p className="text-gray-900 font-medium">
              {employeeData.first_name}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Last Name</p>
            <p className="text-gray-900 font-medium">
              {employeeData.last_name}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Born Date</p>
            <p className="text-gray-900 font-medium">
              {employeeData.born_date}
            </p>
          </div>
        </div>
      </div>

      {/* Work Info */}
      <div className="mb-5">
        <h3 className="text-xl font-semibold mb-3 pb-1 pl-3 bg-blue-500 text-white rounded-md">
          Work Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-500 text-xs">Start Work Date</p>
            <p className="text-gray-900 font-medium">
              {employeeData.start_work_date}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Work Status</p>
            <p className="text-gray-900 font-medium">
              {employeeData.WorkStatus?.name}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Position</p>
            <p className="text-gray-900 font-medium">
              {employeeData.Position?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div>
        <h3 className="text-xl font-semibold mb-3 pb-1 pl-3 bg-blue-500 text-white rounded-md">
          Contact Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div>
            <p className="text-gray-500 text-xs">Email</p>
            <p className="text-gray-900 font-medium">{employeeData.email}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Phone</p>
            <p className="text-gray-900 font-medium">{employeeData.phone}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-500 text-xs">Country</p>
            <p className="text-gray-900 font-medium">{employeeData.country}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">City</p>
            <p className="text-gray-900 font-medium">{employeeData.city}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Address</p>
            <p className="text-gray-900 font-medium">{employeeData.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
