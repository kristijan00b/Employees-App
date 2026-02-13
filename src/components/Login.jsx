import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState("");

  const { session, logInUser } = UserAuth();
  const navigate = useNavigate();

  const handleLogIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await logInUser(email, password);
      if (result.success) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.log("Log in error ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-300">
      <form onSubmit={handleLogIn}>
        <input type="email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loading}>
          Log in
        </button>
      </form>
    </div>
  );
};

export default Login;
