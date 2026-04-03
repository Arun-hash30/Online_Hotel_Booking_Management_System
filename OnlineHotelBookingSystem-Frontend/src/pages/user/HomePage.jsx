import React from 'react';
import HomeCarousel from '../../components/user/HomeCarousel';
import HotelsList from './HotelsList';
import Footer from '../../components/common/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HomeCarousel />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Stay</h2>
          <p className="text-xl text-gray-600">Discover amazing hotels and book your dream vacation</p>
        </div>
        <HotelsList />
      </div>
    </div>
  );
};

export default HomePage;
