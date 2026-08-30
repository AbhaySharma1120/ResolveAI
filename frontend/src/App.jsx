import { Navigate, Route, Routes } from "react-router-dom";

import StudentLayout from "./layouts/StudentLayout";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/StudentDashboard";
import ReportIssue from "./pages/student/ReportIssue";
import MyComplaints from "./pages/student/MyComplaints";
import ComplaintDetails from "./pages/student/ComplaintDetails";
import AICopilot from "./pages/student/AICopilot";
import StudentAnalytics from "./pages/student/StudentAnalytics";
import HelpSupport from "./pages/student/HelpSupport";
import Settings from "./pages/student/Settings";
import OfficerLayout from "./layouts/OfficerLayout";
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import TriageQueue from "./pages/officer/TriageQueue";
import AssignedCases from "./pages/officer/AssignedCases";
import OfficerCaseDetails from "./pages/officer/OfficerCaseDetails";
import OfficerAIAssistant from "./pages/officer/OfficerAIAssistant";
import OfficerSettings from "./pages/officer/OfficerSettings";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AllComplaints from "./pages/admin/AllComplaints";
import Departments from "./pages/admin/Departments";
import UserManagement from "./pages/admin/UserManagement";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AIMonitoring from "./pages/admin/AIMonitoring";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminComplaintDetails from "./pages/admin/AdminComplaintDetails";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authentication routes */}

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Student routes */}

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<StudentDashboard />} />

        <Route path="report" element={<ReportIssue />} />

        <Route path="complaints" element={<MyComplaints />} />

        <Route path="complaints/:complaintId" element={<ComplaintDetails />} />

        <Route path="ai-copilot" element={<AICopilot />} />

        <Route path="analytics" element={<StudentAnalytics />} />

        <Route path="help" element={<HelpSupport />} />

        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Officer routes */}
      <Route
        path="/officer"
        element={
          <ProtectedRoute allowedRole="officer">
            <OfficerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OfficerDashboard />} />
        <Route path="triage" element={<TriageQueue />} />
        <Route path="cases" element={<AssignedCases />} />
        <Route path="cases/:complaintId" element={<OfficerCaseDetails />} />
        <Route path="ai-assistant" element={<OfficerAIAssistant />} />
        <Route path="help" element={<HelpSupport />} />
        <Route path="settings" element={<OfficerSettings />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="complaints" element={<AllComplaints />} />
        <Route path="departments" element={<Departments />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="ai-monitoring" element={<AIMonitoring />} />
        <Route path="help" element={<HelpSupport />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route
          path="complaints/:complaintId"
          element={<AdminComplaintDetails />}
        />
      </Route>

      {/* Invalid URL */}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
