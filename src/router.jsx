import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import PrivateRoutes from "./components/PrivateRoutes";
import EmployeesList from "./components/pages/EmployeesList";
import EmployeeAdd from "./components/pages/EmployeeAdd";
import EmployeeProfile from "./components/pages/EmployeeProfile";
import EmployeeProfileEdit from "./components/pages/EmployeeProfileEdit";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [{}],
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "dashboard",
    element: (
      <PrivateRoutes>
        <Dashboard />{" "}
      </PrivateRoutes>
    ),
    children: [
      {
        path: "employees-list",
        element: <EmployeesList />,
      },
      {
        path: "employee-add",
        element: <EmployeeAdd />,
      },
      {
        path: "employee-profile/:employeeId",
        element: <EmployeeProfile />,
      },
      {
        path: "employee-profile/:employeeId/edit",
        element: <EmployeeProfileEdit />,
      },
    ],
  },
]);
