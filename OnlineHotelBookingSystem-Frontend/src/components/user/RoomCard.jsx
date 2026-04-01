import { Link } from 'react-router-dom';

const RoomCard = ({ room }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden">
        {room.images && room.images.length > 0 ? (
          <img
            src={room.images[0]}
            alt={room.type}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/800x600?text=Room+Image';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
            <span className="text-white font-semibold">Room Image</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {room.numberAvailable} Available
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{room.type} Room</h3>
        <p className="text-gray-600 mb-3">
          <span className="font-semibold">Price:</span> ₹{room.pricePerNight} / night
        </p>
        <Link
          to={`/rooms/${room.id}`}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;