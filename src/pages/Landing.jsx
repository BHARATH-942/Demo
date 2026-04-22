import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, ScanFace, Clock } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

const Landing = () => {
    return (
        <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-32 left-1/2 w-[500px] h-[500px] bg-sky-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
                <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-medium mb-8">
                    <ShieldCheck size={18} />
                    <span>Secure & Automated</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
                    Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Smart Attendance</span>
                </h1>

                <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-10 leading-relaxed">
                    Verify student presence securely using multi-factor authentication including
                    facial recognition, geographical validation, and proximity validation.
                </p>

                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-24">
                    <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-1">
                        Get Started
                    </Link>
                    <Link to="/login" className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-8 py-4 rounded-xl font-bold text-lg shadow-sm transition-all hover:-translate-y-1">
                        Sign In
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
                    <FeatureCard
                        icon={ScanFace}
                        title="Biometric Verification"
                        description="Utilize face-api.js to match live webcam capture against stored descriptors, preventing proxy attendance."
                    />
                    <FeatureCard
                        icon={MapPin}
                        title="Location Bounds"
                        description="Ensure the user is physically present by validating coordinates using the browser's Geolocation API."
                    />
                    <FeatureCard
                        icon={Clock}
                        title="Real-Time Logging"
                        description="Record accurate timestamps of when attendance was verified, synced with active class sessions."
                    />
                </div>
            </div>
        </div>
    );
};

export default Landing;
