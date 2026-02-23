import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Award, Heart, Users, Plane, Star } from 'lucide-react';

const AboutPage = () => {
    const stats = [
        { label: 'Countries Served', value: '85+' },
        { label: 'Flights Daily', value: '300+' },
        { label: 'Happy Passengers', value: '2M+' },
        { label: 'Years of Excellence', value: '15+' },
    ];

    const values = [
        { icon: Heart, title: 'Passenger First', description: 'Every decision we make starts with the comfort, safety, and satisfaction of our passengers.' },
        { icon: Award, title: 'Excellence', description: 'We hold ourselves to the highest standards in aviation, service, and hospitality.' },
        { icon: Globe, title: 'Global Reach', description: 'Connecting people across continents with seamless routes and premium service worldwide.' },
        { icon: Users, title: 'Our People', description: 'Our crew of dedicated professionals brings warmth and expertise to every flight.' },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 right-20 w-72 h-72 bg-amber-400 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
                </div>
                <div className="container mx-auto max-w-5xl relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-8 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center">
                            <Plane className="h-7 w-7 text-slate-900" />
                        </div>
                        <span className="text-2xl font-bold text-amber-400">SkyLux Airlines</span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black mb-6">About Us</h1>
                    <p className="text-slate-300 text-xl max-w-2xl leading-relaxed">
                        We are more than an airline — we are your gateway to the world. Founded with a passion for travel and a commitment to luxury, SkyLux Airlines has been redefining air travel since 2009.
                    </p>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-amber-500 py-10 px-6">
                <div className="container mx-auto max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map(stat => (
                        <div key={stat.label} className="text-center">
                            <div className="text-4xl font-black text-slate-900">{stat.value}</div>
                            <div className="text-slate-800 font-medium mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Story */}
            <div className="py-20 px-6 bg-slate-50">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Story</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                SkyLux Airlines was born from a simple belief: that flying should be an experience to savour, not just a means to an end. What started as a regional carrier with five aircraft has grown into a global network spanning over 85 countries.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                Today, we operate over 300 daily flights and carry more than 2 million passengers annually, all while maintaining the personal touch and premium service that defined us from day one.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {['2009', '2012', '2017', '2024'].map((year, i) => (
                                <div key={year} className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                                    <div className="text-amber-500 font-black text-2xl mb-2">{year}</div>
                                    <div className="text-slate-700 text-sm font-medium">
                                        {['Founded with 5 aircraft', 'Expanded to 20 routes', 'Launched international routes', 'Reached 2M+ passengers'][i]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Values */}
            <div className="py-20 px-6 bg-white">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-4xl font-bold text-slate-900 text-center mb-4">Our Values</h2>
                    <p className="text-slate-500 text-center mb-12">The principles that guide everything we do</p>
                    <div className="grid md:grid-cols-2 gap-8">
                        {values.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="flex gap-5 p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Icon className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                                    <p className="text-slate-600">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
