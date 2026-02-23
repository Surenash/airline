import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
    { q: 'How do I book a flight?', a: 'Use the flight search on our homepage. Enter your origin, destination, and travel dates, then select your preferred flight and class. You must be signed in to complete a booking.' },
    { q: 'Can I cancel or change my booking?', a: 'Yes. Visit your My Bookings page to manage existing reservations. Cancellations made more than 24 hours before departure are eligible for a full refund.' },
    { q: 'What is the baggage allowance?', a: 'Economy class includes 23kg checked baggage. Business class allows 32kg and First class allows 2 × 32kg. Cabin baggage allowance is 7kg across all classes.' },
    { q: 'How early should I arrive at the airport?', a: 'We recommend arriving at least 2.5 hours before international flights and 90 minutes before domestic flights.' },
    { q: 'Do you offer meals on board?', a: 'Yes. All long-haul flights include complimentary meals. Short-haul flights offer a light snack service. Special dietary meals can be requested up to 48 hours before departure.' },
    { q: 'How do I check my flight status?', a: "Visit our Flight Status page or use the SkyLux app and enter your flight number. You can also sign up for real-time SMS/email notifications." },
    { q: 'Can I select my seat in advance?', a: 'Yes, seat selection is available during booking or via Manage Booking on your account. Business and First class passengers enjoy priority seat selection.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex), PayPal, and bank transfers for certain regions.' },
];

const FAQPage = () => {
    const [open, setOpen] = useState(null);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-slate-900 text-white py-20 px-6">
                <div className="container mx-auto max-w-3xl">
                    <Link to="/" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-8 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center">
                            <HelpCircle className="h-7 w-7 text-slate-900" />
                        </div>
                        <h1 className="text-5xl font-black">FAQ</h1>
                    </div>
                    <p className="text-slate-300 text-lg">Answers to the most common questions about SkyLux Airlines.</p>
                </div>
            </div>

            <div className="container mx-auto max-w-3xl px-6 py-16">
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                className="w-full flex justify-between items-center p-6 text-left text-slate-900 font-semibold text-lg hover:bg-slate-50 transition-colors"
                            >
                                {faq.q}
                                {open === i ? <ChevronUp className="h-5 w-5 text-amber-500 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />}
                            </button>
                            {open === i && (
                                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
