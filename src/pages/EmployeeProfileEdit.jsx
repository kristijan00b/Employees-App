import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

const EmployeeProfileEdit = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [salaryTypeId, setSalaryTypeId] = useState("");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryTypes, setSalaryTypes] = useState([]);

  useEffect(() => {
    fetchEmployee();
    fetchSalary();
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

  const fetchSalary = async () => {
    // fetch salary types za select
    const { data: types, error: typesError } = await supabase
      .from("SalaryType")
      .select("*");
    if (typesError) console.log("SalaryType fetch error", typesError);
    setSalaryTypes(types || []);

    // fetch trenutna plata zaposlenog
    const { data: salary, error: salaryError } = await supabase
      .from("Salary")
      .select("amount, salary_type_id")
      .eq("employee_id", employeeId)
      .single(); // pretpostavljamo da je 1 salary po zaposlenom
    if (salaryError) console.log("Salary fetch error", salaryError);

    if (salary) {
      setSalaryTypeId(salary.salary_type_id);
      setSalaryAmount(salary.amount);
    }
  };

  const handleChange = (e) => {
    setEmployeeData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    // Update employee
    const { error: empError } = await supabase
      .from("Employee")
      .update(employeeData)
      .eq("id", employeeId);

    if (empError) {
      console.error("Employee update error:", empError);
      return;
    }

    // Update ili insert salary
    const { data: existingSalary } = await supabase
      .from("Salary")
      .select("id")
      .eq("employee_id", employeeId)
      .single();

    if (existingSalary) {
      // update existing salary
      const { error: salaryError } = await supabase
        .from("Salary")
        .update({
          salary_type_id: salaryTypeId,
          amount: parseFloat(salaryAmount),
        })
        .eq("employee_id", employeeId);

      if (salaryError) console.error("Salary update error:", salaryError);
    } else {
      // insert new salary
      const { error: salaryError } = await supabase.from("Salary").insert([
        {
          employee_id: employeeId,
          salary_type_id: salaryTypeId,
          amount: parseFloat(salaryAmount),
        },
      ]);

      if (salaryError) console.error("Salary insert error:", salaryError);
    }

    navigate(`/dashboard/employee-profile/${employeeId}`);
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="overflow-x-auto">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">First Name</p>
            <input
              name="first_name"
              value={employeeData.first_name}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Last Name</p>
            <input
              name="last_name"
              value={employeeData.last_name}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">E-mail</p>
            <input
              name="email"
              value={employeeData.email}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Phone</p>
            <input
              name="phone"
              value={employeeData.phone}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Country</p>
            <input
              name="country"
              value={employeeData.country}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">City</p>
            <input
              name="city"
              value={employeeData.city}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Address</p>
            <input
              name="address"
              value={employeeData.address}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Born Date</p>
            <input
              type="date"
              name="born_date"
              value={employeeData.born_date}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Salary Type</p>
            <select
              name="salaryTypeId"
              value={salaryTypeId}
              onChange={(e) => setSalaryTypeId(e.target.value)}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">-- Select --</option>
              {salaryTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Salary Amount</p>
            <input
              type="number"
              name="salaryAmount"
              value={salaryAmount}
              onChange={(e) => setSalaryAmount(e.target.value)}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileEdit;
