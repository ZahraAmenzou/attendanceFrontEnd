import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PrivateRoute({ children, roles }) {
  const { token, user } = useContext(AuthContext);

  // Not logged in
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If route has roles, check permission
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to={user?.role === "teacher" ? "/attendance" : "/"} />;
  }

  return children;
}