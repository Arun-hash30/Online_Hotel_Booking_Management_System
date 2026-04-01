import React, { useState } from 'react';
import { XMarkIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';

// ─────────────────────────────────────────────────────────────
// CLOUDINARY CONFIG
// Go to: cloudinary.com → Settings → Upload → Upload Presets
// Create a preset with:
//   - Preset name: ml_default  (or any name you choose)
//   - Signing mode: Unsigned   ← THIS IS REQUIRED
// Then paste that preset name below:
// ─────────────────────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = 'dtm319gzj';
const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // ← change this to your unsigned preset name

const AddRoom = ({ hotels, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    hotelId: '',
    numberAvailable: '',
    pricePerNight: '',
    type: '',
    images: [],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    setUploadError('');
    const uploadedUrls = [];
    const failedFiles = [];

    for (const file of files) {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      data.append('folder', 'hotel_booking_system/rooms');

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: data }
        );

        const result = await res.json();

        if (!res.ok) {
          // Show exact Cloudinary error message
          console.error('Cloudinary error:', result);
          failedFiles.push(`${file.name}: ${result.error?.message || 'Upload failed'}`);
          continue;
        }

        if (result.secure_url) {
          uploadedUrls.push(result.secure_url);
        }
      } catch (err) {
        console.error('Network error uploading:', file.name, err);
        failedFiles.push(`${file.name}: Network error`);
      }
    }

    if (failedFiles.length > 0) {
      setUploadError(
        `Some uploads failed: ${failedFiles.join(', ')}. ` +
        `Make sure your Cloudinary upload preset "${CLOUDINARY_UPLOAD_PRESET}" exists and is set to Unsigned.`
      );
    }

    if (uploadedUrls.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    }

    setUploading(false);
    e.target.value = '';
  };

  const handleRemoveImage = (idx) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.hotelId) newErrors.hotelId = 'Please select a hotel';
    if (!formData.type.trim()) newErrors.type = 'Room type is required';
    if (!formData.numberAvailable || formData.numberAvailable <= 0)
      newErrors.numberAvailable = 'Enter a valid number of available rooms';
    if (!formData.pricePerNight || formData.pricePerNight <= 0)
      newErrors.pricePerNight = 'Enter a valid price per night';
    return newErrors;
  };

  const handleSave = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({
      ...formData,
      hotelId: parseInt(formData.hotelId, 10),
      numberAvailable: parseInt(formData.numberAvailable, 10),
      pricePerNight: parseFloat(formData.pricePerNight),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Add New Room</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">

          {/* Hotel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hotel <span className="text-red-500">*</span>
            </label>
            <select
              name="hotelId"
              value={formData.hotelId}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a hotel</option>
              {hotels.map(hotel => (
                <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
              ))}
            </select>
            {errors.hotelId && <p className="text-red-500 text-xs mt-1">{errors.hotelId}</p>}
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              placeholder="e.g. Deluxe, Suite, Standard"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
          </div>

          {/* Number Available */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number Available <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="numberAvailable"
              value={formData.numberAvailable}
              onChange={handleInputChange}
              min="0"
              placeholder="e.g. 10"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.numberAvailable && <p className="text-red-500 text-xs mt-1">{errors.numberAvailable}</p>}
          </div>

          {/* Price Per Night */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Per Night (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="pricePerNight"
              value={formData.pricePerNight}
              onChange={handleInputChange}
              min="0"
              placeholder="e.g. 5000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.pricePerNight && <p className="text-red-500 text-xs mt-1">{errors.pricePerNight}</p>}
          </div>

          {/* Cloudinary Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Images</label>

            {/* Upload error alert */}
            {uploadError && (
              <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-xs">{uploadError}</p>
                <p className="text-red-500 text-xs mt-1">
                  Fix: Go to <strong>cloudinary.com → Settings → Upload → Upload Presets</strong> and create an <strong>Unsigned</strong> preset named <strong>"{CLOUDINARY_UPLOAD_PRESET}"</strong>
                </p>
              </div>
            )}

            <label className={`flex items-center justify-center w-full border-2 border-dashed rounded-lg p-4 cursor-pointer transition ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}>
              <div className="text-center">
                <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                <p className="text-sm text-gray-500">
                  {uploading ? '⏳ Uploading to Cloudinary...' : 'Click to upload images'}
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP — multiple files supported</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {/* Image Previews */}
            {formData.images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`Room ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                      title="Remove image"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white text-xs text-center py-0.5 rounded-b-lg opacity-0 group-hover:opacity-100 transition">
                      Uploaded ✓
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Please wait...' : 'Add Room'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRoom;