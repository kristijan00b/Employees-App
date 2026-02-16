import React, { useState } from "react";
import { supabase } from "../supabaseClient"; // proveri putanju

const RequestTimeOff = ({ employeeId }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const { data, error } = await supabase.from("PtoRequest").insert([
        {
          start_date: startDate,
          end_date: endDate,
          employee_id: employeeId, // ovde šaljemo employeeId
        },
      ]);

      if (error) throw error;

      setSuccessMessage("PTO request successfully submitted!");
      setStartDate("");
      setEndDate("");
    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <div>
        <label className="block text-gray-700 mb-1 text-xs">Start Date</label>
        <input
          type="date"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-1 text-xs">End Date</label>
        <input
          type="date"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          {loading ? "Submitting..." : "Request Time Off"}
        </button>
      </div>

      <div className="md:col-span-3 mt-2">
        {successMessage && <p className="text-green-600">{successMessage}</p>}
        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      </div>
    </form>
  );
};

export default RequestTimeOff;
