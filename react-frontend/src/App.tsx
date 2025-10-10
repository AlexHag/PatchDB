import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './api/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Matches from './pages/Matches';
import Profile from './pages/Profile';
import SubmitPatch from './pages/SubmitPatch';
import PatchSubmissionView from './pages/PatchSubmissionView';
import PatchView from './pages/PatchView';
import UniversitySetup from './pages/UniversitySetup';
import ReviewQueue from './pages/ReviewQueue';
import BrowsePatches from './pages/BrowsePatches';

// Protected Route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />;
};

// Public Route component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return !isAuthenticated() ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          {/* Protected routes */}
          <Route path="/university-setup" element={
            <ProtectedRoute>
              <UniversitySetup />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/upload" element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } />
          
          <Route path="/matches" element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/submit-patch" element={
            <ProtectedRoute>
              <SubmitPatch />
            </ProtectedRoute>
          } />
          
          <Route path="/submit-patch/:patchSubmittionId" element={
            <ProtectedRoute>
              <PatchSubmissionView />
            </ProtectedRoute>
          } />
          
          <Route path="/review-queue" element={
            <ProtectedRoute>
              <ReviewQueue />
            </ProtectedRoute>
          } />
          
          <Route path="/browse-patches" element={
            <ProtectedRoute>
              <BrowsePatches />
            </ProtectedRoute>
          } />
          
          <Route path="/patch/:patchNumber" element={
            <ProtectedRoute>
              <PatchView />
            </ProtectedRoute>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
