import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const CheckCame = () => {
  const [employeeList, setEmployeesList] = useState([]);
  const [todayChecks, setTodayChecks] = useState([]);
  const [today, setToday] = useState(new Date().toISOString().split("T")[0]);

  const formattedDate = new Date(today).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("Employee")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.log("Error fetching employees", error);
    } else {
      setEmployeesList(data);
    }
  };

  const fetchTodayChecks = async () => {
    const { data, error } = await supabase
      .from("CheckCame")
      .select("*, Employee(*)")
      .eq("day", today)
      .order("employee_id", { ascending: true });

    if (error) {
      console.log("Error fetching today checks", error);
    } else {
      setTodayChecks(data);
    }
  };

  const handleCheck = async (employeeId, came) => {
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("CheckCame").insert([
      {
        day: today,
        employee_id: employeeId,
        came: came,
      },
    ]);

    if (error) {
      console.log("Error inserting check", error);
    } else {
      fetchTodayChecks();
    }
  };

  const handleUpdate = async (id, came) => {
    const { error } = await supabase
      .from("CheckCame")
      .update({ came: came })
      .eq("id", id);

    if (error) {
      console.log("Error updating", error);
    } else {
      fetchTodayChecks();
    }
  };

  // 1️⃣ Učitaj zaposlene samo jednom
  useEffect(() => {
    fetchEmployees();
  }, []);

  // 2️⃣ Učitaj današnje čekirane kad god se promeni datum
  useEffect(() => {
    fetchTodayChecks();
  }, [today]);

  // 3️⃣ Timer do ponoći
  useEffect(() => {
    const now = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow - now;

    const timeout = setTimeout(() => {
      const newToday = new Date().toISOString().split("T")[0];
      setToday(newToday);
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, [today]);

  return (
    <div className="min-h-screen">
      <div className="mb-2">
        <h2 className="text-xl font-bold">
          Date: <span className="text-2xl font-normal">{formattedDate}</span>
        </h2>
      </div>

      {/* PENDING SECTION */}
      <h3 className="text-md font-semibold mb-3 pl-3 bg-blue-500 text-white rounded-md">
        Pending
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {employeeList
          .filter(
            (emp) => !todayChecks.some((check) => check.employee_id === emp.id),
          )
          .map((employee) => (
            <div
              key={employee.id}
              className="bg-white shadow-md rounded-xl p-4 flex justify-between items-center hover:shadow-lg transition"
            >
              <div>
                <p className="font-medium">
                  <span className="text-xs text-gray-500">{employee.id} </span>
                  {employee.first_name} {employee.last_name}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  className="hover:cursor-pointer bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition"
                  onClick={() => handleCheck(employee.id, true)}
                >
                  Yes
                </button>
                <button
                  className="hover:cursor-pointer bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
                  onClick={() => handleCheck(employee.id, false)}
                >
                  No
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* TODAY CHECKED SECTION */}
      <h3 className="text-md font-semibold mb-3 pl-3 bg-blue-500 text-white rounded-md">
        Checked
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {todayChecks.map((check) => (
          <div
            key={check.id}
            className="bg-white shadow-md rounded-xl p-4 flex justify-between items-center hover:shadow-lg transition"
          >
            <div>
              <p className="font-medium">
                <span className="text-xs text-gray-500">
                  {check.Employee.id}{" "}
                </span>
                {check.Employee.first_name} {check.Employee.last_name}
              </p>
              <p className="text-sm text-gray-500">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    check.came ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {check.came ? "YES" : "NO"}
                </span>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                className="hover:cursor-pointer bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition"
                onClick={() => handleUpdate(check.id, true)}
              >
                Yes
              </button>
              <button
                className="hover:cursor-pointer bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
                onClick={() => handleUpdate(check.id, false)}
              >
                No
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckCame;
