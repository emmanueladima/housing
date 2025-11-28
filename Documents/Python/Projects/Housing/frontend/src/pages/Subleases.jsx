import React from 'react';
import { FiTool } from 'react-icons/fi';

const Subleases = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiTool className="text-orange-600 text-3xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Subleases</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        This feature is currently under maintenance. Check back soon for sublease listings!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Subleases;
