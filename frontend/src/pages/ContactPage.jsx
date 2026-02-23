import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const ContactPage = () => {
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, this would post to an API
        setSent(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-slate-900 text-white py-20 px-6">
                <div className="container mx-auto max-w-5xl">
                    <Link to="/" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-8 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                    <h1 className="text-5xl font-black mb-4">Contact Us</h1>
                    <p className="text-slate-300 text-lg max-w-xl">Our team is ready to assist you. Reach out and we'll respond as quickly as possible.</p>
                </div>
            </div>

            <div className="container mx-auto max-w-5xl px-6 py-16">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h2>
                            <div className="space-y-6">
                                {[
                                    { icon: Phone, label: 'Phone', value: '+1 (234) 567-890', href: 'tel:+1234567890' },
                                    { icon: Mail, label: 'Email', value: 'support@skylux.com', href: 'mailto:support@skylux.com' },
                                    { icon: MapPin, label: 'Address', value: '123 Aviation Boulevard, Sky City, SC 12345', href: null },
                                ].map(({ icon: Icon, label, value, href }) => (
                                    <div key={label} className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-200">
                                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Icon className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</div>
                                            {href ? (
                                                <a href={href} className="text-slate-900 font-medium hover:text-amber-600 transition-colors">{value}</a>
                                            ) : (
                                                <span className="text-slate-900 font-medium">{value}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-amber-500 rounded-2xl p-6 text-slate-900">
                            <h3 className="font-bold text-xl mb-2">24/7 Support</h3>
                            <p className="font-medium">Our customer service team is available around the clock for urgent travel assistance.</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
                        {sent ? (
                            <div className="text-center py-12">
                                <CheckCircle className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                                <p className="text-slate-500 mb-6">We'll get back to you within 24 hours.</p>
                                <Button onClick={() => setSent(false)} variant="outline" className="border-slate-300">Send Another</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Send a Message</h2>
                                {[
                                    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                                    { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
                                    { id: 'subject', label: 'Subject', type: 'text', placeholder: 'How can we help?' },
                                ].map(({ id, label, type, placeholder }) => (
                                    <div key={id} className="space-y-2">
                                        <Label htmlFor={id}>{label}</Label>
                                        <Input
                                            id={id}
                                            type={type}
                                            placeholder={placeholder}
                                            value={form[id]}
                                            onChange={e => setForm({ ...form, [id]: e.target.value })}
                                            required
                                        />
                                    </div>
                                ))}
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <textarea
                                        id="message"
                                        rows={5}
                                        placeholder="Tell us more..."
                                        value={form.message}
                                        onChange={e => setForm({ ...form, message: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3">
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Message
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
