import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('https://online-hotel-booking-system-bf2k.onrender.com/bookings/getAll')
      .then(res => { setBookings(res.data); setLoading(false); })
      .catch(err => { console.error('Error fetching bookings:', err); setLoading(false); });
  }, []);

  const statusColors = {
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    PENDING_CANCELLATION: 'bg-yellow-100 text-yellow-700',
  };

  const filtered = bookings.filter(b =>
    String(b.userId).includes(searchTerm) ||
    String(b.roomId).includes(searchTerm) ||
    b.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">All Bookings</h1>

      <input
        type="text"
        placeholder="Search by user ID, room ID or status..."
        value={searchTerm}
        onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
        className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No bookings found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                {['Booking ID', 'User ID', 'Room ID', 'Check-In', 'Check-Out', 'Total Price', 'Status', 'Cancellation'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginated.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">#{booking.id}</td>
                  <td className="px-4 py-3">{booking.userId}</td>
                  <td className="px-4 py-3">{booking.roomId}</td>
                  <td className="px-4 py-3">{booking.checkInDate}</td>
                  <td className="px-4 py-3">{booking.checkOutDate}</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">
                    ₹{booking.totalPrice?.toFixed(2) ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {booking.cancellationRequested ? (
                      <span className="text-orange-600 font-medium">Pending Review</span>
                    ) : booking.cancellationReason ? (
                      <span title={booking.cancellationReason}>Has reason</span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
        <span>Page {page + 1} of {totalPages || 1}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
      </div>

      {/* Rows per page */}
      <div className="flex justify-end mt-2">
        <select value={rowsPerPage} onChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
          className="border border-gray-300 px-3 py-1 rounded text-sm">
          {[5, 10, 25].map(n => <option key={n} value={n}>{n} rows</option>)}
        </select>
      </div>
    </div>
  );
}

export default AllBookings;
