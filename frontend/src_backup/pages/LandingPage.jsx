import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FlightSearch from '../components/FlightSearch';
import Destinations from '../components/Destinations';
import Features from '../components/Features';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <FlightSearch />
      <Destinations />
      <Features />
      <Footer />
    </div>
  );
};

export default LandingPage;
