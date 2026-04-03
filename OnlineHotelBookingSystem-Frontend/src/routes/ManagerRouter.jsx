import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HotelManagerDashboard from '../pages/manager/HotelManagerDashboard';
import AllBookings from '../pages/manager/AllBookings';
import AllRooms from '../pages/manager/AllRooms';
import PendingCancellations from '../pages/manager/PendingCancellations';
import Logout from '../components/Logout';
import MainLayout from '../components/manager/MainLayout';

function ManagerRouter() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <MainLayout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/manager/dashboard" element={<HotelManagerDashboard />} />
        <Route path="/manager/bookings/all" element={<AllBookings />} />
        <Route path="/manager/rooms/all" element={<AllRooms />} />
        <Route path="/manager/bookings/pending-cancellations" element={<PendingCancellations />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </MainLayout>
  );
}

export default ManagerRouter;
