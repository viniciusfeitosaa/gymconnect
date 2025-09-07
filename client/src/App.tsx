import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlanProvider } from './contexts/PlanContext';
import { MercadoPagoProvider } from './contexts/MercadoPagoContext';
import LandingPage from './components/LandingPage';
import PersonalDashboard from './components/PersonalDashboard';
import StudentAccess from './components/StudentAccess';
import StudentWorkouts from './components/StudentWorkouts';
import Login from './components/Login';
import Register from './components/Register';
import PaymentSuccess from './components/PaymentSuccess';

// NewStudent importado em PersonalDashboard

// Componente de rota protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/student-access" element={<StudentAccess />} />
      <Route
        path="/student-workouts/:accessCode"
        element={<StudentWorkouts />}
      />
      <Route
        path="/dashboard/plans/success"
        element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <PersonalDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <PlanProvider>
        <MercadoPagoProvider>
          <div className="App">
            <AppRoutes />
          </div>
        </MercadoPagoProvider>
      </PlanProvider>
    </AuthProvider>
  );
}

export default App;
