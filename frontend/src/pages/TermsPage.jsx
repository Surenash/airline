import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const TermsPage = () => (
    <div className="min-h-screen bg-slate-50">
        <div className="bg-slate-900 text-white py-20 px-6">
            <div className="container mx-auto max-w-3xl">
                <Link to="/" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center">
                        <FileText className="h-7 w-7 text-slate-900" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black">Terms & Conditions</h1>
                        <p className="text-slate-400 mt-1">Last updated: February 2026</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="container mx-auto max-w-3xl px-6 py-14 space-y-10">
            {[
                {
                    title: '1. Acceptance of Terms',
                    body: 'By accessing or using SkyLux Airlines services, including booking flights through our website, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.',
                },
                {
                    title: '2. Booking & Payment',
                    body: 'All bookings are subject to availability and confirmation. Payment must be completed in full at the time of booking. Prices include applicable taxes unless stated otherwise. SkyLux Airlines reserves the right to cancel bookings in the case of pricing errors.',
                },
                {
                    title: '3. Cancellations & Refunds',
                    body: 'Cancellations made more than 24 hours before departure are eligible for a full refund. Cancellations within 24 hours of departure are non-refundable. Refunds will be processed within 7–10 business days to the original payment method.',
                },
                {
                    title: '4. Passenger Conduct',
                    body: 'Passengers are expected to behave in a respectful manner towards crew and fellow passengers. SkyLux Airlines reserves the right to deny boarding or remove passengers who display disruptive, abusive, or dangerous behaviour.',
                },
                {
                    title: '5. Liability',
                    body: 'SkyLux Airlines is not liable for delays, cancellations, or disruptions caused by events beyond our control, including but not limited to weather conditions, air traffic control decisions, or acts of government.',
                },
                {
                    title: '6. Changes to Terms',
                    body: 'We may update these Terms and Conditions from time to time. Continued use of our services following any changes constitutes acceptance of those changes.',
                },
            ].map(({ title, body }) => (
                <section key={title}>
                    <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
                    <p className="text-slate-600 leading-relaxed">{body}</p>
                </section>
            ))}
        </div>
    </div>
);

export default TermsPage;
