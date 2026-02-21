import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
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
  const [pto, setPto] = useState(0);
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedSalaryType, setSelectedSalaryType] = useState("");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryTypes, setSalaryTypes] = useState([]); // iz baze salaryType

  const [workStatuses, setWorkStatuses] = useState([]);
  const [positions, setPositions] = useState([]);

  const [successMessageEmployee, setSuccessMessageEmployee] = useState(null);

  const addNewEmployee = async (e) => {
  e.preventDefault();

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
    pto: pto,
    work_status_id: selectedWorkStatus,
    position_id: selectedPosition,
  };

  try {
    // 1️⃣ Dodaj zaposlenog
    const { data: employeeData, error: empError } = await supabase
      .from("Employee")
      .insert([newEmployeeData])
      .select()
      .single();

    if (empError) {
      console.log("Insert employee error:", empError);
      return;
    }

    // 2️⃣ Pozovi funkciju za salary sa ID-em novog zaposlenog
    await addSalary(employeeData.id, selectedSalaryType, salaryAmount, startWorkData);

    // 3️⃣ Poruka i reset polja
    setSuccessMessageEmployee({ firstName, lastName });
    setTimeout(() => setSuccessMessageEmployee(null), 3000);

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
    setSelectedSalaryType("");
    setSalaryAmount("");
    setPto(0);

  } catch (error) {
    console.log("Unexpected error:", error);
  }
};


  const addSalary = async (employeeId, salaryTypeId, amount) => {
    try {
      const { data, error } = await supabase.from("Salary").insert([
        {
          employee_id: employeeId,
          salary_type_id: salaryTypeId,
          amount: parseFloat(amount),
        },
      ]);

      if (error) {
        console.log("Insert salary error:", error);
      } else {
        console.log("Salary added:", data);
      }
    } catch (err) {
      console.log("Unexpected salary error:", err);
    }
  };

  const fetchDropdownData = async () => {
    const { data: workStatusData, error: wsError } = await supabase
      .from("WorkStatus")
      .select("*");

    const { data: positionData, error: posError } = await supabase
      .from("Position")
      .select("*");

    const { data: salaryTypeData, error: salaryTypeError } = await supabase
      .from("SalaryType")
      .select("*");

    if (wsError) console.log("WorkStatus error:", wsError);
    if (posError) console.log("Position error:", posError);
    if (salaryTypeError) console.log("SalaryType error:", salaryTypeError);

    setWorkStatuses(workStatusData || []);
    setPositions(positionData || []);
    setSalaryTypes(salaryTypeData || []);
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Zaposli</h2>
        <Link
          to="/dashboard/employees-list"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        >
          Svi Zaposleni
        </Link>
      </div>

      <div>
        {successMessageEmployee && (
          <div className="mb-4 rounded-2xl bg-green-100 border border-green-400 text-green-800 px-6 py-4 shadow-md transition-all">
            Osoba {successMessageEmployee.firstName}{" "}
            {successMessageEmployee.lastName}, uspešno zapošljena!
          </div>
        )}
      </div>
      <div className="mx-auto p-5 bg-white rounded-lg shadow-md mt-5">
        <form onSubmit={addNewEmployee}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1 ">Ime</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Neko"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Prezime</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nekic"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Telefon</label>
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
              <label className="block text-gray-700 mb-1">Datum rođenja</label>
              <input
                type="date"
                value={bornDate}
                onChange={(e) => setBornDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Datum zapošljenja
              </label>
              <input
                type="date"
                value={startWorkData}
                onChange={(e) => setStartWorkData(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Zemlja</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Serbia"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Grad</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Beograd"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Adresa</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Gavrila Principa 1"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">
                Godišnje dana odmora
              </label>
              <input
                type="number"
                value={pto}
                min={0}
                max={50}
                onChange={(e) => setPto(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Gavrila Principa 1"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Status zaposlenja</label>
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
              <label className="block text-gray-700 mb-1">Pozicija</label>
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

            <div>
              <label className="block text-gray-700 mb-1">Tip plate</label>
              <select
                value={selectedSalaryType}
                onChange={(e) => setSelectedSalaryType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">--</option>
                {salaryTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Plata</label>
              <input
                type="number"
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Amount"
                required
                min="0"
                max="999999"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="hover:cursor-pointer px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
            >
              Sačuvaj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeAdd;
