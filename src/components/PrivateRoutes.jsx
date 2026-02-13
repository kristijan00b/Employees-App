import React from "react";
import { UserAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const PrivateRoutes = ({ children }) => {
  const { session } = UserAuth();
  return <>{session ? <>{children}</> : <Navigate to="/login" />}</>;
};

export default PrivateRoutes;
