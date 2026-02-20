import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

const Hero = () => {
  const scrollToSearch = () => {
    document.getElementById('flight-search')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/34777912/pexels-photo-34777912.jpeg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="inline-block mb-6 px-4 py-2 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full">
              <span className="text-amber-400 text-sm font-medium">Premium Travel Experience</span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Fly Beyond
              <span className="block text-amber-400">Your Dreams</span>
            </h1>
            
            <p className="text-xl text-slate-200 mb-10 leading-relaxed max-w-2xl">
              Experience luxury travel at its finest. Book your next adventure with SkyLux Airlines 
              and discover a world of premium comfort and exceptional service.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg"
                onClick={scrollToSearch}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/50"
              >
                Book Your Flight
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-slate-900 font-semibold px-8 py-6 text-lg transition-all duration-300"
              >
                Explore Destinations
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/70 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
