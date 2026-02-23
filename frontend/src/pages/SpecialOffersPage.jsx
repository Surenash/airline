import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Tag, Percent, Globe, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';

const offers = [
    {
        title: 'Early Bird Discount',
        icon: Calendar,
        discount: '20% OFF',
        description: 'Book at least 60 days in advance and enjoy our early bird savings on all economy and business class seats.',
        color: 'bg-blue-500',
        badge: 'Most Popular',
    },
    {
        title: 'Weekend Getaway',
        icon: Globe,
        discount: '15% OFF',
        description: 'Planning a short trip? Get 15% off round-trip bookings departing Friday–Sunday on select routes.',
        color: 'bg-emerald-500',
        badge: null,
    },
    {
        title: 'Family Bundle',
        icon: Tag,
        discount: '25% OFF',
        description: 'Travel with your family. Get up to 25% off when booking for 4 or more passengers on the same itinerary.',
        color: 'bg-purple-500',
        badge: 'Best Value',
    },
    {
        title: 'SkyLux Loyalty Reward',
        icon: Percent,
        discount: '30% OFF',
        description: 'Returning travellers get an exclusive 30% discount. Log in to automatically apply your loyalty benefit.',
        color: 'bg-amber-500',
        badge: 'Members Only',
    },
];

const SpecialOffersPage = () => (
    <div className="min-h-screen bg-slate-50">
        <div className="bg-slate-900 text-white py-20 px-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400 rounded-full blur-3xl" />
            </div>
            <div className="container mx-auto max-w-5xl relative z-10">
                <Link to="/" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>
                <h1 className="text-5xl font-black mb-4">Special Offers</h1>
                <p className="text-slate-300 text-xl">Exclusive deals and discounts, curated just for you.</p>
            </div>
        </div>

        <div className="container mx-auto max-w-5xl px-6 py-16">
            <div className="grid md:grid-cols-2 gap-8">
                {offers.map(({ title, icon: Icon, discount, description, color, badge }) => (
                    <div key={title} className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow group">
                        <div className={`${color} p-8 relative overflow-hidden`}>
                            {badge && (
                                <span className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    {badge}
                                </span>
                            )}
                            <Icon className="h-12 w-12 text-white mb-4 opacity-90" />
                            <div className="text-5xl font-black text-white mb-1">{discount}</div>
                            <div className="text-white/80 font-semibold text-xl">{title}</div>
                        </div>
                        <div className="p-8">
                            <p className="text-slate-600 leading-relaxed mb-6">{description}</p>
                            <Link to="/#flight-search">
                                <Button className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-900 text-white font-bold transition-all duration-300">
                                    Book Now & Save
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 bg-amber-500 rounded-3xl p-10 text-center text-slate-900">
                <h2 className="text-3xl font-black mb-3">Newsletter Deals</h2>
                <p className="text-slate-800 mb-6">Subscribe to receive exclusive flash sales directly to your inbox.</p>
                <div className="flex max-w-md mx-auto gap-3">
                    <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6">Subscribe</Button>
                </div>
            </div>
        </div>
    </div>
);

export default SpecialOffersPage;
