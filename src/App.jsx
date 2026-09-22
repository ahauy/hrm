import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import EmployeesPage from "@/pages/EmployeesPage";
import PayrollPage from "@/pages/PayrollPage";
import LeaveRequestsPage from "@/pages/LeaveRequestsPage";
import AttendancePage from "@/pages/AttendancePage";
import SettingPage from "@/pages/SettingPage";
import ProfilePage from "@/pages/ProfilePage";
import MainLayout from "@/layouts/MainLayout";

function App() {
  const { token, isAuthLoading, setAuthLoading } = useAuth();

  useEffect(() => {
    setAuthLoading();
  }, [setAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader className="w-16 h-16 animate-spin text-neutral-900 mb-4" />
        <p className="text-[24px] font-bold uppercase tracking-[0.3em] text-neutral-400">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!token ? <LoginPage /> : <Navigate to="/dashboard" replace />}
      />

      <Route
        path="/*"
        element={
          token ? (
            <MainLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/payroll" element={<PayrollPage />} />
                <Route path="/leave-requests" element={<LeaveRequestsPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/setting" element={<SettingPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
