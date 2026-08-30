import { useEffect, useState } from "react";

import { Navigate } from "react-router-dom";

import api from "../../services/api";

const roleDashboards = {
  student: "/student/dashboard",
  officer: "/officer/dashboard",
  admin: "/admin/dashboard",
};

function ProtectedRoute({ allowedRole, children }) {
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyAuthentication = async () => {
      const token = localStorage.getItem("resolveaiToken");

      if (!token) {
        localStorage.removeItem("resolveaiUser");

        if (isMounted) {
          setIsChecking(false);
        }

        return;
      }

      try {
        const response = await api.get("/auth/me");
        const authenticatedUser = response.data.user;

        localStorage.setItem(
          "resolveaiUser",
          JSON.stringify(authenticatedUser),
        );

        if (isMounted) {
          setUser(authenticatedUser);
        }
      } catch {
        localStorage.removeItem("resolveaiToken");
        localStorage.removeItem("resolveaiUser");
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    verifyAuthentication();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isChecking) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7faf8]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />

          <p className="mt-4 text-sm font-medium text-gray-500">
            Verifying your session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={roleDashboards[user.role] || "/login"} replace />;
  }

  return children;
}

export default ProtectedRoute;
