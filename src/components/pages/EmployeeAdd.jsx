import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Link, useNavigate } from "react-router-dom";

const EmployeeAdd = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [bornDate, setBornDate] = useState("");
  const [startWorkData, setStartWorkData] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");

  const [workStatuses, setWorkStatuses] = useState([]);
  const [positions, setPositions] = useState([]);

  const addNewEmployee = async () => {
    const newEmployeeData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      country: country,
      city: city,
      address: address,
      born_date: bornDate,
      start_work_date: startWorkData,
      work_status_id: selectedWorkStatus,
      position_id: selectedPosition,
    };

    const { data, error } = await supabase
      .from("Employee")
      .insert([newEmployeeData])
      .single();

    if (error) {
      console.log("Insert employee data error ", error);
    } else {
      console.log("New employee", data);
    }
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setCountry("");
    setCity("");
    setAddress("");
    setBornDate("");
    setStartWorkData("");
    setSelectedWorkStatus("");
    setSelectedPosition("");
  };

  const fetchDropdownData = async () => {
    const { data: workStatusData, error: wsError } = await supabase
      .from("WorkStatus")
      .select("*");

    const { data: positionData, error: posError } = await supabase
      .from("Position")
      .select("*");

    if (wsError) console.log("WorkStatus error:", wsError);
    if (posError) console.log("Position error:", posError);

    setWorkStatuses(workStatusData || []);
    setPositions(positionData || []);
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  return (
    <div className="overflow-x-auto p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Add New Employee</h2>
        <Link
          to="/dashboard/employees-list"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        >
          Back to Employees List
        </Link>
      </div>
      <div className=" mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1 ">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Doe"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0641234567"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="employee@gmail.com"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Born Date</label>
              <input
                type="date"
                value={bornDate}
                onChange={(e) => setBornDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Start Work Date
              </label>
              <input
                type="date"
                value={startWorkData}
                onChange={(e) => setStartWorkData(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Florida"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Miami"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main St"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Work Status</label>
              <select
                value={selectedWorkStatus}
                onChange={(e) => setSelectedWorkStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">--</option>
                {workStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Position</label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">--</option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={addNewEmployee}
              className="hover:cursor-pointer px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeAdd;
