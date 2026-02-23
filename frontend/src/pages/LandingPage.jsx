import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FlightSearch from '../components/FlightSearch';
import Destinations from '../components/Destinations';
import Features from '../components/Features';
import Footer from '../components/Footer';

const LandingPage = () => {
  const [preSelectedDestination, setPreSelectedDestination] = React.useState(null);

  const handleSelectDestination = (code) => {
    setPreSelectedDestination(code);
    // Smooth scroll to flight search
    const element = document.getElementById('flight-search');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <FlightSearch preSelectedDestination={preSelectedDestination} />
      <Destinations onSelectDestination={handleSelectDestination} />
      <Features />
      <Footer />
    </div>
  );
};

export default LandingPage;
