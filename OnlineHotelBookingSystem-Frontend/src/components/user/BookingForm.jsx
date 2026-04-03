import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const BookingForm = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    console.log("User ID from localStorage:", userId);
    console.log("Room ID:", roomId);
    console.log("Booking dates:", formData);

    if (!userId) {
      setError("Please log in to book a room.");
      toast.error("Please log in to book a room.");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      // Create booking
      const bookingResponse = await axios.post(
        "https://online-hotel-booking-system-bf2k.onrender.com/bookings/create",
        {
          userId: parseInt(userId, 10),
          roomId: parseInt(roomId, 10),
          checkInDate: formData.checkIn,
          checkOutDate: formData.checkOut,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      console.log("Booking response:", bookingResponse.data);

      if (bookingResponse.status === 200 || bookingResponse.status === 201) {
        toast.success("Booking confirmed successfully!");

        // Navigate to booking confirmation page
        navigate("/booking-confirmation", {
          state: {
            booking: bookingResponse.data,
            roomId: roomId,
            checkIn: formData.checkIn,
            checkOut: formData.checkOut,
          },
        });
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);

      let errorMessage = "Failed to book. Please try again later.";

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);

        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = "Invalid booking request. Please check your dates.";
        } else if (error.response.status === 404) {
          errorMessage = "Room or user not found. Please try again.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your connection.";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Book Your Stay
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Check-in Date
          </label>
          <input
            type="date"
            name="checkIn"
            value={formData.checkIn}
            onChange={handleChange}
            min={minDate}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Earliest check-in: {minDate}
          </p>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Check-out Date
          </label>
          <input
            type="date"
            name="checkOut"
            value={formData.checkOut}
            onChange={handleChange}
            min={formData.checkIn || minDate}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Booking Information:</strong>
            <br />
            • Check-in after 2:00 PM
            <br />
            • Check-out before 11:00 AM
            <br />
            • Free cancellation up to 24 hours before check-in
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Book Now"
          )}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
