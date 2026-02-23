import React, { useState, useEffect } from 'react';
import { Plane, Calendar, Users, Briefcase } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import client from '../api/client';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                setLoading(false);
                return;
            }

            try {
                const user = JSON.parse(storedUser);
                const response = await client.get(`/users/${user.id}/bookings`);
                setBookings(response.data);
            } catch (error) {
                toast.error('Failed to load your bookings.');
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading your bookings...</div>;
    }

    if (bookings.length === 0) {
        return (
            <div className="p-12 text-center">
                <Plane className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Bookings Found</h3>
                <p className="text-slate-500">You don't have any upcoming or past flights booked with us.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">My Bookings</h2>
            <div className="grid gap-6">
                {bookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden shadow-md">
                        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-sm text-slate-400 uppercase tracking-widest font-bold">Booking Reference</span>
                                <span className="text-lg font-mono">#{String(booking.id).padStart(6, '0')}</span>
                            </div>
                            <div className={`px-4 py-1 rounded-full text-sm font-bold ${booking.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                }`}>
                                {booking.status.toUpperCase()}
                            </div>
                        </div>
                        <CardContent className="p-6">
                            {booking.flight ? (
                                <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                                    <div className="flex-1 w-full grid grid-cols-3 items-center gap-4">
                                        {/* Origin */}
                                        <div className="text-center">
                                            <p className="text-3xl font-black text-slate-900">{booking.flight.departure_airport_code}</p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {new Date(booking.flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {new Date(booking.flight.departure_time).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {/* Path */}
                                        <div className="flex flex-col items-center justify-center">
                                            <Plane className="h-6 w-6 text-amber-500 mb-2" />
                                            <div className="w-full border-t-2 border-dashed border-slate-200" />
                                            <span className="text-xs uppercase tracking-widest font-bold text-slate-400 mt-2">{booking.flight.airline}</span>
                                        </div>

                                        {/* Destination */}
                                        <div className="text-center">
                                            <p className="text-3xl font-black text-slate-900">{booking.flight.arrival_airport_code}</p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {new Date(booking.flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {new Date(booking.flight.arrival_time).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-px md:h-24 bg-slate-200" />

                                    {/* Details */}
                                    <div className="w-full md:w-auto min-w-[240px] flex flex-col gap-3">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Passenger</span>
                                                <span className="text-sm font-bold text-slate-900">{booking.passenger_name || '—'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seat</span>
                                                <span className="text-sm font-bold text-amber-600">{booking.seat_number || 'TBA'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Users className="h-4 w-4 text-slate-400" />
                                            <span>{booking.passenger_count} Passenger(s) • <span className="capitalize">{booking.seat_class.replace('-', ' ')}</span></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Briefcase className="h-4 w-4 text-slate-400" />
                                            <span>Meal: <span className="capitalize">{booking.meal_preference || 'Standard'}</span></span>
                                        </div>

                                        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                                            <span className="text-sm text-slate-500 font-medium">Total Paid</span>
                                            <span className="text-xl font-bold text-slate-900">
                                                ${(Number(booking.total_price) || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-slate-500 italic">Flight details unavailable.</div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MyBookings;
