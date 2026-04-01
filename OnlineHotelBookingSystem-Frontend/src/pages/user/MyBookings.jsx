// src/pages/user/MyBookings.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId) {
      setError("Please log in to view your bookings.");
      setLoading(false);
      return;
    }

    try {
      const bookingsResponse = await axios.get(
        "http://localhost:8080/bookings/getAll",
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );

      const userBookings = bookingsResponse.data.filter(
        (b) => b.userId === parseInt(userId)
      );

      const roomsResponse = await axios.get("http://localhost:8080/rooms/getAll");
      const hotelsResponse = await axios.get("http://localhost:8080/hotels/getAll");

      const enrichedBookings = userBookings.map((booking) => {
        const room = roomsResponse.data.find((r) => r.id === booking.roomId);
        const hotel = hotelsResponse.data.find((h) => h.id === room?.hotelId);
        return { ...booking, roomDetails: room, hotelDetails: hotel };
      });

      setBookings(enrichedBookings);
      setLoading(false);
    } catch (err) {
      setError("Failed to load bookings.");
      setLoading(false);
      toast.error("Failed to load bookings");
    }
  };

  // Only CONFIRMED bookings can raise a cancellation request
  const canRequestCancellation = (booking) => booking.status === "CONFIRMED";

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setCancellationReason("");
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async () => {
    if (!cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }

    const token = localStorage.getItem("token");
    setSubmitting(true);

    try {
      await axios.post(
        "http://localhost:8080/bookings/request-cancellation",
        { bookingId: selectedBooking.id, reason: cancellationReason },
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );

      toast.success("Cancellation request submitted! Awaiting manager approval.");
      setShowCancelModal(false);
      setSelectedBooking(null);
      fetchUserBookings();
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to submit request. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "PENDING_CANCELLATION") {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1 text-sm font-medium">
          <ClockIcon className="h-4 w-4" />
          Pending
        </span>
      );
    }
    if (status === "CANCELLED") {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          Cancelled
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full flex items-center gap-1 text-sm font-medium">
        <CheckCircleIcon className="h-4 w-4" />
        Confirmed
      </span>
    );
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Bookings</h1>

      {bookings.length === 0 && (
        <p className="text-center text-gray-500 py-10">No bookings found.</p>
      )}

      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white shadow-md rounded-xl p-5 mb-4 border border-gray-100"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-bold text-lg text-gray-800">
                {booking.hotelDetails?.name || "Hotel"}
              </h2>
              <p className="flex items-center text-gray-500 text-sm mt-1">
                <MapPinIcon className="h-4 w-4 mr-1 shrink-0" />
                {booking.hotelDetails?.address || "Address not available"}
              </p>
            </div>
            {getStatusBadge(booking.status)}
          </div>

          {/* Booking Details */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Room:</span>{" "}
              {booking.roomDetails?.type || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Booking ID:</span> #{booking.id}
            </p>
            <p>
              <span className="font-semibold">Check-in:</span>{" "}
              {format(new Date(booking.checkInDate), "PPP")}
            </p>
            <p>
              <span className="font-semibold">Check-out:</span>{" "}
              {format(new Date(booking.checkOutDate), "PPP")}
            </p>
            {booking.totalPrice && (
              <p>
                <span className="font-semibold">Total:</span> ₹
                {booking.totalPrice.toFixed(2)}
              </p>
            )}
          </div>

          {/* Pending Cancellation Banner */}
          {booking.status === "PENDING_CANCELLATION" && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 shrink-0" />
              <span className="text-sm text-yellow-800">
                Your cancellation request is pending manager approval.
              </span>
            </div>
          )}

          {/* Cancelled Banner */}
          {booking.status === "CANCELLED" && (
            <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 shrink-0" />
              <span className="text-sm text-red-700">
                This booking has been cancelled.
              </span>
            </div>
          )}

          {/* Cancel Request Button — only for CONFIRMED bookings */}
          {canRequestCancellation(booking) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => openCancelModal(booking)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Request Cancellation
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Cancellation Request Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md mx-4">

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Request Cancellation
              </h2>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Booking Summary */}
            {selectedBooking && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800">
                  {selectedBooking.hotelDetails?.name}
                </p>
                <p>Room: {selectedBooking.roomDetails?.type}</p>
                <p>
                  Check-in: {format(new Date(selectedBooking.checkInDate), "PPP")}
                </p>
                <p>
                  Check-out:{" "}
                  {format(new Date(selectedBooking.checkOutDate), "PPP")}
                </p>
              </div>
            )}

            {/* Info note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Your request will be reviewed by the hotel manager. You will be
                notified by email once a decision is made.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              Reason for cancellation <span className="text-red-500">*</span>
            </p>

            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              rows={3}
              placeholder="e.g. Change of plans, emergency, found a better option..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;