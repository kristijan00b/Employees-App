import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const EmployeeProfile = () => {
  const { employeeId } = useParams();
  const [employeeData, setEmployeeData] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // za PTO submit
  const [ptos, setPtos] = useState([]);
  const [spentPto, setSpentPto] = useState(0);

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

  const fetchPtos = async () => {
    const { data, error } = await supabase
      .from("PtoRequest")
      .select("*")
      .eq("employee_id", employeeId);

    if (error) {
      console.log("Error fetching ptos", error);
    } else {
      setPtos(data);

      const spentPto = data.reduce((total, pto) => {
        const start = new Date(pto.start_date);
        const end = new Date(pto.end_date);

        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        return total + diffDays;
      }, 0);

      setSpentPto(spentPto);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validacija da endDate nije pre startDate
    if (end < start) {
      setErrorMessage("End date cannot be before start date");
      setSubmitting(false);
      return;
    }

    // Broj traženih dana
    const requestedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Dostupni dani
    const availableDays = employeeData.pto - spentPto;

    if (requestedDays > availableDays) {
      setErrorMessage(
        `Not enough available PTO days. You have ${availableDays} days left.`,
      );
      setSubmitting(false);
      return;
    }

    // **Provera preklapanja sa postojećim PTO-ima**
    const overlap = ptos.some((pto) => {
      const ptoStart = new Date(pto.start_date);
      const ptoEnd = new Date(pto.end_date);

      // Ako postoji bilo kakvo preklapanje intervala
      return start <= ptoEnd && end >= ptoStart;
    });

    if (overlap) {
      setErrorMessage("This PTO request overlaps with an existing PTO.");
      setSubmitting(false);
      return;
    }

    // Ako je sve ok, šaljemo u bazu
    try {
      const { data, error } = await supabase.from("PtoRequest").insert([
        {
          employee_id: employeeId,
          start_date: startDate,
          end_date: endDate,
        },
      ]);

      if (error) {
        console.error("Error inserting PTO request:", error);
        setErrorMessage("Failed to submit PTO request");
      } else {
        setSuccessMessage("PTO request submitted successfully!");
        setStartDate("");
        setEndDate("");
        fetchPtos(); // osvežava listu PTO-a i spentPto
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Something went wrong");
    }

    setSubmitting(false);
  };

  // Funkcija za otkazivanje PTO-a
  const handleCancelPto = async (ptoId, start, end, days) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel PTO from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}?`,
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("PtoRequest")
        .delete()
        .eq("id", ptoId);

      if (error) {
        console.error("Error deleting PTO:", error);
        alert("Failed to cancel PTO.");
      } else {
        // Ažurira lokalni state odmah
        setPtos((prev) => prev.filter((p) => p.id !== ptoId));
        setSpentPto((prev) => prev - days);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  useEffect(() => {
    fetchPtos();
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
        <h3 className="text-md font-semibold mb-3 pl-3 bg-blue-500 text-white rounded-md">
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
        <h3 className="text-md font-semibold mb-3 pl-3 bg-blue-500 text-white rounded-md">
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
      <div className="mb-5">
        <h3 className="text-md font-semibold mb-3 pl-3 bg-blue-500 text-white rounded-md">
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
      {/* PTO Info */}
      <div className="mb-5">
        <h3 className="text-md font-semibold mb-3 pl-3 bg-blue-500 text-white rounded-md">
          PTO
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div>
            <p className="text-gray-500 text-xs">Annually days off</p>
            <p className="text-gray-900 font-medium">{employeeData.pto}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Available days off</p>
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
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 shadow rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-xs">
                End Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 shadow rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {submitting ? "Submitting..." : "Request Time Off"}
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
          Scheduled PTOs
        </h3>

        {ptos.length === 0 ? (
          <p className="text-gray-500 pl-3">No PTO requests yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ptos.map((pto) => {
              const start = new Date(pto.start_date);
              const end = new Date(pto.end_date);
              const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

              return (
                <div
                  key={pto.id}
                  className="relative border border-gray-300 rounded-lg p-4 shadow hover:shadow-md transition"
                >
                  {/* Dugme X */}
                  <button
                    onClick={() => handleCancelPto(pto.id, start, end, days)}
                    className="hover: cursor-pointer absolute top-2 right-4 text-gray-400 hover:text-red-500 font-bold"
                  >
                    ×
                  </button>

                  <p className="text-gray-500 text-xs">Start Date</p>
                  <p className="text-gray-900 font-medium mb-2">
                    {start.toLocaleDateString()}
                  </p>

                  <p className="text-gray-500 text-xs">End Date</p>
                  <p className="text-gray-900 font-medium mb-2">
                    {end.toLocaleDateString()}
                  </p>

                  <p className="text-gray-500 text-xs">Days</p>
                  <p className="text-gray-900 font-medium">{days}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;
