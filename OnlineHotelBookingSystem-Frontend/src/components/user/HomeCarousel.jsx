import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

const HomeCarousel = () => {
  const carouselImages = [
    {
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=600&fit=crop",
      title: "Luxury Accommodations",
      subtitle: "Experience comfort like never before"
    },
    {
      url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&h=600&fit=crop",
      title: "Premium Amenities",
      subtitle: "Enjoy world-class facilities"
    },
    {
      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&h=600&fit=crop",
      title: "Stunning Locations",
      subtitle: "Beautiful destinations worldwide"
    },
    {
      url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&h=600&fit=crop",
      title: "Relaxing Getaways",
      subtitle: "Perfect for your next vacation"
    }
  ];

  return (
    <div className="relative w-full h-[80vh] overflow-hidden">
      <Carousel
        showStatus={false}
        showThumbs={false}
        infiniteLoop={true}
        autoPlay={true}
        interval={5000}
        stopOnHover={false}
        transitionTime={800}
        showArrows={true}
        className="h-full"
      >
        {carouselImages.map((image, index) => (
          <div key={index} className="relative h-[80vh]">
            <img
              className="object-cover w-full h-full"
              src={image.url}
              alt={image.title}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white">
              <h2 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
                {image.title}
              </h2>
              <p className="text-xl md:text-2xl animate-slide-up">
                {image.subtitle}
              </p>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default HomeCarousel;
