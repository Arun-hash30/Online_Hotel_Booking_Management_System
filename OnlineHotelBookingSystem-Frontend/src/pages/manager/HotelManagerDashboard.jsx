// src/pages/manager/HotelManagerDashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  CalendarIcon, 
  CurrencyRupeeIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';

const HotelManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingCancellations, setPendingCancellations] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    
    if (!token || role !== "HOTELMANAGER") {
      toast.error("Access denied. Hotel Manager privileges required.");
      navigate("/login");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      // Fetch pending cancellations
      const pendingResponse = await axios.get(
        "http://localhost:8080/bookings/pending-cancellations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPendingCancellations(pendingResponse.data);
      
      // Fetch all bookings
      const bookingsResponse = await axios.get(
        "http://localhost:8080/bookings/getAll",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Fetch rooms and hotels for details
      const roomsResponse = await axios.get("http://localhost:8080/rooms/getAll");
      const hotelsResponse = await axios.get("http://localhost:8080/hotels/getAll");
      
      const enrichedBookings = bookingsResponse.data.map((booking) => {
        const room = roomsResponse.data.find(r => r.id === booking.roomId);
        const hotel = hotelsResponse.data.find(h => h.id === room?.hotelId);
        return {
          ...booking,
          roomDetails: room,
          hotelDetails: hotel
        };
      });
      
      setAllBookings(enrichedBookings);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCancellation = async (bookingId) => {
    if (!window.confirm("Are you sure you want to approve this cancellation? The booking will be cancelled and refund will be processed.")) {
      return;
    }
    
    setProcessingId(bookingId);
    const token = localStorage.getItem("token");
    
    try {
      await axios.post(
        `http://localhost:8080/bookings/approve-cancellation/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.success("Cancellation approved successfully!");
      fetchData();
    } catch (error) {
      console.error("Error approving cancellation:", error);
      toast.error(error.response?.data?.error || "Failed to approve cancellation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectCancellation = async (bookingId) => {
    if (!window.confirm("Are you sure you want to reject this cancellation? The booking will remain confirmed.")) {
      return;
    }
    
    setProcessingId(bookingId);
    const token = localStorage.getItem("token");
    
    try {
      await axios.post(
        `http://localhost:8080/bookings/reject-cancellation/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.success("Cancellation request rejected!");
      fetchData();
    } catch (error) {
      console.error("Error rejecting cancellation:", error);
      toast.error(error.response?.data?.error || "Failed to reject cancellation");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "PENDING_CANCELLATION":
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending Approval</span>;
      case "CANCELLED":
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Cancelled</span>;
      case "CONFIRMED":
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Confirmed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`${
              activeTab === "pending"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } flex items-center py-2 px-1 border-b-2 font-medium text-sm`}
          >
            <ClockIcon className="h-5 w-5 mr-2" />
            Pending Cancellations
            {pendingCancellations.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {pendingCancellations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`${
              activeTab === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } flex items-center py-2 px-1 border-b-2 font-medium text-sm`}
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            All Bookings
          </button>
        </nav>
      </div>

      {/* Pending Cancellations Tab */}
      {activeTab === "pending" && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Pending Cancellation Requests</h2>
            <p className="text-gray-600">Review and take action on cancellation requests</p>
          </div>
          
          {pendingCancellations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
              <p className="mt-1 text-sm text-gray-500">All cancellation requests have been processed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCancellations.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Booking #{booking.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Requested on: {booking.cancellationRequestDate ? format(new Date(booking.cancellationRequestDate), 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Guest ID</p>
                        <p className="font-medium">{booking.userId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Room ID</p>
                        <p className="font-medium">{booking.roomId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Check-in</p>
                        <p className="font-medium">{format(new Date(booking.checkInDate), 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Check-out</p>
                        <p className="font-medium">{format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-medium text-lg text-blue-600">₹{booking.totalPrice}</p>
                      </div>
                    </div>
                    
                    {booking.cancellationReason && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-semibold text-yellow-800">Cancellation Reason:</p>
                        <p className="text-sm text-yellow-700">{booking.cancellationReason}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApproveCancellation(booking.id)}
                        disabled={processingId === booking.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      >
                        <CheckCircleIcon className="h-5 w-5 inline mr-1" />
                        Approve Cancellation
                      </button>
                      <button
                        onClick={() => handleRejectCancellation(booking.id)}
                        disabled={processingId === booking.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      >
                        <XCircleIcon className="h-5 w-5 inline mr-1" />
                        Reject Cancellation
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Bookings Tab */}
      {activeTab === "all" && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Bookings</h2>
            <p className="text-gray-600">View all hotel bookings</p>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{booking.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.userId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.roomId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.hotelDetails?.name || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(booking.checkInDate), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">₹{booking.totalPrice}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelManagerDashboard;