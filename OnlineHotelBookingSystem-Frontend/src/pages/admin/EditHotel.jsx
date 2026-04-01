import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';

const CLOUDINARY_CLOUD_NAME = 'dtm319gzj';
const CLOUDINARY_UPLOAD_PRESET = 'ml_default';

// Props: hotelData, onSave(updatedHotel), onCancel()
const EditHotel = ({ hotelData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    ...hotelData,
    contact: hotelData.contact?.toString() || '', // convert Long to string for input
    images: hotelData.images || [],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setFormData({
      ...hotelData,
      contact: hotelData.contact?.toString() || '',
      images: hotelData.images || [],
    });
  }, [hotelData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageUpload = async (e) => {
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

  const handleRemoveImage = (idx) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name?.trim()) e.name = 'Hotel name is required';
    if (!formData.address?.trim()) e.address = 'Address is required';
    if (!formData.contact?.toString().trim()) e.contact = 'Contact is required';
    else if (isNaN(formData.contact)) e.contact = 'Contact must be a number';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitError('');

    try {
      const payload = {
        ...formData,
        contact: parseInt(formData.contact.toString(), 10), // FIX: Long on backend
        starRating: parseInt(formData.starRating, 10),
      };

      console.log('Sending update payload:', payload);

      const res = await axios.put(`http://localhost:8080/hotels/${formData.id}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      onSave(res.data);
    } catch (err) {
      console.error('Hotel update error:', err.response?.data || err.message);
      setSubmitError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Error ${err.response?.status}: Failed to update hotel.`
      );
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onCancel}
    >
      {/* Modal */}
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Edit Hotel</h2>
          <button
            type="button" onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}

          {/* Hotel Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hotel Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="name" value={formData.name || ''} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="address" value={formData.address || ''} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Contact — Long on backend */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number" name="contact" value={formData.contact || ''} onChange={handleChange}
              placeholder="e.g. 9876543210"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description" value={formData.description || ''} onChange={handleChange} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amenities <span className="text-xs text-gray-400">(comma separated)</span>
            </label>
            <input
              type="text" name="amenities" value={formData.amenities || ''} onChange={handleChange}
              placeholder="e.g. Free WiFi, Pool, Spa"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating</label>
            <select
              name="starRating" value={formData.starRating || ''} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Images</label>
            {uploadError && (
              <p className="text-red-500 text-xs mb-2 p-2 bg-red-50 rounded">{uploadError}</p>
            )}
            <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg p-6 cursor-pointer transition
              ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}>
              <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium">
                {uploading ? '⏳ Uploading...' : 'Click to upload more images'}
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP supported</p>
              <input
                type="file" multiple accept="image/*"
                onChange={handleImageUpload} disabled={uploading} className="hidden"
              />
            </label>

            {formData.images.length > 0 ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url} alt="" className="w-full h-24 object-cover rounded-lg border"
                      onError={e => { e.target.src = 'https://via.placeholder.com/100?text=Image'; }}
                    />
                    <button
                      type="button" onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mt-2 text-center">No images yet</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t space-x-3">
          <button
            type="button" onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="button" onClick={handleSubmit} disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {uploading ? 'Please wait...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditHotel;