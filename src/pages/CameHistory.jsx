import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const CameHistory = () => {
  // Dan koji trenutno gledamo
  const [currentDay, setCurrentDay] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  const [checks, setChecks] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Fetch svih zaposlenih
  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("Employee")
      .select(`*,Position (name), WorkStatus (name)`)
      .order("id", { ascending: true });
    if (!error) setEmployees(data);
  };

  // Fetch attendance za currentDay
  const fetchChecks = async () => {
    const { data, error } = await supabase
      .from("CheckCame")
      .select("*, Employee(*)")
      .eq("day", currentDay);

    if (!error) setChecks(data);
  };

  const prevDay = () => {
    const date = new Date(currentDay);
    date.setDate(date.getDate() - 1);
    setCurrentDay(date.toISOString().split("T")[0]);
  };

  const nextDay = () => {
    const date = new Date(currentDay);
    date.setDate(date.getDate() + 1);
    setCurrentDay(date.toISOString().split("T")[0]);
  };

  // Lep format za header
  const formattedDate = new Date(currentDay).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchChecks();
  }, [currentDay]);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        {/* Datum levo */}
        <h2 className="text-xl font-bold">
          Date: <span className="text-2xl font-normal">{formattedDate}</span>
        </h2>

        {/* Dugmici desno */}
        <div className="flex gap-2">
          <button
            className="hover:cursor-pointer bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
            onClick={prevDay}
          >
            ←
          </button>

          <button
            className="hover:cursor-pointer bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
            onClick={nextDay}
          >
            →
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="grid grid-cols-1 gap-4">
        {[...employees]
          .sort((a, b) => {
            const checkA = checks.find((c) => c.employee_id === a.id);
            const checkB = checks.find((c) => c.employee_id === b.id);

            const cameA = checkA ? (checkA.came ? 1 : 0) : 0;
            const cameB = checkB ? (checkB.came ? 1 : 0) : 0;

            return cameB - cameA;
          })
          .map((emp, index) => {
            // <--- index je redni broj
            const check = checks.find((c) => c.employee_id === emp.id);
            const cameText = check ? (check.came ? "Yes" : "No") : "No";

            return (
              <div
                key={emp.id}
                className="bg-white shadow-md rounded-xl p-4 flex justify-between items-center"
              >
                <div className="">
                  <span className="font-normal">{index + 1}</span>{" "}
                  <span className="font-bold">
                    {emp.first_name} {emp.last_name}
                    <span className="font-normal text-sm text-gray-500"> {emp.id} {emp.Position?.name}</span>
                  </span>
                </div>
                <div
                  className={`font-semibold ${
                    cameText === "Yes" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {cameText}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CameHistory;
