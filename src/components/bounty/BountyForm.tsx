import React, { useState } from 'react'

interface BountyFormProps {
    onSubmit?: (data: BountyFormData) => void
    onCancel?: () => void
}

interface BountyFormData {
    title: string
    description: string
    amount: number
    deadline: string
    requirements: string[]
}

const BountyForm: React.FC<BountyFormProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<BountyFormData>({
        title: '',
        description: '',
        amount: 0,
        deadline: '',
        requirements: [''],
    })

    const handleInputChange = (field: keyof BountyFormData, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleRequirementChange = (index: number, value: string) => {
        const newRequirements = [...formData.requirements]
        newRequirements[index] = value
        setFormData((prev) => ({
            ...prev,
            requirements: newRequirements,
        }))
    }

    const addRequirement = () => {
        setFormData((prev) => ({
            ...prev,
            requirements: [...prev.requirements, ''],
        }))
    }

    const removeRequirement = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index),
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (onSubmit) {
            onSubmit(formData)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Create New Bounty
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Bounty Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                            handleInputChange('title', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter bounty title"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                            handleInputChange('description', e.target.value)
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the bounty requirements and expectations"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="amount"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Bounty Amount ($)
                        </label>
                        <input
                            type="number"
                            id="amount"
                            value={formData.amount}
                            onChange={(e) =>
                                handleInputChange(
                                    'amount',
                                    parseFloat(e.target.value) || 0
                                )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="deadline"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Deadline
                        </label>
                        <input
                            type="date"
                            id="deadline"
                            value={formData.deadline}
                            onChange={(e) =>
                                handleInputChange('deadline', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Requirements
                    </label>
                    <div className="space-y-2">
                        {formData.requirements.map((requirement, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={requirement}
                                    onChange={(e) =>
                                        handleRequirementChange(
                                            index,
                                            e.target.value
                                        )
                                    }
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Requirement ${index + 1}`}
                                />
                                {formData.requirements.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeRequirement(index)}
                                        className="px-3 py-2 text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addRequirement}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                            + Add Requirement
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Create Bounty
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}

export default BountyForm
