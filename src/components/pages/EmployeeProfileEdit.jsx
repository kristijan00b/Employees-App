import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

const EmployeeProfileEdit = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [employeeId]);

  const fetchEmployee = async () => {
    const { data, error } = await supabase
      .from("Employee")
      .select("*")
      .eq("id", employeeId)
      .single();

    if (error) {
      console.error(error);
    } else {
      setEmployeeData(data);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setEmployeeData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from("Employee")
      .update(employeeData)
      .eq("id", employeeId);

    if (error) {
      console.error("Update error:", error);
      return;
    }

    navigate(`/dashboard/employee-profile/${employeeId}`);
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="overflow-x-auto p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-1">
          Edit {employeeData.first_name} {employeeData.last_name}
        </h2>
        <div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(-1)}
              className="hover:cursor-pointer px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleUpdate}
              className="hover:cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
      <div className="mb-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-xs">First Name</p>
            <input
              name="first_name"
              value={employeeData.first_name}
              onChange={handleChange}
              className="input bg-white p-2 rounded-md max-w-80 shadow"
            />
          </div>
          <div>
            <p className="text-gray-500 text-xs">Last Name</p>
            <input
              name="last_name"
              value={employeeData.last_name}
              onChange={handleChange}
              className="input bg-white p-2 rounded-md max-w-80 shadow"
            />
          </div>
          <div>
            <p className="text-gray-500 text-xs">E-mail</p>
            <input
              name="email"
              value={employeeData.email}
              onChange={handleChange}
              className="input bg-white p-2 rounded-md max-w-80 shadow"
            />
          </div>
          <div>
            <p className="text-gray-500 text-xs">Phone</p>
            <input
              name="phone"
              value={employeeData.phone}
              onChange={handleChange}
              className="input bg-white p-2 rounded-md max-w-80 shadow"
            />
          </div>
          <div>
            <p className="text-gray-500 text-xs">Country</p>
            <input
              name="country"
              value={employeeData.country}
              onChange={handleChange}
              className="input bg-white p-2 rounded-md max-w-80 shadow"
            />
          </div>
          <div>
            <p className="text-gray-500 text-xs">City</p>
            <input
              name="city"
              value={employeeData.city}
              onChange={handleChange}
              className="input bg-white p-2 rounded-md max-w-80 shadow"
            />
          </div>
          <div>
            <p className="text-gray-500 text-xs">Address</p>
            <input
              name="address"
              value={employeeData.address}
              onChange={handleChange}
              className="input bg-white p-2 rounded-md max-w-80 shadow"
            />
          </div>
          <div>
            <p className="text-gray-500 text-xs">Born Date</p>
            <input
              type="date"
              name="born_date"
              value={employeeData.born_date}
              onChange={handleChange}
              className="input bg-white p-2 rounded-md max-w-80 shadow"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileEdit;
