import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { destinations } from '../mockData';

const Destinations = () => {
  return (
    <div className="py-24 px-6 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Popular Destinations
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore our most sought-after destinations and start planning your next adventure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.city}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-amber-400" />
                  <span className="text-amber-400 font-medium">{destination.country}</span>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-2">
                  {destination.city}
                </h3>
                
                <p className="text-slate-200 mb-4">
                  {destination.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-slate-300">Starting from</span>
                    <div className="text-2xl font-bold text-white">
                      ${destination.price}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold transition-all duration-300 group-hover:translate-x-1"
                  >
                    Book Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 border-2 border-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-semibold px-8 transition-all duration-300"
          >
            View All Destinations
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Destinations;
