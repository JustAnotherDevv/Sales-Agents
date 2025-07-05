import React, { useState } from 'react'

const CreateBounty: React.FC = () => {
    const [bountyData, setBountyData] = useState({
        title: '',
        description: '',
        reward: '',
        targetIndustry: '',
        targetLocation: '',
        deadline: '',
    })

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target
        setBountyData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle bounty creation logic here
        console.log('Creating bounty:', bountyData)
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Create New Bounty
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Bounty Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Enter bounty title"
                                value={bountyData.title}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Describe what you're looking for..."
                                value={bountyData.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="reward"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Reward Amount ($)
                            </label>
                            <input
                                type="number"
                                id="reward"
                                name="reward"
                                required
                                min="0"
                                step="0.01"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="0.00"
                                value={bountyData.reward}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="targetIndustry"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Target Industry
                            </label>
                            <select
                                id="targetIndustry"
                                name="targetIndustry"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={bountyData.targetIndustry}
                                onChange={handleInputChange}
                            >
                                <option value="">Select an industry</option>
                                <option value="technology">Technology</option>
                                <option value="healthcare">Healthcare</option>
                                <option value="finance">Finance</option>
                                <option value="retail">Retail</option>
                                <option value="manufacturing">
                                    Manufacturing
                                </option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="targetLocation"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Target Location
                            </label>
                            <input
                                type="text"
                                id="targetLocation"
                                name="targetLocation"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="City, State or Country"
                                value={bountyData.targetLocation}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="deadline"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Deadline
                            </label>
                            <input
                                type="date"
                                id="deadline"
                                name="deadline"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={bountyData.deadline}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md transition duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                            >
                                Create Bounty
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateBounty
