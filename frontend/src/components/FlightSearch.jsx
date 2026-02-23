import React, { useState, useEffect } from 'react';
import { Search, Calendar, Users, MapPin, Plane, Clock } from 'lucide-react';
import client from '../api/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { flightClasses } from '../mockData';
import { useToast } from '../hooks/use-toast';
import BookingFlow from './BookingFlow';

const FlightSearch = ({ preSelectedDestination }) => {
  const { toast } = useToast();
  const [tripType, setTripType] = useState('round-trip');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departure: '',
    return: '',
    passengers: 1,
    flightClass: 'economy'
  });
  const [searchResults, setSearchResults] = useState({ outbound: null, return: null });
  const [loading, setLoading] = useState(false);
  const [airports, setAirports] = useState([]);
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);

  useEffect(() => {
    if (preSelectedDestination) {
      setFormData(prev => ({ ...prev, to: preSelectedDestination }));
    }
  }, [preSelectedDestination]);

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await client.get('/airports');
        setAirports(response.data);
      } catch (error) {
        console.error('Failed to fetch airports', error);
        toast({
          title: "Error fetching airports",
          description: "Could not load the list of airports.",
          variant: "destructive"
        });
      }
    };
    fetchAirports();
  }, []);

  // Airports available for destination — excludes the selected origin
  const destinationAirports = airports.filter(a => a.code !== formData.from);
  // Airports available for origin — excludes the selected destination
  const originAirports = airports.filter(a => a.code !== formData.to);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.from || !formData.to || !formData.departure) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.from === formData.to) {
      toast({
        title: "Invalid Route",
        description: "Origin and destination cannot be the same.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setSearchResults({ outbound: null, return: null });

    try {
      // Fetch Outbound
      const outboundRes = await client.get('/flights/search', {
        params: {
          origin: formData.from,
          destination: formData.to,
          date: formData.departure,
          passengers: formData.passengers
        }
      });

      let returnRes = { data: [] };
      if (tripType === 'round-trip' && formData.return) {
        returnRes = await client.get('/flights/search', {
          params: {
            origin: formData.to,
            destination: formData.from,
            date: formData.return,
            passengers: formData.passengers
          }
        });
      }

      setSearchResults({
        outbound: outboundRes.data,
        return: returnRes.data
      });

      const hasExactOutbound = outboundRes.data.some(f => f.departure_time?.startsWith(formData.departure));

      if (outboundRes.data.length > 0 && !hasExactOutbound) {
        toast({
          title: "Alternative Dates Found",
          description: `No direct matches for ${formData.departure}. Showing nearest available options.`,
        });
      }
    } catch (error) {
      console.error("Search failed", error);
      toast({
        title: "Search Failed",
        description: error.response?.data?.detail || "An error occurred while searching.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (flight, isReturn = false) => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      toast({ title: "Sign In Required", description: "Please sign in to book a flight.", variant: "destructive" });
      return;
    }
    if (tripType === 'one-way') {
      // For one-way: clicking a card immediately opens the booking popup
      setSelectedOutbound(flight);
      setSelectedFlight(flight);
    } else {
      // For round-trip: first select outbound, then return, then use the button
      if (!isReturn) setSelectedOutbound(flight);
      else setSelectedReturn(flight);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Price multipliers per class
  const CLASS_MULTIPLIERS = { 'economy': 1, 'premium-economy': 1.5, 'business': 2.5, 'first': 4 };
  const CLASS_LABELS = { 'economy': 'Economy', 'premium-economy': 'Prem. Economy', 'business': 'Business', 'first': 'First Class' };

  // Sub-component for individual flight cards
  const FlightCard = ({ flight, passengers, flightClass, isSuggested, isSelected, onSelect }) => {
    const base = parseFloat(flight.base_price || 0);
    const pax = parseInt(passengers) || 1;
    const mult = CLASS_MULTIPLIERS[flightClass] || 1;
    const pricePerPerson = base * mult;
    const totalPrice = pricePerPerson * pax;

    return (
      <div
        onClick={onSelect}
        className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition-all duration-300 cursor-pointer relative overflow-hidden ${isSelected ? 'border-amber-500 ring-4 ring-amber-500/10 scale-[1.01]' : 'border-slate-200 hover:border-slate-300'
          }`}>
        {isSuggested && (
          <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider">
            Suggested Date
          </div>
        )}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full text-sm">
                {flight.airline}
              </span>
              <span className="text-slate-500 font-medium text-sm">
                Flight {flight.flight_number}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{formatTime(flight.departure_time)}</p>
                <p className="text-slate-600 font-semibold">{flight.departure_airport_code}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">{formatDate(flight.departure_time)}</p>
              </div>
              <div className="flex flex-col items-center flex-1 px-8">
                <Plane className={`h-6 w-6 mb-2 ${isSelected ? 'text-amber-500' : 'text-slate-300'}`} />
                <div className="w-full h-px bg-slate-200 relative">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                    Direct
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{formatTime(flight.arrival_time)}</p>
                <p className="text-slate-600 font-semibold">{flight.arrival_airport_code}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">{formatDate(flight.arrival_time)}</p>
              </div>
            </div>
          </div>

          {/* Pricing panel */}
          <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-8 w-full md:w-auto min-w-[190px]">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">{CLASS_LABELS[flightClass] || 'Economy'}</p>
            <p className={`text-3xl font-bold ${isSelected ? 'text-amber-600' : 'text-slate-900'}`}>${totalPrice.toFixed(0)}</p>
            <p className="text-xs text-slate-400 mt-0.5">${pricePerPerson.toFixed(0)} / person</p>

            {/* All-class comparison */}
            <div className="grid grid-cols-4 gap-1 mt-3 pt-3 border-t border-slate-100 w-full text-center">
              {Object.entries(CLASS_MULTIPLIERS).map(([cls, m]) => {
                const clsPrice = base * m * pax;
                const isActive = cls === flightClass;
                return (
                  <div key={cls} className={`rounded-lg py-1 px-1 ${isActive ? (isSelected ? 'bg-amber-500/10' : 'bg-slate-100') : ''}`}>
                    <p className={`text-[8px] uppercase font-bold tracking-wide ${isActive ? (isSelected ? 'text-amber-600' : 'text-slate-600') : 'text-slate-300'}`}>
                      {CLASS_LABELS[cls].split(' ')[0]}
                    </p>
                    <p className={`text-xs font-bold ${isActive ? (isSelected ? 'text-amber-600' : 'text-slate-900') : 'text-slate-300'}`}>
                      ${clsPrice.toFixed(0)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="flight-search" className="py-20 px-6 bg-slate-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Book Your Journey
          </h2>
          <p className="text-lg text-slate-600">
            Find and book flights to your dream destination
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-slate-200">
          {/* Trip Type Toggle */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setTripType('round-trip')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${tripType === 'round-trip'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              Round Trip
            </button>
            <button
              onClick={() => setTripType('one-way')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${tripType === 'one-way'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              One Way
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* From and To */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="from" className="text-slate-700 font-medium">From</Label>
                <div className="relative">
                  <MapPin className="absolute z-10 left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <Select
                    value={formData.from}
                    onValueChange={(value) => setFormData({ ...formData, from: value, to: formData.to === value ? '' : formData.to })}
                  >
                    <SelectTrigger className="pl-12 py-6 text-lg border-slate-300 focus:border-amber-500 focus:ring-amber-500">
                      <SelectValue placeholder="Departure city" />
                    </SelectTrigger>
                    <SelectContent>
                      {originAirports.map((airport) => (
                        <SelectItem key={airport.code} value={airport.code} className="text-lg">
                          {airport.city} ({airport.code}) — {airport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to" className="text-slate-700 font-medium">To</Label>
                <div className="relative">
                  <Plane className="absolute z-10 left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <Select
                    value={formData.to}
                    onValueChange={(value) => setFormData({ ...formData, to: value })}
                  >
                    <SelectTrigger className="pl-12 py-6 text-lg border-slate-300 focus:border-amber-500 focus:ring-amber-500">
                      <SelectValue placeholder="Destination city" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinationAirports.map((airport) => (
                        <SelectItem key={airport.code} value={airport.code} className="text-lg">
                          {airport.city} ({airport.code}) — {airport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="departure" className="text-slate-700 font-medium">Departure Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="departure"
                    type="date"
                    value={formData.departure}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                    className="pl-12 py-6 text-lg border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              {tripType === 'round-trip' && (
                <div className="space-y-2">
                  <Label htmlFor="return" className="text-slate-700 font-medium">Return Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="return"
                      type="date"
                      value={formData.return}
                      min={formData.departure || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, return: e.target.value })}
                      className="pl-12 py-6 text-lg border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Passengers and Class */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="passengers" className="text-slate-700 font-medium">Passengers</Label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    max="9"
                    value={formData.passengers}
                    onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                    className="pl-12 py-6 text-lg border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class" className="text-slate-700 font-medium">Travel Class</Label>
                <Select
                  value={formData.flightClass}
                  onValueChange={(value) => setFormData({ ...formData, flightClass: value })}
                >
                  <SelectTrigger className="py-6 text-lg border-slate-300 focus:border-amber-500 focus:ring-amber-500">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const sampleBase = parseFloat(searchResults.outbound?.[0]?.base_price || 0);
                      return Object.entries({ 'economy': 1, 'premium-economy': 1.5, 'business': 2.5, 'first': 4 }).map(([val, mult]) => {
                        const label = { 'economy': 'Economy', 'premium-economy': 'Premium Economy', 'business': 'Business Class', 'first': 'First Class' }[val];
                        const priceStr = sampleBase > 0 ? ` — $${(sampleBase * mult).toFixed(0)}` : '';
                        return (
                          <SelectItem key={val} value={val} className="text-lg">
                            {label}{priceStr}
                          </SelectItem>
                        );
                      });
                    })()}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-6 text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Search className="mr-2 h-5 w-5" />
              {loading ? 'Searching...' : 'Search Flights'}
            </Button>
          </form>
        </div>

        {/* Flight Results */}
        {(searchResults.outbound || searchResults.return) && (
          <div className="mt-12 space-y-12">
            {/* Outbound Section */}
            {searchResults.outbound && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">1</div>
                  <h3 className="text-3xl font-bold text-slate-900">
                    {tripType === 'round-trip' ? 'Select Outbound Flight' : 'Available Flights'}
                  </h3>
                </div>

                {searchResults.outbound.length === 0 ? (
                  <div className="text-center text-slate-600 bg-white p-12 rounded-2xl shadow-sm border border-slate-200">
                    <Plane className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-slate-700 mb-2">No outbound flights found</p>
                    <p className="text-slate-500">Try adjusting your dates or destinations.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {searchResults.outbound.map((flight) => {
                      const isExact = flight.departure_time?.startsWith(formData.departure);
                      return (
                        <FlightCard
                          key={flight.id}
                          flight={flight}
                          passengers={formData.passengers}
                          flightClass={formData.flightClass}
                          isSuggested={!isExact}
                          isSelected={selectedOutbound?.id === flight.id}
                          onSelect={() => handleCardClick(flight, false)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Return Section (only for round-trip) */}
            {tripType === 'round-trip' && searchResults.return && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">2</div>
                  <h3 className="text-3xl font-bold text-slate-900">Select Return Flight</h3>
                </div>

                {searchResults.return.length === 0 ? (
                  <div className="text-center text-slate-600 bg-white p-12 rounded-2xl shadow-sm border border-slate-200">
                    <Plane className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-slate-700 mb-2">No return flights found</p>
                    <p className="text-slate-500">Try adjusting your return date.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {searchResults.return.map((flight) => {
                      const isExact = flight.departure_time?.startsWith(formData.return);
                      return (
                        <FlightCard
                          key={flight.id}
                          flight={flight}
                          passengers={formData.passengers}
                          flightClass={formData.flightClass}
                          isSuggested={!isExact}
                          isSelected={selectedReturn?.id === flight.id}
                          onSelect={() => handleCardClick(flight, true)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Booking Trigger — only shown for round-trip after both flights selected */}
            {tripType === 'round-trip' && (
              <div className="flex justify-center mt-12">
                <Button
                  size="lg"
                  onClick={() => {
                    const storedUser = localStorage.getItem('user');
                    if (!storedUser) {
                      toast({ title: "Sign In Required", description: "Please sign in to book.", variant: "destructive" });
                      return;
                    }
                    if (!selectedOutbound || !selectedReturn) {
                      toast({ title: "Select Both Flights", description: "Please select both outbound and return flights.", variant: "destructive" });
                      return;
                    }
                    setSelectedFlight(selectedOutbound);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-12 py-8 text-xl rounded-full shadow-2xl transition-all hover:scale-105"
                >
                  Proceed to Booking
                </Button>
              </div>
            )}
          </div>
        )}

        {selectedFlight && (
          <BookingFlow
            outboundFlight={selectedOutbound}
            returnFlight={selectedReturn}
            initialData={formData}
            onCancel={() => setSelectedFlight(null)}
            onComplete={() => {
              setSelectedFlight(null);
              setSelectedOutbound(null);
              setSelectedReturn(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FlightSearch;
