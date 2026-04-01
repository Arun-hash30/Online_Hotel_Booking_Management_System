import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PhotoIcon, TrashIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const CLOUDINARY_CLOUD_NAME = 'dtm319gzj';
const CLOUDINARY_UPLOAD_PRESET = 'ml_default';

const EMPTY_ROOM = () => ({
  type: '',
  numberAvailable: '',
  pricePerNight: '',
  images: [],
});

function AddHotel() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact: '',
    description: '',
    amenities: '',
    starRating: '',
    images: [],
  });
  const [rooms, setRooms] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [roomUploading, setRoomUploading] = useState({});
  const [uploadError, setUploadError] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Field change ─────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ── Hotel image upload ───────────────────────────────────
  const handleHotelImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setUploadError('');
    const uploadedUrls = [];
    for (const file of files) {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: data }
        );
        const result = await res.json();
        if (!res.ok) { setUploadError(result.error?.message || 'Upload failed'); continue; }
        if (result.secure_url) uploadedUrls.push(result.secure_url);
      } catch {
        setUploadError('Network error during upload');
      }
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    setUploading(false);
    e.target.value = '';
  };

  const removeHotelImage = (idx) =>
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  // ── Room handlers ────────────────────────────────────────
  const addRoom = () => setRooms(prev => [...prev, EMPTY_ROOM()]);
  const removeRoom = (idx) => setRooms(prev => prev.filter((_, i) => i !== idx));

  const handleRoomChange = (idx, e) => {
    const { name, value } = e.target;
    setRooms(prev => prev.map((r, i) => (i === idx ? { ...r, [name]: value } : r)));
  };

  const handleRoomImageUpload = async (idx, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setRoomUploading(prev => ({ ...prev, [idx]: true }));
    const uploadedUrls = [];
    for (const file of files) {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: data }
        );
        const result = await res.json();
        if (result.secure_url) uploadedUrls.push(result.secure_url);
      } catch { /* ignore per-image errors */ }
    }
    setRooms(prev =>
      prev.map((r, i) => (i === idx ? { ...r, images: [...r.images, ...uploadedUrls] } : r))
    );
    setRoomUploading(prev => ({ ...prev, [idx]: false }));
    e.target.value = '';
  };

  const removeRoomImage = (roomIdx, imgIdx) =>
    setRooms(prev =>
      prev.map((r, i) =>
        i === roomIdx ? { ...r, images: r.images.filter((_, j) => j !== imgIdx) } : r
      )
    );

  // ── Validation ───────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Hotel name is required';
    if (!formData.address.trim()) e.address = 'Address is required';
    if (!formData.contact.toString().trim()) e.contact = 'Contact is required';
    else if (isNaN(formData.contact)) e.contact = 'Contact must be a number';
    if (!formData.starRating) e.starRating = 'Star rating is required';
    return e;
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSubmitError('');
    setSubmitSuccess('');
    setSubmitting(true);

    try {
      // 1. Create hotel
      const hotelPayload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        contact: parseInt(formData.contact.toString().trim(), 10),
        description: formData.description.trim(),
        amenities: formData.amenities.trim(),
        starRating: parseInt(formData.starRating, 10),
        images: formData.images,
      };

      const hotelRes = await axios.post('http://localhost:8080/hotels/create', hotelPayload, {
        headers: { 'Content-Type': 'application/json' },
      });
      const createdHotel = hotelRes.data;

      // 2. Create each room linked to the new hotel
      for (const room of rooms) {
        if (!room.type.trim()) continue;
        const roomPayload = {
          hotelId: createdHotel.id,
          type: room.type.trim(),
          numberAvailable: parseInt(room.numberAvailable, 10) || 0,
          pricePerNight: parseFloat(room.pricePerNight) || 0,
          images: room.images,
        };
        await axios.post('http://localhost:8080/rooms/create', roomPayload, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 3. Show success then redirect to hotels list
      setSubmitSuccess('Hotel added successfully! Redirecting...');
      setTimeout(() => navigate('/admin/hotels/all'), 1500);

    } catch (err) {
      console.error('Hotel create error:', err.response?.data || err.message);
      setSubmitError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Error ${err.response?.status || ''}: Failed to add hotel. Check console for details.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isAnyUploading = uploading || Object.values(roomUploading).some(Boolean) || submitting;

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Add New Hotel</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">

          {/* Alerts */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{submitError}</p>
            </div>
          )}
          {submitSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm font-medium">{submitSuccess}</p>
            </div>
          )}

          {/* ── HOTEL DETAILS ──────────────────────────────── */}
          <div>
            <h2 className="text-base font-semibold text-gray-700 border-b pb-2 mb-4">Hotel Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotel Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Grand Palace Hotel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. MG Road, Bangalore"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of the hotel..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amenities <span className="text-xs text-gray-400">(comma separated)</span>
                </label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="Free WiFi, Pool, Spa"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Star Rating <span className="text-red-500">*</span>
                </label>
                <select
                  name="starRating"
                  value={formData.starRating}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select rating</option>
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
                {errors.starRating && <p className="text-red-500 text-xs mt-1">{errors.starRating}</p>}
              </div>
            </div>
          </div>

          {/* ── HOTEL IMAGES ───────────────────────────────── */}
          <div>
            <h2 className="text-base font-semibold text-gray-700 border-b pb-2 mb-4">Hotel Images</h2>
            {uploadError && <p className="text-red-500 text-xs mb-2">{uploadError}</p>}
            <label
              className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg p-6 cursor-pointer transition
                ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
            >
              <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                {uploading ? '⏳ Uploading...' : 'Click to upload hotel images'}
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleHotelImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {formData.images.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt="" className="w-full h-20 object-cover rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => removeHotelImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── ROOMS ──────────────────────────────────────── */}
          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-base font-semibold text-gray-700">Rooms</h2>
              <button
                type="button"
                onClick={addRoom}
                className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition"
              >
                <PlusIcon className="w-4 h-4" /> Add Room
              </button>
            </div>

            {rooms.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                No rooms added yet. Click "Add Room" to get started.
              </p>
            )}

            {rooms.map((room, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-700">Room {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeRoom(idx)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Remove room"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Room Type</label>
                    <input
                      type="text"
                      name="type"
                      value={room.type}
                      onChange={e => handleRoomChange(idx, e)}
                      placeholder="e.g. Deluxe, Suite"
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Available Rooms</label>
                    <input
                      type="number"
                      name="numberAvailable"
                      value={room.numberAvailable}
                      onChange={e => handleRoomChange(idx, e)}
                      placeholder="e.g. 10"
                      min="0"
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Price Per Night (₹)</label>
                    <input
                      type="number"
                      name="pricePerNight"
                      value={room.pricePerNight}
                      onChange={e => handleRoomChange(idx, e)}
                      placeholder="e.g. 5000"
                      min="0"
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Room Images */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Room Images</label>
                  <label
                    className={`flex items-center justify-center w-full border border-dashed rounded p-2 cursor-pointer text-xs transition
                      ${roomUploading[idx] ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                  >
                    <PhotoIcon className="w-4 h-4 text-gray-400 mr-1" />
                    {roomUploading[idx] ? 'Uploading...' : 'Upload room images'}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={e => handleRoomImageUpload(idx, e)}
                      disabled={roomUploading[idx]}
                      className="hidden"
                    />
                  </label>
                  {room.images.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {room.images.map((url, imgIdx) => (
                        <div key={imgIdx} className="relative group w-16 h-16">
                          <img src={url} alt="" className="w-full h-full object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => removeRoomImage(idx, imgIdx)}
                            className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                          >
                            <TrashIcon className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── FOOTER ACTIONS ─────────────────────────────── */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isAnyUploading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 transition"
            >
              {submitting ? 'Saving...' : isAnyUploading ? 'Please wait...' : 'Add Hotel'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AddHotel;