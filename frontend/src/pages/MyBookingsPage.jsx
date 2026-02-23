import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import MyBookings from '../components/MyBookings';

const MyBookingsPage = () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-slate-900 text-white py-16 px-6">
                <div className="container mx-auto max-w-5xl">
                    <Link to="/" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center">
                            <Plane className="h-7 w-7 text-slate-900" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">My Bookings</h1>
                            <p className="text-slate-400 mt-1">
                                {user ? `Welcome back, ${user.name}` : 'Your travel history'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto max-w-5xl px-6 py-12">
                {user ? (
                    <MyBookings />
                ) : (
                    <div className="text-center py-24">
                        <Plane className="h-20 w-20 text-slate-300 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Sign In Required</h2>
                        <p className="text-slate-500 mb-8">Please sign in to view your bookings.</p>
                        <Link to="/">
                            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8 py-3">
                                Go to Home & Sign In
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookingsPage;
