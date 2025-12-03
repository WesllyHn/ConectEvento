import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Suppliers } from './pages/Suppliers';
import { SupplierProfile } from './pages/SupplierProfile';
import { SupplierDashboard } from './pages/SupplierDashboard';
import { Reviews } from './pages/Reviews';
import { EventRoadmap } from './pages/EventRoadmap';
import { SupplierProfileEdit } from './pages/SupplierProfileEdit';
import { SupplierReviews } from './pages/SupplierReviews';
import { Quotes } from './pages/Quotes';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to={user?.type === 'organizer' ? '/dashboard' : '/supplier-dashboard'} /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to={user?.type === 'organizer' ? '/dashboard' : '/supplier-dashboard'} /> : <Register />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <Reviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier-dashboard"
            element={
              <ProtectedRoute>
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/:id"
            element={
              <ProtectedRoute>
                <SupplierProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/event-roadmap/:eventId"
            element={
              <ProtectedRoute>
                <EventRoadmap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier-profile-edit"
            element={
              <ProtectedRoute>
                <SupplierProfileEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier-reviews"
            element={
              <ProtectedRoute>
                <SupplierReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotes"
            element={
              <ProtectedRoute>
                <Quotes />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;