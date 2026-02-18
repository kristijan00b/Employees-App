import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";

const Shifts = () => {
  const [currentDay, setCurrentDay] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  const [shiftOptions, setShiftOptions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shiftAssignments, setShiftAssignments] = useState([]);

  // ---------------- FETCH FUNCTIONS ----------------
  const fetchShiftOptions = async () => {
    const { data, error } = await supabase
      .from("ShiftType")
      .select("*")
      .order("id", { ascending: true });
    if (!error) setShiftOptions(data);
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("Employee")
      .select("*")
      .order("id", { ascending: true });
    if (!error) setEmployees(data);
  };

  const fetchShifts = async () => {
    const { data, error } = await supabase
      .from("CheckCame")
      .select("*")
      .eq("day", currentDay)
      .order("employee_id", { ascending: true });
    if (!error) setShiftAssignments(data);
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    fetchEmployees();
    fetchShiftOptions();
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [currentDay]);

  // ---------------- DATE NAVIGATION ----------------
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

  const formattedDate = new Date(currentDay).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ---------------- OPTIMIZED LOOKUP ----------------
  // Ključ = employeeId + day da bi mogli imati više zapisa po danima
  const assignmentMap = useMemo(() => {
    return Object.fromEntries(
      shiftAssignments.map((s) => [`${s.employee_id}_${s.day}`, s]),
    );
  }, [shiftAssignments]);

  // ---------------- SHIFT CHANGE ----------------
  const handleShiftChange = async (employeeId, shiftId) => {
    if (!shiftId) return; // safety check da ne šalje "" ili null

    const key = `${employeeId}_${currentDay}`;
    const existing = assignmentMap[key];

    if (existing) {
      const { error } = await supabase
        .from("CheckCame")
        .update({
          shift: shiftId,
          came: shiftId === 4 ? false : existing.came, // update only if shiftId 4
        })
        .eq("id", existing.id);

      if (!error) fetchShifts();
    } else {
      const { error } = await supabase.from("CheckCame").insert([
        {
          day: currentDay,
          employee_id: employeeId,
          shift: shiftId,
          came: false,
        },
      ]);
      if (!error) fetchShifts();
    }
  };

  // ---------------- RENDER ----------------
  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{formattedDate}</h2>
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

      {/* Employees List */}
      <h3 className="text-md font-semibold mb-4 pl-3 bg-blue-500 text-white rounded-md">
        Daily Shift Assignment
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {employees.map((emp) => {
          const key = `${emp.id}_${currentDay}`;
          const assignment = assignmentMap[key];

          return (
            <div
              key={emp.id}
              className="bg-white shadow-md rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                {emp.id} {emp.first_name} {emp.last_name}
              </div>

              <select
                className="hover:cursor-pointer border px-2 py-1 rounded"
                value={assignment?.shift || ""}
                onChange={(e) =>
                  handleShiftChange(emp.id, Number(e.target.value))
                }
              >
                <option value="">Select shift</option>
                {shiftOptions.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Shifts;
