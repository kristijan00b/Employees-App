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

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      const aKey = `${a.id}_${currentDay}`;
      const bKey = `${b.id}_${currentDay}`;

      const aAssignment = assignmentMap[aKey];
      const bAssignment = assignmentMap[bKey];

      const aHasShift = !!aAssignment?.shift;
      const bHasShift = !!bAssignment?.shift;

      // 1️⃣ Prvo: oni bez smene idu prvi
      if (aHasShift !== bHasShift) {
        return Number(aHasShift) - Number(bHasShift);
      }

      // 2️⃣ Ako oboje imaju smenu → sortiraj po shift ID
      if (aHasShift && bHasShift) {
        if (aAssignment.shift !== bAssignment.shift) {
          return aAssignment.shift - bAssignment.shift;
        }
      }

      // 3️⃣ Ako je ista smena (ili oboje bez smene) → po employee id
      return a.id - b.id;
    });
  }, [employees, assignmentMap, currentDay]);

  const shiftStats = useMemo(() => {
    let assigned = 0;
    let unassigned = 0;

    employees.forEach((emp) => {
      const key = `${emp.id}_${currentDay}`;
      const hasShift = !!assignmentMap[key]?.shift;

      if (hasShift) {
        assigned++;
      } else {
        unassigned++;
      }
    });

    return { assigned, unassigned };
  }, [employees, assignmentMap, currentDay]);

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
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Daily Shift Assignment</h2>
          <h2 className="text-2xl font-normal">{formattedDate}</h2>
        </div>
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
      <div className="mb-3 flex gap-4">
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold shadow">
          Assigned shifts: {shiftStats.assigned}
        </div>

        <div className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold shadow">
          Unassigned shifts: {shiftStats.unassigned}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedEmployees.map((emp) => {
          const key = `${emp.id}_${currentDay}`;
          const assignment = assignmentMap[key];

          return (
            <div
              key={emp.id}
              className={`
       shadow-md rounded-xl p-4 flex justify-between items-center
      ${assignment?.shift ? "bg-green-100" : "bg-white"}
    `}
            >
              <div>
                {emp.id} {emp.first_name} {emp.last_name}
              </div>

              <select
                className="hover:cursor-pointer shadow px-2 py-1 rounded bg-white"
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
