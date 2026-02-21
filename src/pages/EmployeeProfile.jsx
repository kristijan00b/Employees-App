import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { formatDate } from "../utils/date";

const EmployeeProfile = () => {
  const { employeeId } = useParams();
  const [employeeData, setEmployeeData] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [salaryData, setSalaryData] = useState(null);
  const [spentPto, setSpentPto] = useState(0);
  const [scheduledPtos, setScheduledPtos] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  const fetchSalary = async () => {
    const { data, error } = await supabase
      .from("Salary")
      .select("amount, SalaryType(name)")
      .eq("employee_id", employeeId)
      .single(); // pretpostavljamo da je samo jedan aktivan salary po zaposlenom

    if (error) {
      console.log("Error fetching salary:", error);
    } else {
      setSalaryData(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // kreiraj sve datume između start i end
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dates = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d)); // dodaj kopiju datuma
      }

      // ubaci svaki datum u CheckCame sa shift 4
      for (const date of dates) {
        const dayStr = date.toISOString().split("T")[0]; // yyyy-mm-dd
        const { error } = await supabase.from("CheckCame").insert([
          {
            employee_id: employeeId,
            day: dayStr,
            shift: 4, // oznacava PTO
          },
        ]);
        if (error) throw error;
      }

      setSuccessMessage("Odmor uspešno dodat!");
      setStartDate("");
      setEndDate("");

      // refresuj PTO datume
      fetchPtos();
    } catch (err) {
      console.log(err);
      setErrorMessage("Greška pri upisu odmora.");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchPtos = async () => {
    try {
      const { data, error } = await supabase
        .from("CheckCame")
        .select("day")
        .eq("employee_id", employeeId)
        .eq("shift", 4)
        .order("day", { ascending: true });

      if (error) throw error;

      setScheduledPtos(data || []);
      setSpentPto(data?.length || 0);
    } catch (err) {
      console.log("Error fetching PTOs:", err);
    }
  };

  const handleCancelPto = async (day) => {
    try {
      const { error } = await supabase
        .from("CheckCame")
        .delete()
        .eq("employee_id", employeeId)
        .eq("day", day)
        .eq("shift", 4);

      if (error) throw error;

      // refresuj PTO listu
      fetchPtos();
    } catch (err) {
      console.log("Error cancelling PTO:", err);
    }
  };
  useEffect(() => {
    fetchEmployee();
    fetchSalary();
    fetchPtos();
  }, [employeeId]);

  return (
    <div className="overflow-x-auto">
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
          Izmeni
        </button>
      </div>

      {/* Personal Info */}
      <div className="mb-5">
        <h3 className="text-md font-semibold mb-3 pl-3 bg-blue-500 text-white rounded-md">
          Osnovni podaci
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-500 text-xs">Ime</p>
            <p className="text-gray-900 font-medium">
              {employeeData.first_name}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Prezime</p>
            <p className="text-gray-900 font-medium">
              {employeeData.last_name}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Datum Rođenja</p>
            <p className="text-gray-900 font-medium">
              {formatDate(employeeData.born_date)}
            </p>
          </div>
        </div>
      </div>

      {/* Work Info */}
      <div className="mb-5">
        <h3 className="text-md font-semibold mb-3 pl-3 bg-blue-500 text-white rounded-md">
          Zaposlenje
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-500 text-xs">Datum zaposlenja</p>
            <p className="text-gray-900 font-medium">
              {formatDate(employeeData.start_work_date)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Status</p>
            <p className="text-gray-900 font-medium">
              {employeeData.WorkStatus?.name}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Pozicija</p>
            <p className="text-gray-900 font-medium">
              {employeeData.Position?.name}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Tip plate</p>
            <p className="text-gray-900 font-medium">
              {salaryData?.SalaryType?.name || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Plata</p>
            <p className="text-gray-900 font-medium">
              {salaryData?.amount != null
                ? `${salaryData.amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RSD`
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mb-5">
        <h3 className="text-md font-semibold mb-3 pl-3 bg-blue-500 text-white rounded-md">
          Kontakt
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div>
            <p className="text-gray-500 text-xs">E-mail</p>
            <p className="text-gray-900 font-medium">{employeeData.email}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Telefon</p>
            <p className="text-gray-900 font-medium">{employeeData.phone}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-500 text-xs">Zemlja</p>
            <p className="text-gray-900 font-medium">{employeeData.country}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Grad</p>
            <p className="text-gray-900 font-medium">{employeeData.city}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Adresa</p>
            <p className="text-gray-900 font-medium">{employeeData.address}</p>
          </div>
        </div>
      </div>
      {/* PTO Info */}
      <div className="mb-5">
        <h3 className="text-md font-semibold mb-3 pl-3 bg-blue-500 text-white rounded-md">
          Odmor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div>
            <p className="text-gray-500 text-xs">Godišnje dana odmora</p>
            <p className="text-gray-900 font-medium">{employeeData.pto}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Dostupno</p>
            <p className="text-gray-900 font-medium">
              {employeeData.pto - spentPto}
            </p>
          </div>
        </div>
        <div>
          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="block text-gray-700 mb-1 text-xs">
                Prvi dan
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-white shadow rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-xs">
                Poslednji dan
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-white shadow rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="submit"
                disabled={loading}
                className="hover:cursor-pointer px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition disabled:opacity-50"
              >
                {submitting ? "Slanje..." : "Zakaži odmor"}
              </button>
            </div>

            <div className="md:col-span-3 mt-2">
              {successMessage && (
                <p className="text-green-600">{successMessage}</p>
              )}
              {errorMessage && <p className="text-red-600">{errorMessage}</p>}
            </div>
          </form>
        </div>
      </div>

      {/* PTO Requests List */}
      <div className="mt-6">
        <h3 className="text-md font-semibold mb-3 pl-3 bg-blue-500 text-white rounded-md">
          Zakazani odmori
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {scheduledPtos.length > 0 ? (
            scheduledPtos.map((pto) => (
              <div
                key={pto.day}
                className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center"
              >
                <p className="text-gray-900 font-medium mb-2">
                  {formatDate(pto.day)}
                </p>
                <button
                  className="hover:cursor-pointer px-3 py-1 text-xs text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition"
                  onClick={() => handleCancelPto(pto.day)}
                >
                  Otkaži
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full">Nema zakazanih odmora</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
