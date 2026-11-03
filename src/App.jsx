import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageStudents } from './pages/admin/ManageStudents';
import { ManageFaculty } from './pages/admin/ManageFaculty';
import { ManageSubjects } from './pages/admin/ManageSubjects';
import { AttendanceOverview } from './pages/admin/AttendanceOverview';
import { RewardManagement } from './pages/admin/RewardManagement';
import { BlockchainTransactions } from './pages/admin/BlockchainTransactions';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { MySubjects } from './pages/faculty/MySubjects';
import { MarkAttendance } from './pages/faculty/MarkAttendance';
import { AttendanceHistory } from './pages/faculty/AttendanceHistory';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyAttendance } from './pages/student/MyAttendance';
import { MyRewards } from './pages/student/MyRewards';
import { StudentTransactions } from './pages/student/StudentTransactions';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin Protected Flow */}
      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="faculty" element={<ManageFaculty />} />
        <Route path="subjects" element={<ManageSubjects />} />
        <Route path="attendance" element={<AttendanceOverview />} />
        <Route path="rewards" element={<RewardManagement />} />
        <Route path="transactions" element={<BlockchainTransactions />} />
      </Route>

      {/* Faculty Flow */}
      <Route path="/faculty" element={<DashboardLayout />}>
        <Route index element={<FacultyDashboard />} />
        <Route path="subjects" element={<MySubjects />} />
        <Route path="mark-attendance" element={<MarkAttendance />} />
        <Route path="history" element={<AttendanceHistory />} />
      </Route>

      {/* Student Flow */}
      <Route path="/student" element={<DashboardLayout />}>
        <Route index element={<StudentDashboard />} />
        <Route path="attendance" element={<MyAttendance />} />
        <Route path="rewards" element={<MyRewards />} />
        <Route path="transactions" element={<StudentTransactions />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Web3Provider>
          <AppRoutes />
        </Web3Provider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
