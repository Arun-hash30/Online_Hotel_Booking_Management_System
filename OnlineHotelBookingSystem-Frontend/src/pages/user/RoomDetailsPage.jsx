import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BookingForm from '../../components/user/BookingForm';

const RoomDetailsPage = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchRoomDetails = async () => {
    try {
      const [roomResponse, hotelsResponse] = await Promise.all([
        axios.get(`http://localhost:8080/rooms/${roomId}`),
        axios.get('http://localhost:8080/hotels/getAll')
      ]);

      const roomData = roomResponse.data;

      const hotelData = hotelsResponse.data.find(
        (h) => Number(h.id) === Number(roomData.hotelId)
      );

      setRoom(roomData);
      setHotel(hotelData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching room details:', error);
      setError('Failed to fetch room details. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId]);

  const nextImage = () => {
    if (room?.images && room.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
    }
  };

  const prevImage = () => {
    if (room?.images && room.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Room not found.</p>
      </div>
    );
  }

  const hotelName = hotel?.name ?? 'Unknown Hotel';
  const hotelAddress = hotel?.address ?? '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
            {room.images && room.images.length > 0 ? (
              <>
                <img
                  src={room.images[currentImageIndex]}
                  alt={room.type}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/800x600?text=Room+Image';
                  }}
                />
                {room.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-xl">Room Image</span>
              </div>
            )}
          </div>

          {room.images && room.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {room.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                    idx === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Room Details */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {hotelName} - {room.type} Room
            </h1>
            {hotelAddress && (
              <p className="text-gray-600 flex items-center">
                <svg className="h-5 w-5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {hotelAddress}
              </p>
            )}
          </div>

          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Price per night:</span>
              <span className="text-3xl font-bold text-blue-600">₹{room.pricePerNight}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Availability:</span>
              <span className={`font-semibold ${room.numberAvailable > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {room.numberAvailable > 0
                  ? `${room.numberAvailable} rooms available`
                  : 'Not Available'}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Free WiFi</span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Air Conditioning</span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">TV</span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Room Service</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">
              Experience luxury and comfort in our {room.type} room at {hotelName}.
              Perfect for your stay with modern amenities and excellent service.
            </p>
          </div>

          {room.numberAvailable > 0 && (
            <BookingForm onBookingSuccess={fetchRoomDetails} />
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPage;