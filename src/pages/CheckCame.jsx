import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const CheckCame = () => {
  const [employees, setEmployees] = useState([]);
  const [today, setToday] = useState(new Date().toISOString().split("T")[0]);

  const formattedDate = new Date(today).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 🔹 Jedan fetch – Employee + današnji CheckCame
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("Employee")
      .select(
        `
        id,
        first_name,
        last_name,
        CheckCame (
          id,
          came,
          day,
          ShiftType (
          id,
          name)
        )
      `,
      )
      .eq("CheckCame.day", today)
      .order("id", { ascending: true });

    if (!error) setEmployees(data);
  };

  // 🔹 Update status
  const handleUpdate = async (checkId, came) => {
    const { error } = await supabase
      .from("CheckCame")
      .update({ came })
      .eq("id", checkId);

    if (!error) fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [today]);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-xl font-bold mb-4">
        Date: <span className="text-2xl font-normal">{formattedDate}</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {employees.map((emp) => {
          const check = emp.CheckCame?.[0]; // jer filtriramo po danu
          const hasShift = check && check.ShiftType?.id !== 4; // ili ako 

          return (
            <div
              key={emp.id}
              className="bg-white shadow-md rounded-xl p-4 flex justify-between items-center hover:shadow-lg transition"
            >
              <div>
                <p className="font-medium">
                  <span className="text-xs text-gray-500">{emp.id} </span>
                  {emp.first_name} {emp.last_name}
                </p>

                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      check?.came ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {check?.came ? "YES" : "NO"}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Shift: {emp.CheckCame?.[0]?.ShiftType?.name || "-"}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={!hasShift}
                  className="hover:cursor-pointer bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-600 text-white px-3 py-1 rounded-lg transition"
                  onClick={() => handleUpdate(check.id, true)}
                >
                  Yes
                </button>

                <button
                  disabled={!hasShift}
                  className="hover:cursor-pointer bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
                  onClick={() => handleUpdate(check.id, false)}
                >
                  No
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckCame;
