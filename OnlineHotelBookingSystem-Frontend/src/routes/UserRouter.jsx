import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/user/HomePage';
import RoomListPage from '../pages/user/RoomListPage';
import RoomDetailsPage from '../pages/user/RoomDetailsPage';
import BookingConfirmationPage from '../pages/user/BookingConfirmationPage';
import MyBookings from '../pages/user/MyBookings';
import Navbar from '../components/user/Navbar';
import Footer from '../components/user/Footer';
import HotelsList from '../pages/user/HotelsList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserRouter = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hotels" element={<HotelsList />} />

          {/* FIX 1: was "/hotels/:hotelId/rooms" — must match Link in HotelsList: /rooms/:hotelId */}
          <Route path="/rooms/:hotelId" element={<RoomListPage />} />

          {/* FIX 2: was "/rooms/:roomId" — must match Link in RoomListPage: /booking/:roomId */}
          <Route path="/booking/:roomId" element={<RoomDetailsPage />} />

          <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default UserRouter;
