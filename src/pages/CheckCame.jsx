import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { formatDate } from "../utils/date";

const CheckCame = () => {
  const [employees, setEmployees] = useState([]);
  const [today, setToday] = useState(new Date().toISOString().split("T")[0]);

  const formattedDate = formatDate(new Date(today).toLocaleDateString());

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
          name
        )
      )
    `,
      )
      .eq("CheckCame.day", today);

    if (!error && data) {
      const sorted = [...data].sort((a, b) => {
        // 1️⃣ Shift ID - null/undefined na kraju
        const shiftA = a.CheckCame?.[0]?.ShiftType?.id;
        const shiftB = b.CheckCame?.[0]?.ShiftType?.id;

        if (shiftA == null && shiftB != null) return 1; // A na kraj
        if (shiftB == null && shiftA != null) return -1; // B na kraj
        if (shiftA != null && shiftB != null && shiftA !== shiftB)
          return shiftA - shiftB;

        // 2️⃣ came true/false
        const cameA = a.CheckCame?.[0]?.came ? 1 : 0;
        const cameB = b.CheckCame?.[0]?.came ? 1 : 0;
        if (cameA !== cameB) return cameB - cameA; // true pre false

        // 3️⃣ employee id
        return a.id - b.id;
      });

      setEmployees(sorted);
    }
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
    <div className="min-h-screen bg-gray-100">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Potvrda dolaska</h2>
        <h2 className="text-2xl font-normal">{formattedDate}</h2>
      </div>
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
                  Došao:{" "}
                  <span
                    className={`font-semibold ${
                      check?.came ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {check?.came ? "Da" : "Ne"}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Smena: {emp.CheckCame?.[0]?.ShiftType?.name || "-"}
                </p>
              </div>

              {hasShift && (
                <div className="flex gap-2">
                  <button
                    className="hover:cursor-pointer bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition"
                    onClick={() => handleUpdate(check.id, true)}
                  >
                    Da
                  </button>

                  <button
                    className="hover:cursor-pointer bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
                    onClick={() => handleUpdate(check.id, false)}
                  >
                    Ne
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckCame;
