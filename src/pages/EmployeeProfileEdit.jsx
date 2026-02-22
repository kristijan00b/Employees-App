import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const EmployeeProfileEdit = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [salaryTypeId, setSalaryTypeId] = useState("");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryTypes, setSalaryTypes] = useState([]);

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoURL, setProfilePhotoURL] = useState("");

  useEffect(() => {
    fetchEmployee();
    fetchSalary();
  }, [employeeId]);

  const fetchEmployee = async () => {
    const { data, error } = await supabase
      .from("Employee")
      .select("*")
      .eq("id", employeeId)
      .single();

    if (error) {
      console.error(error);
    } else {
      setEmployeeData(data);

      // Ako postoji image_path, koristi ga direktno jer vec sadrži ceo URL
      if (data.image_path) {
        setProfilePhotoURL(data.image_path);
      }
    }

    setLoading(false);
  };

  const fetchSalary = async () => {
    const { data: types, error: typesError } = await supabase
      .from("SalaryType")
      .select("*");
    if (typesError) console.log("SalaryType fetch error", typesError);
    setSalaryTypes(types || []);

    const { data: salary, error: salaryError } = await supabase
      .from("Salary")
      .select("amount, salary_type_id")
      .eq("employee_id", employeeId)
      .single();
    if (salaryError) console.log("Salary fetch error", salaryError);

    if (salary) {
      setSalaryTypeId(salary.salary_type_id);
      setSalaryAmount(salary.amount);
    }
  };

  const uploadProfilePhoto = async (employeeId) => {
    if (!profilePhoto) return null;

    const fileExt = profilePhoto.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${employeeId}/${fileName}`;

    const { error } = await supabase.storage
      .from("EmployeeImage")
      .upload(filePath, profilePhoto);

    if (error) {
      console.log("Upload error:", error);
      return null;
    }

    // Public URL je bucket + path
    return `https://rrhobhrtgahlwynyyduq.supabase.co/storage/v1/object/public/EmployeeImage/${filePath}`;
  };

  const handleChange = (e) => {
    setEmployeeData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    setSaving(true);
    const { error: empError } = await supabase
      .from("Employee")
      .update(employeeData)
      .eq("id", employeeId);

    const newImageURL = await uploadProfilePhoto(employeeData.id);
    if (newImageURL) {
      await supabase
        .from("Employee")
        .update({ image_path: newImageURL })
        .eq("id", employeeData.id);

      setProfilePhotoURL(newImageURL); // prikaz nove slike
    }

    if (empError) {
      console.error("Employee update error:", empError);
      return;
    }

    // Update ili insert salary
    const { data: existingSalary } = await supabase
      .from("Salary")
      .select("id")
      .eq("employee_id", employeeId)
      .single();

    if (existingSalary) {
      const { error: salaryError } = await supabase
        .from("Salary")
        .update({
          salary_type_id: salaryTypeId,
          amount: parseFloat(salaryAmount),
        })
        .eq("employee_id", employeeId);

      if (salaryError) console.error("Salary update error:", salaryError);
    } else {
      const { error: salaryError } = await supabase.from("Salary").insert([
        {
          employee_id: employeeId,
          salary_type_id: salaryTypeId,
          amount: parseFloat(salaryAmount),
        },
      ]);

      if (salaryError) console.error("Salary insert error:", salaryError);
    }
    setSaving(false);

    navigate(`/dashboard/employee-profile/${employeeId}`);
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-1">
          <span className="text-xl font-normal">Izmeni</span>{" "}
          {employeeData.first_name} {employeeData.last_name}
        </h2>
        <div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(-1)}
              className="hover:cursor-pointer px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Otkaži
            </button>

            <button
              onClick={handleUpdate}
              disabled={saving}
              className={`hover:cursor-pointer px-4 py-2 rounded-lg transition ${
                saving
                  ? "bg-blue-200 text-white cursor-wait" // svetlo plava dok cuva
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {saving ? "Čuvanje..." : "Sačuvaj"}
            </button>
          </div>
        </div>
      </div>
      <div className="mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Ime</p>
            <input
              name="first_name"
              value={employeeData.first_name}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Prezime</p>
            <input
              name="last_name"
              value={employeeData.last_name}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">E-mail</p>
            <input
              name="email"
              value={employeeData.email}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Telefon</p>
            <input
              name="phone"
              value={employeeData.phone}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Zemlja</p>
            <input
              name="country"
              value={employeeData.country}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Grad</p>
            <input
              name="city"
              value={employeeData.city}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Adresa</p>
            <input
              name="address"
              value={employeeData.address}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Datum rođenja</p>
            <input
              type="date"
              name="born_date"
              value={employeeData.born_date}
              onChange={handleChange}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Tip plate</p>
            <select
              name="salaryTypeId"
              value={salaryTypeId}
              onChange={(e) => setSalaryTypeId(e.target.value)}
              className="hover:cursor-pointer bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">-- Select --</option>
              {salaryTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 text-xs mb-1">Plata</p>
            <input
              type="number"
              name="salaryAmount"
              value={salaryAmount}
              onChange={(e) => setSalaryAmount(e.target.value)}
              className="bg-white p-2 rounded-md w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-500 text-xs mb-1">Profilna slika</label>
            <input
              type="file"
              accept="image/*"
              className="hover:cursor-pointer bg-white shadow hover:bg-gray-200 p-2 rounded"
              onChange={(e) => {
                const file = e.target.files[0];
                setProfilePhoto(file);

                setProfilePhotoURL(URL.createObjectURL(file));
              }}
            />

            {profilePhotoURL && (
              <div className="mt-2">
                <img
                  src={profilePhotoURL}
                  alt="Profilna slika"
                  className="w-18 h-18 object-cover rounded-full border border-gray-300"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileEdit;
