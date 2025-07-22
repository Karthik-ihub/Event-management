import React from 'react';
import { User, Shield, ArrowRight } from 'lucide-react';

const Home = () => {
  const handleAdminPortal = () => {
    window.location.href = '/adminsignin';
  };

  const handleUserPortal = () => {
    window.location.href = '/signin';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to Our Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your portal to get started. Access your personalized dashboard and manage your account with ease.
          </p>
        </div>

        {/* Portal Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Admin Portal Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 p-8 border border-gray-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Admin Portal
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Access administrative controls, manage users, system settings, and monitor platform activities.
              </p>
              <button
                onClick={handleAdminPortal}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                Enter Admin Portal
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* User Portal Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 p-8 border border-gray-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mb-6">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                User Portal
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Access your personal dashboard, manage your profile, and explore all available features and services.
              </p>
              <button
                onClick={handleUserPortal}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                Enter User Portal
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;