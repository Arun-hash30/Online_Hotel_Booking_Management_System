import React, { useState } from 'react';
import { XMarkIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';

const CLOUDINARY_CLOUD_NAME = 'dtm319gzj';
const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // must be an unsigned preset in Cloudinary dashboard

const EditRoom = ({ room, hotels, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: room.id,
    hotelId: room.hotelId,
    numberAvailable: room.numberAvailable,
    pricePerNight: room.pricePerNight,
    type: room.type,
    images: room.images || [],
  });
  const [uploading, setUploading] = useState(false);
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
    const uploadedUrls = [];

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
        if (result.secure_url) {
          uploadedUrls.push(result.secure_url);
        }
      } catch (err) {
        console.error('Upload failed for file:', file.name, err);
      }
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls],
    }));
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
    if (!formData.type || !String(formData.type).trim()) newErrors.type = 'Room type is required';
    if (!formData.numberAvailable || formData.numberAvailable < 0)
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
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      {/* Modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Edit Room #{room.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">

          {/* Hotel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel <span className="text-red-500">*</span></label>
            <select
              name="hotelId"
              value={formData.hotelId}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {hotels.map(hotel => (
                <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
              ))}
            </select>
            {errors.hotelId && <p className="text-red-500 text-xs mt-1">{errors.hotelId}</p>}
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type <span className="text-red-500">*</span></label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Number Available <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="numberAvailable"
              value={formData.numberAvailable}
              onChange={handleInputChange}
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.numberAvailable && <p className="text-red-500 text-xs mt-1">{errors.numberAvailable}</p>}
          </div>

          {/* Price Per Night */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Night (₹) <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="pricePerNight"
              value={formData.pricePerNight}
              onChange={handleInputChange}
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.pricePerNight && <p className="text-red-500 text-xs mt-1">{errors.pricePerNight}</p>}
          </div>

          {/* Cloudinary Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Images</label>
            <label className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition">
              <div className="text-center">
                <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                <p className="text-sm text-gray-500">
                  {uploading ? 'Uploading to Cloudinary...' : 'Click to upload more images'}
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP supported</p>
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
                      className="w-full h-24 object-cover rounded-lg"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=Image'; }}
                    />
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                      title="Remove image"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {formData.images.length === 0 && (
              <p className="text-sm text-gray-400 mt-2 text-center">No images yet</p>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRoom;