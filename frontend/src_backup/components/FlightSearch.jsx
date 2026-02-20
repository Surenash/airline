import React, { useState } from 'react';
import { Search, Calendar, Users, MapPin, Plane } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { flightClasses } from '../mockData';
import { useToast } from '../hooks/use-toast';

const FlightSearch = () => {
  const { toast } = useToast();
  const [tripType, setTripType] = useState('round-trip');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departure: '',
    return: '',
    passengers: '1',
    flightClass: 'economy'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.from || !formData.to || !formData.departure) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Search Initiated",
      description: `Searching flights from ${formData.from} to ${formData.to}`,
    });
    
    // Mock search - in real app, this would call backend API
    console.log('Search params:', formData);
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

        {/* Glass-morphism Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-slate-200">
          {/* Trip Type Toggle */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setTripType('round-trip')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                tripType === 'round-trip'
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Round Trip
            </button>
            <button
              onClick={() => setTripType('one-way')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                tripType === 'one-way'
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
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="from"
                    placeholder="Departure city"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                    className="pl-12 py-6 text-lg border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to" className="text-slate-700 font-medium">To</Label>
                <div className="relative">
                  <Plane className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="to"
                    placeholder="Destination city"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    className="pl-12 py-6 text-lg border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                  />
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
                    {flightClasses.map((fc) => (
                      <SelectItem key={fc.value} value={fc.value} className="text-lg">
                        {fc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-6 text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <Search className="mr-2 h-5 w-5" />
              Search Flights
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FlightSearch;
