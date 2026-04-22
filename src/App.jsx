import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import MarkAttendance from './pages/student/MarkAttendance';
import FaceSetup from './pages/student/FaceSetup';
import AdminDashboard from './pages/admin/AdminDashboard';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/student/dashboard" element={
            <ProtectedRoute roleRequired="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/face-setup" element={
            <ProtectedRoute roleRequired="student">
              <FaceSetup />
            </ProtectedRoute>
          } />
          <Route path="/student/mark-attendance" element={
            <ProtectedRoute roleRequired="student">
              <MarkAttendance />
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute roleRequired="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
