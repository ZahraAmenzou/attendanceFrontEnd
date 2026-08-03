import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import AttendanceHistory from "./pages/AttendanceHistory";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import AssignSubjects from "./pages/AssignSubjects";
import MySubjects from "./pages/MySubjects";

import PrivateRoute from "./routes/PrivateRoute";
import MainLayout from "./layout/MainLayout";

function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Result
        status="404"
        title="404"
        subTitle="Page not found"
        extra={<Button type="primary" onClick={() => navigate("/")}>Back to dashboard</Button>}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute roles={["admin", "teacher"]}>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route
            index
            element={
              <PrivateRoute roles={["admin"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="attendance"
            element={
              <PrivateRoute roles={["admin", "teacher"]}>
                <Attendance />
              </PrivateRoute>
            }
          />

          <Route
            path="attendance-history"
            element={
              <PrivateRoute roles={["admin", "teacher"]}>
                <AttendanceHistory />
              </PrivateRoute>
            }
          />

          <Route
            path="students"
            element={
              <PrivateRoute roles={["admin"]}>
                <Students />
              </PrivateRoute>
            }
          />

          <Route
            path="teachers"
            element={
              <PrivateRoute roles={["admin"]}>
                <Teachers />
              </PrivateRoute>
            }
          />

          <Route
            path="classes"
            element={
              <PrivateRoute roles={["admin"]}>
                <Classes />
              </PrivateRoute>
            }
          />

          <Route
            path="subjects"
            element={
              <PrivateRoute roles={["admin"]}>
                <Subjects />
              </PrivateRoute>
            }
          />

          <Route
            path="assign-subjects"
            element={
              <PrivateRoute roles={["admin"]}>
                <AssignSubjects />
              </PrivateRoute>
            }
          />

          <Route
            path="my-subjects"
            element={
              <PrivateRoute roles={["teacher"]}>
                <MySubjects />
              </PrivateRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
