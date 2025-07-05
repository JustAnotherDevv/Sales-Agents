import React, { useState } from 'react'

interface RegisterAgentModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: AgentRegistrationData) => void
    loading?: boolean
}

interface AgentRegistrationData {
    firstName: string
    lastName: string
    email: string
    phone: string
    company: string
    position: string
    experience: string
    specialties: string[]
    linkedinUrl?: string
    portfolioUrl?: string
    bio: string
    hourlyRate: number
    availability: string[]
}

const RegisterAgentModal: React.FC<RegisterAgentModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    loading = false,
}) => {
    const [formData, setFormData] = useState<AgentRegistrationData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        experience: '',
        specialties: [''],
        linkedinUrl: '',
        portfolioUrl: '',
        bio: '',
        hourlyRate: 0,
        availability: [],
    })

    const [currentStep, setCurrentStep] = useState(1)
    const totalSteps = 3

    const handleInputChange = (
        field: keyof AgentRegistrationData,
        value: any
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSpecialtyChange = (index: number, value: string) => {
        const newSpecialties = [...formData.specialties]
        newSpecialties[index] = value
        setFormData((prev) => ({
            ...prev,
            specialties: newSpecialties,
        }))
    }

    const addSpecialty = () => {
        setFormData((prev) => ({
            ...prev,
            specialties: [...prev.specialties, ''],
        }))
    }

    const removeSpecialty = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            specialties: prev.specialties.filter((_, i) => i !== index),
        }))
    }

    const handleAvailabilityChange = (day: string) => {
        setFormData((prev) => ({
            ...prev,
            availability: prev.availability.includes(day)
                ? prev.availability.filter((d) => d !== day)
                : [...prev.availability, day],
        }))
    }

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (currentStep === totalSteps) {
            onSubmit(formData)
        } else {
            nextStep()
        }
    }

    const handleClose = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            company: '',
            position: '',
            experience: '',
            specialties: [''],
            linkedinUrl: '',
            portfolioUrl: '',
            bio: '',
            hourlyRate: 0,
            availability: [],
        })
        setCurrentStep(1)
        onClose()
    }

    if (!isOpen) return null

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-6">
            {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center">
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            i + 1 <= currentStep
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                        {i + 1}
                    </div>
                    {i < totalSteps - 1 && (
                        <div
                            className={`w-12 h-1 mx-2 ${
                                i + 1 < currentStep
                                    ? 'bg-blue-600'
                                    : 'bg-gray-200'
                            }`}
                        />
                    )}
                </div>
            ))}
        </div>
    )

    const renderStep1 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Personal Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        First Name *
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                            handleInputChange('firstName', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Last Name *
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                            handleInputChange('lastName', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Email Address *
                </label>
                <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Phone Number *
                </label>
                <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Professional Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="company"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Company
                    </label>
                    <input
                        type="text"
                        id="company"
                        value={formData.company}
                        onChange={(e) =>
                            handleInputChange('company', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label
                        htmlFor="position"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Position
                    </label>
                    <input
                        type="text"
                        id="position"
                        value={formData.position}
                        onChange={(e) =>
                            handleInputChange('position', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor="experience"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Years of Experience *
                </label>
                <select
                    id="experience"
                    value={formData.experience}
                    onChange={(e) =>
                        handleInputChange('experience', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                >
                    <option value="">Select experience level</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialties *
                </label>
                <div className="space-y-2">
                    {formData.specialties.map((specialty, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={specialty}
                                onChange={(e) =>
                                    handleSpecialtyChange(index, e.target.value)
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., SaaS Sales, Enterprise, B2B"
                            />
                            {formData.specialties.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSpecialty(index)}
                                    className="px-3 py-2 text-red-600 hover:text-red-800"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addSpecialty}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        + Add Specialty
                    </button>
                </div>
            </div>

            <div>
                <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Bio *
                </label>
                <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about your background and expertise..."
                    required
                />
            </div>
        </div>
    )

    const renderStep3 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Additional Information
            </h3>

            <div>
                <label
                    htmlFor="hourlyRate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Hourly Rate ($) *
                </label>
                <input
                    type="number"
                    id="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={(e) =>
                        handleInputChange(
                            'hourlyRate',
                            parseFloat(e.target.value) || 0
                        )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="linkedinUrl"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    LinkedIn Profile
                </label>
                <input
                    type="url"
                    id="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={(e) =>
                        handleInputChange('linkedinUrl', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                />
            </div>

            <div>
                <label
                    htmlFor="portfolioUrl"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Portfolio/Website
                </label>
                <input
                    type="url"
                    id="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={(e) =>
                        handleInputChange('portfolioUrl', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourwebsite.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability *
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday',
                        'Sunday',
                    ].map((day) => (
                        <label key={day} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.availability.includes(day)}
                                onChange={() => handleAvailabilityChange(day)}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">{day}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            Register as Sales Agent
                        </h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>

                    {renderStepIndicator()}

                    <form onSubmit={handleSubmit}>
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}

                        <div className="flex gap-3 pt-6">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Previous
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Submitting...
                                    </div>
                                ) : currentStep === totalSteps ? (
                                    'Submit Registration'
                                ) : (
                                    'Next'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default RegisterAgentModal
