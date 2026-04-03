import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditRoom from './EditRoom';
import AddRoom from './AddRoom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

function AllRooms() {
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  useEffect(() => {
    fetchRooms();
    fetchHotels();
  }, []);

  const fetchRooms = () => {
    axios.get('https://online-hotel-booking-system-bf2k.onrender.com/rooms/getAll')
      .then(res => setRooms(res.data))
      .catch(() => setError('Failed to fetch rooms'));
  };

  const fetchHotels = () => {
    axios.get('https://online-hotel-booking-system-bf2k.onrender.com/hotels/getAll')
      .then(res => setHotels(res.data))
      .catch(() => setError('Failed to fetch hotels'));
  };

  const handleDeleteRoom = (roomId) => {
    if (!window.confirm('Delete this room?')) return;
    axios.delete(`https://online-hotel-booking-system-bf2k.onrender.com/rooms/${roomId}`)
      .then(res => {
        if (res.status === 204) {
          toast.success('Room deleted');
          setRooms(rooms.filter(r => r.id !== roomId));
        }
      })
      .catch(() => {
        toast.error('Delete failed');
        fetchRooms();
      });
  };

  const handleSaveRoom = (updatedRoom) => {
    axios.put(`https://online-hotel-booking-system-bf2k.onrender.com/rooms/${updatedRoom.id}`, updatedRoom)
      .then(res => {
        toast.success('Room updated successfully');
        setRooms(rooms.map(r => r.id === res.data.id ? res.data : r));
        setEditingRoom(null);
        fetchRooms(); // refresh to get updated images
      })
      .catch(() => toast.error('Update failed'));
  };

  const handleAddRoom = (newRoom) => {
    axios.post('https://online-hotel-booking-system-bf2k.onrender.com/rooms/create', newRoom)
      .then(res => {
        toast.success('Room added successfully');
        setRooms([...rooms, res.data]);
        setIsAddRoomOpen(false);
        fetchRooms();
      })
      .catch(() => toast.error('Failed to add room'));
  };

  const mergedRooms = rooms.map(room => {
    const hotel = hotels.find(h => Number(h.id) === Number(room.hotelId));
    return { ...room, hotelName: hotel ? hotel.name : 'Unknown' };
  });

  const paginatedRooms = mergedRooms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(mergedRooms.length / rowsPerPage);

  return (
    <div className="container mx-auto px-4 py-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6 text-center">All Rooms</h1>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsAddRoomOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Room
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Room ID</th>
              <th className="px-4 py-2 text-left">Hotel</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Available</th>
              <th className="px-4 py-2 text-left">Price/Night</th>
              <th className="px-4 py-2 text-left">Images</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRooms.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">No rooms found</td>
              </tr>
            ) : (
              paginatedRooms.map(room => (
                <tr key={room.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{room.id}</td>
                  <td className="px-4 py-2">{room.hotelName}</td>
                  <td className="px-4 py-2">{room.type}</td>
                  <td className="px-4 py-2">{room.numberAvailable}</td>
                  <td className="px-4 py-2">₹{room.pricePerNight}</td>
                  <td className="px-4 py-2">
                    {room.images && room.images.length > 0 ? (
                      <div className="flex space-x-1">
                        {room.images.slice(0, 2).map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt=""
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ))}
                        {room.images.length > 2 && (
                          <span className="text-xs text-gray-500 self-center">+{room.images.length - 2}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No images</span>
                    )}
                  </td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button
                      onClick={() => setEditingRoom(room)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 0}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>Page {page + 1} of {totalPages || 1}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page >= totalPages - 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {editingRoom && (
        <EditRoom
          room={editingRoom}
          hotels={hotels}
          onSave={handleSaveRoom}
          onClose={() => setEditingRoom(null)}
        />
      )}

      {/* Add Modal */}
      {isAddRoomOpen && (
        <AddRoom
          hotels={hotels}
          onSave={handleAddRoom}
          onClose={() => setIsAddRoomOpen(false)}
        />
      )}
    </div>
  );
}

export default AllRooms;
