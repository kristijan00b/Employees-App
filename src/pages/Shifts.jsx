import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { formatDate } from "../utils/date";

const Shifts = () => {
  // GET MONDAY
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  };

  // Current week
  const [bulkSelection, setBulkSelection] = useState({});
  const [currentWeekStart, setCurrentWeekStart] = useState(
    () => getMonday(new Date()).toISOString().split("T")[0],
  );

  const [employees, setEmployees] = useState([]);
  const [shiftAssignments, setShiftAssignments] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);

  // Current week days
  const weekDays = useMemo(() => {
    const start = new Date(currentWeekStart);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }, [currentWeekStart]);

  const today = new Date().toISOString().split("T")[0];

  const isPastWeek = weekDays[6] < today;
  const isCurrentWeek = weekDays[0] <= today && weekDays[6] >= today;

  // Check if it's day locked
  const isDayDisabled = (day) => {
    if (isPastWeek) return true; // whole week locked

    if (isCurrentWeek && day < today) return true; // only past days

    return false;
  };

  // Featch
  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("Employee")
      .select("*")
      .order("id", { ascending: true });

    if (!error) setEmployees(data);
  };

  const fetchShiftOptions = async () => {
    const { data, error } = await supabase
      .from("ShiftType")
      .select("*")
      .order("id", { ascending: true });

    if (!error) setShiftOptions(data);
  };

  const fetchShifts = async () => {
    const { data, error } = await supabase
      .from("CheckCame")
      .select("*")
      .gte("day", weekDays[0])
      .lte("day", weekDays[6]);

    if (!error) setShiftAssignments(data);
  };

  useEffect(() => {
    fetchEmployees();
    fetchShiftOptions();
  }, []);

  useEffect(() => {
    if (weekDays.length === 7) {
      fetchShifts();
    }
    setBulkSelection({});
  }, [currentWeekStart]);

  // Hash mapa svih smena za tu nedelju
  const assignmentMap = useMemo(() => {
    return Object.fromEntries(
      shiftAssignments.map((s) => [`${s.employee_id}_${s.day}`, s]),
    );
  }, [shiftAssignments]);

  // Assign whole week functionality
  const handleAssignWholeWeek = async (employeeId, shiftId) => {
    if (!shiftId) return;

    const updates = [];
    const inserts = [];

    weekDays
      .filter((day) => !isDayDisabled(day))
      .forEach((day) => {
        const key = `${employeeId}_${day}`;
        const existing = assignmentMap[key];

        if (existing) {
          updates.push({
            id: existing.id,
            shift: shiftId,
          });
        } else {
          inserts.push({
            employee_id: employeeId,
            day,
            shift: shiftId,
            came: false,
          });
        }
      });

    for (const item of updates) {
      await supabase
        .from("CheckCame")
        .update({ shift: item.shift })
        .eq("id", item.id);
    }

    if (inserts.length > 0) {
      await supabase.from("CheckCame").insert(inserts);
    }

    fetchShifts();
  };

  // Assign Monday to Friday
  const handleAssignWeekdays = async (employeeId, shiftId) => {
    if (!shiftId) return;

    const updates = [];
    const inserts = [];

    weekDays
      .slice(0, 5)
      .filter((day) => !isDayDisabled(day))
      .forEach((day) => {
        const key = `${employeeId}_${day}`;
        const existing = assignmentMap[key];

        if (existing) {
          updates.push({
            id: existing.id,
            shift: shiftId,
          });
        } else {
          inserts.push({
            employee_id: employeeId,
            day,
            shift: shiftId,
            came: false,
          });
        }
      });

    for (const item of updates) {
      await supabase
        .from("CheckCame")
        .update({ shift: item.shift })
        .eq("id", item.id);
    }

    if (inserts.length > 0) {
      await supabase.from("CheckCame").insert(inserts);
    }

    fetchShifts();
  };

  // Assign specific day
  const handleAssignSpecificDay = async (employeeId, day, shiftId) => {
    if (!shiftId) return;

    const key = `${employeeId}_${day}`;
    const existing = assignmentMap[key];

    if (existing) {
      await supabase
        .from("CheckCame")
        .update({ shift: shiftId })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("CheckCame")
        .insert([
          { employee_id: employeeId, day, shift: shiftId, came: false },
        ]);
    }

    fetchShifts(); // refresh
  };

  // Week Navigation
  const prevWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() - 7);
    setCurrentWeekStart(date.toISOString().split("T")[0]);
  };

  const nextWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + 7);
    setCurrentWeekStart(date.toISOString().split("T")[0]);
  };

  const formattedRange = `${formatDate(
    new Date(weekDays[0]).toLocaleDateString(),
  )} - ${formatDate(new Date(weekDays[6]).toLocaleDateString())}`;

  // UI
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Raspored smena</h2>
          <h2 className="text-2xl font-normal">
            {formattedRange}{" "}
            {isCurrentWeek && (
              <span className="text-xl">Trenutna nedelja </span>
            )}
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            className="hover:cursor-pointer bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
            onClick={prevWeek}
          >
            ←
          </button>

          <button
            className="hover:cursor-pointer bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
            onClick={nextWeek}
          >
            →
          </button>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="mb-4 flex gap-4">
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold shadow">
          Raspoređeni:{" "}
          {
            employees.filter((emp) =>
              weekDays.every((day) => assignmentMap[`${emp.id}_${day}`]?.shift),
            ).length
          }
        </div>

        <div className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold shadow">
          Neraspoređeni:{" "}
          {
            employees.filter(
              (emp) =>
                !weekDays.every(
                  (day) => assignmentMap[`${emp.id}_${day}`]?.shift,
                ),
            ).length
          }
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        {employees.map((emp) => (
          <div key={emp.id} className="shadow-md rounded-xl p-4 bg-white">
            {/* Employee name + ID */}
            <div className="font-medium mb-3">
              <span className="text-xs text-gray-500">{emp.id} </span>
              {emp.first_name} {emp.last_name}
            </div>

            {/* Days preview with colored boxes + mini dropdown */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-4 text-center text-sm">
              {weekDays.map((day) => {
                const key = `${emp.id}_${day}`;
                const assignment = assignmentMap[key];

                // Određivanje boje pozadine i teksta
                let bgClass = "bg-gray-100 text-gray-500"; // default = nema smenu
                if (assignment?.shift) {
                  if (assignment.shift === 4) {
                    bgClass = "bg-yellow-200 text-yellow-800"; // out

                    if (isDayDisabled(day)) {
                      bgClass = "bg-yellow-100 ";
                    }
                  } else {
                    bgClass = "bg-green-300 text-green-900";
                    if (isDayDisabled(day)) {
                      bgClass = "bg-green-200 ";
                    }
                  }
                }

                return (
                  <div
                    key={day}
                    className={`p-2 rounded-lg shadow-sm ${bgClass} flex flex-col items-center`}
                  >
                    {/* Dan */}
                    <div className="text-xs mb-1">
                      {new Date(day).toLocaleDateString("sr-Latn-RS", {
                        weekday: "short",
                      })}
                    </div>

                    <div className="text-[10px] text-gray-600 mb-1">
                      {formatDate(new Date(day).toLocaleDateString())}
                    </div>

                    {/* Mini dropdown */}
                    <select
                      disabled={isDayDisabled(day)}
                      className={`hover:cursor-pointer text-sm rounded px-1 py-0.5 w-full ${
                        isDayDisabled(day)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                      value={assignment?.shift || ""}
                      onChange={(e) =>
                        handleAssignSpecificDay(
                          emp.id,
                          day,
                          Number(e.target.value),
                        )
                      }
                    >
                      <option value="">-</option>
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

            <div className="flex flex-wrap gap-2 justify-end">
              {/* Assign whole week */}
              <select
                disabled={isPastWeek}
                className={`hover:cursor-pointer shadow px-3 py-1 rounded bg-white ${
                  isPastWeek ? "opacity-50 cursor-not-allowed" : ""
                }`}
                value={bulkSelection[`whole_${emp.id}`] || ""}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setBulkSelection((prev) => ({
                    ...prev,
                    [`whole_${emp.id}`]: value,
                  }));
                  handleAssignWholeWeek(emp.id, value);
                }}
              >
                <option value="">Za celu nedelju</option>
                {shiftOptions.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name}
                  </option>
                ))}
              </select>

              {/* Assign Monday to Friday */}
              <select
                disabled={isPastWeek}
                className={`hover:cursor-pointer shadow px-3 py-1 rounded bg-white ${
                  isPastWeek ? "opacity-50 cursor-not-allowed" : ""
                }`}
                value={bulkSelection[`weekdays_${emp.id}`] || ""}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setBulkSelection((prev) => ({
                    ...prev,
                    [`weekdays_${emp.id}`]: value,
                  }));
                  handleAssignWeekdays(emp.id, value);
                }}
              >
                <option value="">Od Pon do Pet</option>
                {shiftOptions.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shifts;
