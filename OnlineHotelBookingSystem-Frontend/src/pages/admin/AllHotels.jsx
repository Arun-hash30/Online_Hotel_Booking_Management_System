import React, { useState, useEffect } from 'react';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import EditHotel from './EditHotel';
import AddHotel from './AddHotel';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function AllHotels() {
  const [hotels, setHotels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editHotelData, setEditHotelData] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Default to 5 rows per page

  useEffect(() => { fetchHotels(); }, []);

  const fetchHotels = () => {
    axios.get('http://localhost:8080/hotels/getAll')
      .then(res => { setHotels(res.data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  // Called by AddHotel after successful create
  const handleHotelAdded = (newHotel) => {
    setHotels(prev => [...prev, newHotel]);
    setIsAddOpen(false);
    toast.success('Hotel added successfully!');
  };

  // Called by EditHotel after successful update
  const handleHotelUpdated = (updatedHotel) => {
    setHotels(prev => prev.map(h => h.id === updatedHotel.id ? updatedHotel : h));
    setEditHotelData(null);
    toast.success('Hotel updated successfully!');
  };

  const handleDelete = (hotelId) => {
    axios.delete(`http://localhost:8080/hotels/${hotelId}`)
      .then(() => {
        setHotels(prev => prev.filter(h => h.id !== hotelId));
        setDeleteConfirmId(null);
        toast.success('Hotel deleted successfully!');
      })
      .catch(err => toast.error(`Error deleting hotel: ${err.message}`));
  };

  const filteredHotels = hotels.filter(h =>
    h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page changes
  };

  const paginatedHotels = filteredHotels.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="container mx-auto px-4 py-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6 text-center">All Hotels</h1>

      {/* Search + Add */}
      <div className="flex justify-between items-center mb-4 gap-3">
        <input
          type="text"
          placeholder="Search by name or address..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4" /> Add Hotel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  {['ID', 'Name', 'Address', 'Stars', 'Contact', 'Images', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedHotels.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-500">No hotels found</td></tr>
                ) : paginatedHotels.map(hotel => (
                  <tr key={hotel.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{hotel.id}</td>
                    <td className="px-4 py-3 font-medium">{hotel.name}</td>
                    <td className="px-4 py-3">{hotel.address}</td>
                    <td className="px-4 py-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < hotel.starRating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">{hotel.contact}</td>
                    <td className="px-4 py-3">
                      {hotel.images?.length > 0 ? (
                        <div className="flex space-x-1">
                          {hotel.images.slice(0, 2).map((img, idx) => (
                            <img key={idx} src={img} alt="" className="w-10 h-10 object-cover rounded"
                              onError={e => { e.target.style.display = 'none'; }} />
                          ))}
                          {hotel.images.length > 2 && (
                            <span className="text-xs text-gray-500 self-center">+{hotel.images.length - 2}</span>
                          )}
                        </div>
                      ) : <span className="text-gray-400 text-sm">No images</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button onClick={() => setEditHotelData(hotel)} className="text-blue-500 hover:text-blue-700">
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => setDeleteConfirmId(hotel.id)} className="text-red-500 hover:text-red-700">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls - matching AllRooms style */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <button
                onClick={() => handleChangePage(page - 1)}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-200 text-gray-600 rounded-l-md hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-gray-200 text-gray-600">
                Page {page + 1} of {Math.ceil(filteredHotels.length / rowsPerPage)}
              </span>
              <button
                onClick={() => handleChangePage(page + 1)}
                disabled={page >= Math.ceil(filteredHotels.length / rowsPerPage) - 1}
                className="px-4 py-2 bg-gray-200 text-gray-600 rounded-r-md hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              className="border border-gray-300 px-4 py-2 rounded-md"
            >
              <option value={5}>5 rows</option>
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
            </select>
          </div>
        </>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Hotel</h3>
            <p className="text-gray-600 mb-6">Are you sure? This cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hotel Modal */}
      {editHotelData && (
        <EditHotel
          hotelData={editHotelData}
          onSave={handleHotelUpdated}
          onCancel={() => setEditHotelData(null)}
        />
      )}

      {/* Add Hotel Modal */}
      {isAddOpen && (
        <AddHotel
          onHotelAdded={handleHotelAdded}
          onClose={() => setIsAddOpen(false)}
        />
      )}
    </div>
  );
}

export default AllHotels;