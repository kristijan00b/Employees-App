import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import PrivateRoutes from "./components/PrivateRoutes";
import EmployeesList from "./pages/EmployeesList";
import EmployeeAdd from "./pages/EmployeeAdd";
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeeProfileEdit from "./pages/EmployeeProfileEdit";
import CheckCame from "./pages/CheckCame";
import Shifts from "./pages/Shifts";
import CmaeHistory from "./pages/CameHistory";
import ShiftsWeekly from "./pages/ShiftsWeekly";

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
      {
        path: "check-came",
        element: <CheckCame />,
      },
      {
        path: "came-history",
        element: <CmaeHistory />,
      },
      {
        path: "shifts",
        element: <Shifts />,
      },
      {
        path: "shifts-weekly",
        element: <ShiftsWeekly />,
      },
    ],
  },
]);
