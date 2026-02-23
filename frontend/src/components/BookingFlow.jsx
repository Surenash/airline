import React, { useState, useEffect } from 'react';
import {
    Users, Plane, Utensils, Armchair, CheckCircle2,
    ChevronRight, ChevronLeft, Loader2, X, Heart, Shield
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';
import client from '../api/client';

const MealPreferences = [
    { value: 'standard', label: 'Standard Meal' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' },
    { value: 'gluten-free', label: 'Gluten-Free' },
];

const PriceMultipliers = {
    'economy': 1,
    'premium-economy': 1.5,
    'business': 2.5,
    'first': 4
};

const AdditionalServices = [
    { id: 'wheelchair', label: 'Wheelchair Assistance', price: 0, icon: Users },
    { id: 'insurance', label: 'Travel Insurance', price: 35, icon: Shield },
    { id: 'priority', label: 'Priority Boarding', price: 50, icon: Plane },
    { id: 'baggage', label: 'Extra Baggage (23kg)', price: 45, icon: Loader2 },
];

const BookingFlow = ({ outboundFlight, returnFlight, initialData, onComplete, onCancel }) => {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    const [bookingDetails, setBookingDetails] = useState({
        passenger_name: '',
        passenger_phone: '',
        meal_preference: 'standard',
        outbound_class: initialData.flightClass || 'economy',
        return_class: initialData.flightClass || 'economy',
        passengers: initialData.passengers || 1,
        outbound_seat: '',
        return_seat: '',
        services: [] // list of service IDs
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const u = JSON.parse(storedUser);
            setUser(u);
            setBookingDetails(prev => ({
                ...prev,
                passenger_name: u.name,
                passenger_phone: u.phone || ''
            }));
        }
    }, []);

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const calculateTotalPrice = () => {
        let total = 0;

        // Outbound
        const outBase = parseFloat(outboundFlight.base_price);
        const outMult = PriceMultipliers[bookingDetails.outbound_class] || 1;
        total += outBase * outMult;

        // Return
        if (returnFlight) {
            const retBase = parseFloat(returnFlight.base_price);
            const retMult = PriceMultipliers[bookingDetails.return_class] || 1;
            total += retBase * retMult;
        }

        total *= bookingDetails.passengers;

        // Services
        bookingDetails.services.forEach(sId => {
            const service = AdditionalServices.find(s => s.id === sId);
            if (service) total += service.price;
        });

        return total.toFixed(2);
    };

    const handleCreateBooking = async () => {
        setLoading(true);
        try {
            const getServiceCost = (id) => bookingDetails.services.includes(id) ? AdditionalServices.find(s => s.id === id).price : 0;

            // 1. Create Outbound Booking
            const outRes = await client.post('/bookings', {
                flight_id: outboundFlight.id,
                user_id: user.id || 1, // Fallback if no user
                seat_class: bookingDetails.outbound_class,
                passengers: parseInt(bookingDetails.passengers),
                total_price: calculateTotalPrice(),
                passenger_name: bookingDetails.passenger_name,
                passenger_phone: bookingDetails.passenger_phone,
                meal_preference: bookingDetails.meal_preference,
                seat_number: bookingDetails.outbound_seat,
                wheelchair_service: getServiceCost('wheelchair'),
                insurance: getServiceCost('insurance'),
                priority_boarding: getServiceCost('priority'),
                extra_baggage: getServiceCost('baggage')
            });

            // 2. Create Return Booking if applicable
            if (returnFlight) {
                await client.post('/bookings', {
                    flight_id: returnFlight.id,
                    user_id: user.id || 1,
                    seat_class: bookingDetails.return_class,
                    passengers: parseInt(bookingDetails.passengers),
                    total_price: 0,
                    passenger_name: bookingDetails.passenger_name,
                    passenger_phone: bookingDetails.passenger_phone,
                    meal_preference: bookingDetails.meal_preference,
                    seat_number: bookingDetails.return_seat
                });
            }

            toast({
                title: "Journey Confirmed! ✈️",
                description: `Your booking to ${outboundFlight.arrival_airport_code} is complete.`,
            });
            onComplete(outRes.data);
        } catch (error) {
            console.error(error);
            toast({
                title: "Booking Failed",
                description: "Failed to connect to backend. Please check your connection.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const renderStepIcon = (stepNum, Icon) => (
        <div className={`flex flex-col items-center gap-2 ${step === stepNum ? 'text-amber-500' : step > stepNum ? 'text-green-500' : 'text-slate-300'}`}>
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${step === stepNum ? 'border-amber-500 bg-amber-50' : step > stepNum ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
                {step > stepNum ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-5 w-5" />}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Step {stepNum}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">
                {/* Header */}
                <div className="bg-slate-900 px-10 py-8 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Complete Your Journey</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            {outboundFlight.flight_number} {returnFlight ? `& ${returnFlight.flight_number}` : ''} • SkyLux Excellence
                        </p>
                    </div>
                    <button onClick={onCancel} className="p-3 hover:bg-white/10 rounded-full transition-all duration-300">
                        <X className="h-7 w-7" />
                    </button>
                </div>

                {/* Stepper */}
                <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    {renderStepIcon(1, Plane)}
                    <div className="flex-grow flex items-center justify-center mx-4"><div className="w-full h-px bg-slate-100" /></div>
                    {renderStepIcon(2, Users)}
                    <div className="flex-grow flex items-center justify-center mx-4"><div className="w-full h-px bg-slate-100" /></div>
                    {renderStepIcon(3, Heart)}
                    <div className="flex-grow flex items-center justify-center mx-4"><div className="w-full h-px bg-slate-100" /></div>
                    {renderStepIcon(4, Armchair)}
                    <div className="flex-grow flex items-center justify-center mx-4"><div className="w-full h-px bg-slate-100" /></div>
                    {renderStepIcon(5, Utensils)}
                </div>

                {/* Content Area */}
                <div className="flex-grow overflow-y-auto p-10">
                    {step === 1 && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                    <Plane className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">Journey Summary</h3>
                            </div>

                            <div className={`grid gap-8 ${returnFlight ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {/* Outbound */}
                                <div className="p-8 rounded-3xl bg-amber-50/50 border border-amber-100 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-amber-600 font-bold text-xs uppercase tracking-[0.2em] mb-1 block">Outbound</span>
                                            <h4 className="text-2xl font-black text-slate-900">{outboundFlight.departure_airport_code} → {outboundFlight.arrival_airport_code}</h4>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-slate-400 text-xs uppercase mb-1">{bookingDetails.outbound_class.charAt(0).toUpperCase() + bookingDetails.outbound_class.slice(1)} Price</div>
                                            <div className="text-xl font-bold text-slate-900">${(parseFloat(outboundFlight.base_price) * PriceMultipliers[bookingDetails.outbound_class]).toFixed(0)}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Select Class</Label>
                                        <Select
                                            value={bookingDetails.outbound_class}
                                            onValueChange={(val) => setBookingDetails(prev => ({ ...prev, outbound_class: val }))}
                                        >
                                            <SelectTrigger className="bg-white border-slate-200 rounded-xl h-12 shadow-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="z-[200] rounded-xl">
                                                <SelectItem value="economy">Economy — ${(parseFloat(outboundFlight.base_price) * 1).toFixed(0)}</SelectItem>
                                                <SelectItem value="premium-economy">Premium Economy — ${(parseFloat(outboundFlight.base_price) * 1.5).toFixed(0)}</SelectItem>
                                                <SelectItem value="business">Business Class — ${(parseFloat(outboundFlight.base_price) * 2.5).toFixed(0)}</SelectItem>
                                                <SelectItem value="first">First Class — ${(parseFloat(outboundFlight.base_price) * 4).toFixed(0)}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Return */}
                                {returnFlight && (
                                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <span className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-1 block">Return</span>
                                                <h4 className="text-2xl font-black text-slate-900">{returnFlight.departure_airport_code} → {returnFlight.arrival_airport_code}</h4>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-slate-400 text-xs uppercase mb-1">{bookingDetails.return_class.charAt(0).toUpperCase() + bookingDetails.return_class.slice(1)} Price</div>
                                                <div className="text-xl font-bold text-slate-900">${(parseFloat(returnFlight.base_price) * PriceMultipliers[bookingDetails.return_class]).toFixed(0)}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Select Class</Label>
                                            <Select
                                                value={bookingDetails.return_class}
                                                onValueChange={(val) => setBookingDetails(prev => ({ ...prev, return_class: val }))}
                                            >
                                                <SelectTrigger className="bg-white border-slate-200 rounded-xl h-12 shadow-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="z-[200] rounded-xl">
                                                    <SelectItem value="economy">Economy — ${(parseFloat(returnFlight.base_price) * 1).toFixed(0)}</SelectItem>
                                                    <SelectItem value="premium-economy">Premium Economy — ${(parseFloat(returnFlight.base_price) * 1.5).toFixed(0)}</SelectItem>
                                                    <SelectItem value="business">Business Class — ${(parseFloat(returnFlight.base_price) * 2.5).toFixed(0)}</SelectItem>
                                                    <SelectItem value="first">First Class — ${(parseFloat(returnFlight.base_price) * 4).toFixed(0)}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 max-w-xl mx-auto">
                            <div className="text-center space-y-2">
                                <h3 className="text-3xl font-bold text-slate-900">Traveler Information</h3>
                                <p className="text-slate-500">Enter details exactly as they appear on your passport.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Full Legal Name</Label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <Input
                                            className="pl-12 h-14 bg-white rounded-xl border-slate-200 text-lg"
                                            value={bookingDetails.passenger_name}
                                            onChange={(e) => setBookingDetails({ ...bookingDetails, passenger_name: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Contact Phone</Label>
                                    <div className="relative">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <Input
                                            className="pl-12 h-14 bg-white rounded-xl border-slate-200 text-lg"
                                            value={bookingDetails.passenger_phone}
                                            onChange={(e) => setBookingDetails({ ...bookingDetails, passenger_phone: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Dietary Preference</Label>
                                    <Select
                                        value={bookingDetails.meal_preference}
                                        onValueChange={(val) => setBookingDetails(prev => ({ ...prev, meal_preference: val }))}
                                    >
                                        <SelectTrigger className="h-14 bg-white border-slate-200 rounded-xl px-6 text-lg">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[200] rounded-xl">
                                            {MealPreferences.map(m => (
                                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8">
                            <div className="text-center space-y-2">
                                <h3 className="text-3xl font-bold text-slate-900">Elevate Your Experience</h3>
                                <p className="text-slate-500">Select additional services to make your journey more comfortable.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {AdditionalServices.map(s => {
                                    const isSelected = bookingDetails.services.includes(s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => {
                                                setBookingDetails(prev => ({
                                                    ...prev,
                                                    services: isSelected
                                                        ? prev.services.filter(id => id !== s.id)
                                                        : [...prev.services, s.id]
                                                }));
                                            }}
                                            className={`group p-8 rounded-[2rem] border-2 text-left transition-all duration-500 flex items-start gap-6 ${isSelected
                                                ? 'border-amber-500 bg-amber-50 shadow-xl scale-[1.02]'
                                                : 'border-slate-100 bg-white hover:border-amber-200 hover:shadow-lg'
                                                }`}
                                        >
                                            <div className={`p-5 rounded-[1.25rem] transition-colors duration-300 ${isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600'
                                                }`}>
                                                <s.icon size={24} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-xl mb-1">{s.label}</span>
                                                <span className={`font-bold text-sm ${isSelected ? 'text-amber-600' : 'text-slate-400'}`}>
                                                    {s.price === 0 ? 'COMPLIMENTARY' : `+$${s.price}`}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-8">
                            <div className="text-center space-y-2">
                                <h3 className="text-3xl font-bold text-slate-900">Seat Selection</h3>
                                <p className="text-slate-500">Pick your preferred seats for both legs of your journey.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Outbound */}
                                <div className="space-y-6">
                                    <div className="text-center font-black text-amber-600 text-xs uppercase tracking-[0.3em]">OUTBOUND: {outboundFlight.departure_airport_code}</div>
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 shadow-inner">
                                        <div className="grid grid-cols-4 gap-4">
                                            {['A', 'B', 'C', 'D'].map(col => (
                                                <div key={col} className="space-y-3">
                                                    <div className="text-center font-bold text-slate-400 text-xs mb-2">{col}</div>
                                                    {[12, 14, 15, 16].map(row => {
                                                        const sId = `${row}${col}`;
                                                        const isSelected = bookingDetails.outbound_seat === sId;
                                                        return (
                                                            <button
                                                                key={sId}
                                                                onClick={() => setBookingDetails({ ...bookingDetails, outbound_seat: sId })}
                                                                className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm font-black transition-all duration-300 ${isSelected ? 'bg-amber-500 text-white shadow-lg ring-4 ring-amber-100' : 'bg-white border-2 border-slate-100 text-slate-300 hover:border-amber-300 hover:text-amber-500'
                                                                    }`}
                                                            >
                                                                {row}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Return */}
                                {returnFlight && (
                                    <div className="space-y-6">
                                        <div className="text-center font-black text-slate-400 text-xs uppercase tracking-[0.3em]">RETURN: {returnFlight.departure_airport_code}</div>
                                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 shadow-inner">
                                            <div className="grid grid-cols-4 gap-4">
                                                {['A', 'B', 'C', 'D'].map(col => (
                                                    <div key={col} className="space-y-3">
                                                        <div className="text-center font-bold text-slate-400 text-xs mb-2">{col}</div>
                                                        {[12, 14, 15, 16].map(row => {
                                                            const sId = `${row}${col}`;
                                                            const isSelected = bookingDetails.return_seat === sId;
                                                            return (
                                                                <button
                                                                    key={sId}
                                                                    onClick={() => setBookingDetails({ ...bookingDetails, return_seat: sId })}
                                                                    className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm font-black transition-all duration-300 ${isSelected ? 'bg-slate-900 text-white shadow-lg ring-4 ring-slate-100' : 'bg-white border-2 border-slate-100 text-slate-300 hover:border-amber-300 hover:text-amber-500'
                                                                        }`}
                                                                >
                                                                    {row}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-8">
                            <h3 className="text-2xl font-bold text-slate-900 text-center uppercase tracking-widest">Final Itinerary Breakdown</h3>
                            <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl space-y-8">
                                {/* Details */}
                                <div className="grid grid-cols-2 gap-8 border-b border-white/10 pb-8">
                                    <div>
                                        <div className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-1">Passenger</div>
                                        <div className="text-2xl font-bold">{bookingDetails.passenger_name}</div>
                                        <div className="text-slate-400">{bookingDetails.passenger_phone}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-1">Status</div>
                                        <div className="text-amber-500 font-black text-xl">READY TO TICKET</div>
                                    </div>
                                </div>

                                {/* Flights */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="text-slate-400 font-medium italic">Outbound ({bookingDetails.outbound_class})</span>
                                        <span className="font-bold">${(parseFloat(outboundFlight.base_price) * PriceMultipliers[bookingDetails.outbound_class] * bookingDetails.passengers).toFixed(2)}</span>
                                    </div>
                                    {returnFlight && (
                                        <div className="flex justify-between items-center text-lg">
                                            <span className="text-slate-400 font-medium italic">Return ({bookingDetails.return_class})</span>
                                            <span className="font-bold">${(parseFloat(returnFlight.base_price) * PriceMultipliers[bookingDetails.return_class] * bookingDetails.passengers).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Services */}
                                {bookingDetails.services.length > 0 && (
                                    <div className="space-y-2 border-t border-white/10 pt-6">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Premium Add-ons</div>
                                        {bookingDetails.services.map(sId => {
                                            const s = AdditionalServices.find(x => x.id === sId);
                                            return (
                                                <div key={sId} className="flex justify-between text-sm opacity-80">
                                                    <span>{s.label}</span>
                                                    <span className="font-bold">+${s.price}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Grand Total */}
                                <div className="pt-8 border-t-2 border-amber-500/30 flex justify-between items-end">
                                    <div>
                                        <div className="text-slate-500 text-xs uppercase font-black tracking-[0.2em] mb-1">Total Due</div>
                                        <div className="text-5xl font-black text-white">
                                            <span className="text-amber-500 mr-2">$</span>
                                            {calculateTotalPrice()}
                                        </div>
                                    </div>
                                    <div className="text-right pb-1">
                                        <div className="text-amber-500/50 text-[10px] font-bold uppercase mb-1">Inclusive of all taxes</div>
                                        <div className="flex gap-2">
                                            <div className="h-2 w-12 bg-white/10 rounded-full" />
                                            <div className="h-2 w-6 bg-amber-500/50 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-10 border-t border-slate-100 bg-slate-50/80 flex justify-between items-center shrink-0">
                    <Button
                        variant="ghost"
                        onClick={step === 1 ? onCancel : handlePrev}
                        className="text-slate-600 px-8 h-12 text-lg font-bold hover:bg-slate-100 rounded-xl transition-all"
                    >
                        {step === 1 ? 'Cancel Request' : <><ChevronLeft className="mr-2 h-5 w-5" /> Back</>}
                    </Button>

                    <Button
                        onClick={step === 5 ? handleCreateBooking : handleNext}
                        disabled={
                            loading ||
                            (step === 2 && (!bookingDetails.passenger_name || !bookingDetails.passenger_phone)) ||
                            (step === 4 && (!bookingDetails.outbound_seat || (returnFlight && !bookingDetails.return_seat)))
                        }
                        className="bg-slate-900 hover:bg-amber-500 hover:text-slate-900 min-w-[200px] h-14 rounded-2xl text-lg font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                        {loading ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : step === 5 ? (
                            'Confirm & Ticket'
                        ) : (
                            <>Proceed <ChevronRight className="ml-2 h-5 w-5" /></>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BookingFlow;
