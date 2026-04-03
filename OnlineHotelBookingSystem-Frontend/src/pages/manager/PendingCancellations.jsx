import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckIcon, XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";

const PendingCancellations = () => {
  const [pendingCancellations, setPendingCancellations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPendingCancellations();
  }, []);

  const fetchPendingCancellations = async () => {
    const token = user?.token || localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://online-hotel-booking-system-bf2k.onrender.com/bookings/pending-cancellations",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingCancellations(response.data);
    } catch (error) {
      console.error("Error fetching pending cancellations:", error);
      toast.error("Failed to fetch pending cancellations");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    if (!window.confirm("Approve this cancellation?")) return;
    setProcessingId(bookingId);
    const token = user?.token || localStorage.getItem("token");
    try {
      await axios.post(
        `https://online-hotel-booking-system-bf2k.onrender.com/bookings/approve-cancellation/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Cancellation approved!");
      fetchPendingCancellations();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to approve cancellation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm("Reject this cancellation?")) return;
    setProcessingId(bookingId);
    const token = user?.token || localStorage.getItem("token");
    try {
      await axios.post(
        `https://online-hotel-booking-system-bf2k.onrender.com/bookings/reject-cancellation/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Cancellation rejected!");
      fetchPendingCancellations();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reject cancellation");
    } finally {
      setProcessingId(null);
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
      <ToastContainer />
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pending Cancellation Requests</h2>
        <p className="text-gray-600">Review and take action on cancellation requests</p>
      </div>

      {pendingCancellations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <CheckIcon className="mx-auto h-12 w-12 text-green-500" />
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
                    <h3 className="text-lg font-semibold text-gray-900">Booking #{booking.id}</h3>
                    <p className="text-sm text-gray-500">
                      Requested:{" "}
                      {booking.cancellationRequestDate
                        ? format(new Date(booking.cancellationRequestDate), "MMM dd, yyyy HH:mm")
                        : "N/A"}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    Pending Approval
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div><p className="text-sm text-gray-500">Guest ID</p><p className="font-medium">{booking.userId}</p></div>
                  <div><p className="text-sm text-gray-500">Room ID</p><p className="font-medium">{booking.roomId}</p></div>
                  <div>
                    <p className="text-sm text-gray-500">Check-in</p>
                    <p className="font-medium">{format(new Date(booking.checkInDate), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-out</p>
                    <p className="font-medium">{format(new Date(booking.checkOutDate), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium text-lg text-blue-600">₹{booking.totalPrice}</p>
                  </div>
                </div>

                {booking.cancellationReason && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800">Reason:</p>
                    <p className="text-sm text-yellow-700">{booking.cancellationReason}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(booking.id)}
                    disabled={processingId === booking.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckIcon className="h-5 w-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(booking.id)}
                    disabled={processingId === booking.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XMarkIcon className="h-5 w-5" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingCancellations;
