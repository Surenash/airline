import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPage = () => (
    <div className="min-h-screen bg-slate-50">
        <div className="bg-slate-900 text-white py-20 px-6">
            <div className="container mx-auto max-w-3xl">
                <Link to="/" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center">
                        <Shield className="h-7 w-7 text-slate-900" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black">Privacy Policy</h1>
                        <p className="text-slate-400 mt-1">Last updated: February 2026</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="container mx-auto max-w-3xl px-6 py-14 space-y-10">
            {[
                {
                    title: '1. Information We Collect',
                    body: 'We collect personal information you provide directly to us, such as your name, email address, phone number, and payment details when you create an account or make a booking. We also collect usage data to improve our services.',
                },
                {
                    title: '2. How We Use Your Information',
                    body: 'Your information is used to process bookings, communicate with you about your travel, send promotional offers (with your consent), improve our platform, and comply with legal obligations.',
                },
                {
                    title: '3. Data Sharing',
                    body: 'We do not sell your personal data. We may share your data with trusted partners — such as payment processors and airport authorities — strictly to fulfil your booking and travel requirements.',
                },
                {
                    title: '4. Cookies',
                    body: 'Our website uses cookies to enhance your experience, analyse site traffic, and personalise content. You may manage cookie preferences through your browser settings.',
                },
                {
                    title: '5. Data Security',
                    body: 'We implement industry-standard security measures including encryption, firewalls, and secure servers to protect your personal information from unauthorised access or disclosure.',
                },
                {
                    title: '6. Your Rights',
                    body: 'You have the right to access, correct, or delete your personal data at any time. To exercise these rights, please contact our data protection team at privacy@skylux.com.',
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

export default PrivacyPage;
