import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LifeBuoy, BookOpen, Phone, AlertCircle, Luggage, CreditCard } from 'lucide-react';

const topics = [
    { icon: BookOpen, title: 'Booking Help', description: 'Step-by-step guides on searching, selecting, and confirming your flights.', link: '/faq' },
    { icon: CreditCard, title: 'Payments & Refunds', description: 'Payment options, how to request refunds, and managing billing issues.', link: '/faq' },
    { icon: Luggage, title: 'Baggage Information', description: 'Policies on carry-on, checked baggage, allowances and oversize items.', link: '/faq' },
    { icon: AlertCircle, title: 'Flight Disruptions', description: 'What to do if your flight is delayed, cancelled, or diverted.', link: '/faq' },
    { icon: Phone, title: 'Contact Support', description: 'Reach our 24/7 support team via phone, email, or live chat.', link: '/contact' },
    { icon: LifeBuoy, title: 'Safety Information', description: 'Our safety standards, Covid-19 protocols, and health requirements.', link: '/faq' },
];

const HelpCenterPage = () => (
    <div className="min-h-screen bg-slate-50">
        <div className="bg-slate-900 text-white py-20 px-6">
            <div className="container mx-auto max-w-5xl">
                <Link to="/" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center">
                        <LifeBuoy className="h-7 w-7 text-slate-900" />
                    </div>
                    <h1 className="text-5xl font-black">Help Center</h1>
                </div>
                <p className="text-slate-300 text-xl max-w-xl">Find answers, guides, and support resources for all your travel needs.</p>
                <div className="mt-8 max-w-lg">
                    <input
                        type="text"
                        placeholder="Search for help topics..."
                        className="w-full px-6 py-4 rounded-2xl text-slate-900 text-lg focus:outline-none focus:ring-4 focus:ring-amber-400"
                    />
                </div>
            </div>
        </div>

        <div className="container mx-auto max-w-5xl px-6 py-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Browse by Topic</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map(({ icon: Icon, title, description, link }) => (
                    <Link
                        key={title}
                        to={link}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
                            <Icon className="h-6 w-6 text-amber-600 group-hover:text-slate-900 transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                    </Link>
                ))}
            </div>

            <div className="mt-12 bg-amber-500 rounded-3xl p-10 text-slate-900 text-center">
                <h2 className="text-3xl font-black mb-3">Still need help?</h2>
                <p className="text-slate-800 mb-6">Our support team is available 24/7 to assist you with any issue.</p>
                <Link to="/contact">
                    <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl transition-colors">
                        Contact Support
                    </button>
                </Link>
            </div>
        </div>
    </div>
);

export default HelpCenterPage;
