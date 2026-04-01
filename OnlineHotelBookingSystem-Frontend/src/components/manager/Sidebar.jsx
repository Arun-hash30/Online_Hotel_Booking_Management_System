import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, CalendarIcon, DocumentTextIcon, CogIcon } from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);

  return (
    <div className="fixed inset-y-0 left-0 bg-gray-900 text-gray-100 w-64 overflow-y-auto shadow-md z-10">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-xl font-semibold text-white">
          Manager Panel
        </h2>
      </div>

      {/* Navigation */}
      <nav>
        <ul className="space-y-2">

          {/* Dashboard (optional) */}
          <li>
            <Link
              to="/dashboard"
              className="flex items-center py-2.5 px-4 text-sm rounded-lg hover:bg-gray-800"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Dashboard
            </Link>
          </li>

          {/* BOOKINGS */}
          <li>
            <button
              onClick={() => setBookingOpen(!bookingOpen)}
              className="w-full flex justify-between items-center py-2.5 px-4 text-sm rounded-lg hover:bg-gray-800"
            >
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Booking
              </div>

              <svg
                className={`w-4 h-4 transition-transform ${bookingOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {bookingOpen && (
              <ul className="ml-6">
                <li>
                  <Link
                    to="/bookings/all"
                    className="block py-2 px-4 text-sm rounded-lg hover:bg-gray-800"
                  >
                    All Bookings
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* ROOMS */}
          <li>
            <button
              onClick={() => setRoomsOpen(!roomsOpen)}
              className="w-full flex justify-between items-center py-2.5 px-4 text-sm rounded-lg hover:bg-gray-800"
            >
              <div className="flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Rooms
              </div>

              <svg
                className={`w-4 h-4 transition-transform ${roomsOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {roomsOpen && (
              <ul className="ml-6">
                <li>
                  <Link
                    to="/rooms/all"
                    className="block py-2 px-4 text-sm rounded-lg hover:bg-gray-800"
                  >
                    All Rooms
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* SETTINGS (optional) */}
          <li>
            <Link
              to="/settings"
              className="flex items-center py-2.5 px-4 text-sm rounded-lg hover:bg-gray-800"
            >
              <CogIcon className="w-5 h-5 mr-2" />
              Settings
            </Link>
          </li>

        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;