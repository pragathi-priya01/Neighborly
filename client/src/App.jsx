import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { ResidentLayout } from './layouts/ResidentLayout';
import { ProviderLayout } from './layouts/ProviderLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public & Auth Pages
import { HomePage } from './pages/public/HomePage';
import { BrowseServicesPage } from './pages/public/BrowseServicesPage';
import { ProviderProfilePage } from './pages/public/ProviderProfilePage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Resident Pages
import { ResidentDashboard } from './pages/resident/ResidentDashboard';
import { CreateRequestPage } from './pages/resident/CreateRequestPage';
import { ResidentRequestsPage } from './pages/resident/ResidentRequestsPage';
import { RequestDetailsPage } from './pages/resident/RequestDetailsPage';
import { ResidentBookingsPage } from './pages/resident/ResidentBookingsPage';
import { BookingDetailsPage } from './pages/resident/BookingDetailsPage';

// Provider Pages
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { ProviderFeedPage } from './pages/provider/ProviderFeedPage';
import { ProviderBookingsPage } from './pages/provider/ProviderBookingsPage';
import { ProviderProfileSettingsPage } from './pages/provider/ProviderProfileSettingsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminVerificationsPage } from './pages/admin/AdminVerificationsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminDisputesPage } from './pages/admin/AdminDisputesPage';

// Communication & Alerts
import { ChatPage } from './pages/chat/ChatPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<BrowseServicesPage />} />
          <Route path="/providers/:id" element={<ProviderProfilePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Authenticated general communication under PublicLayout navbar */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <ChatPage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:conversationId"
            element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <ChatPage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <NotificationsPage />
                </div>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Resident Workspace Routes */}
        <Route
          path="/resident"
          element={
            <ProtectedRoute allowedRoles={['RESIDENT', 'ADMIN']}>
              <ResidentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/resident/dashboard" replace />} />
          <Route path="dashboard" element={<ResidentDashboard />} />
          <Route path="request/new" element={<CreateRequestPage />} />
          <Route path="requests" element={<ResidentRequestsPage />} />
          <Route path="requests/:id" element={<RequestDetailsPage />} />
          <Route path="bookings" element={<ResidentBookingsPage />} />
          <Route path="bookings/:id" element={<BookingDetailsPage />} />
        </Route>

        {/* Provider Workspace Routes */}
        <Route
          path="/provider"
          element={
            <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
              <ProviderLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/provider/dashboard" replace />} />
          <Route path="dashboard" element={<ProviderDashboard />} />
          <Route path="feed" element={<ProviderFeedPage />} />
          <Route path="bookings" element={<ProviderBookingsPage />} />
          <Route path="bookings/:id" element={<BookingDetailsPage />} />
          <Route path="profile" element={<ProviderProfileSettingsPage />} />
        </Route>

        {/* Administrator Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="verifications" element={<AdminVerificationsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="disputes" element={<AdminDisputesPage />} />
        </Route>

        {/* 404 Catch-All */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
