import React from 'react'

const Landing: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Welcome to Sales Agents
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Connect with top sales agents and grow your business
                        with our innovative bounty system.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                            Get Started
                        </button>
                        <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition duration-300">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Landing
