import React, { useState } from 'react'

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        experience: '',
        specialties: [] as string[],
        bio: '',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const specialties = [
        'Technology',
        'Healthcare',
        'Finance',
        'Retail',
        'Manufacturing',
        'Real Estate',
        'Education',
        'Consulting',
    ]

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }))
        }
    }

    const handleSpecialtyChange = (specialty: string) => {
        setFormData((prev) => ({
            ...prev,
            specialties: prev.specialties.includes(specialty)
                ? prev.specialties.filter((s) => s !== specialty)
                : [...prev.specialties, specialty],
        }))
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.firstName.trim())
            newErrors.firstName = 'First name is required'
        if (!formData.lastName.trim())
            newErrors.lastName = 'Last name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = 'Email is invalid'

        if (!formData.password) newErrors.password = 'Password is required'
        else if (formData.password.length < 8)
            newErrors.password = 'Password must be at least 8 characters'

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
        if (!formData.experience)
            newErrors.experience = 'Please select your experience level'
        if (formData.specialties.length === 0)
            newErrors.specialties = 'Please select at least one specialty'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            // Handle registration logic here
            console.log('Registering agent:', formData)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Join as a Sales Agent
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Start earning by connecting businesses with
                            qualified leads
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    required
                                    className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                        errors.firstName
                                            ? 'border-red-300'
                                            : 'border-gray-300'
                                    }`}
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                />
                                {errors.firstName && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.firstName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    required
                                    className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                        errors.lastName
                                            ? 'border-red-300'
                                            : 'border-gray-300'
                                    }`}
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                />
                                {errors.lastName && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.lastName}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    errors.email
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                required
                                className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    errors.phone
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                        errors.password
                                            ? 'border-red-300'
                                            : 'border-gray-300'
                                    }`}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    required
                                    className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                        errors.confirmPassword
                                            ? 'border-red-300'
                                            : 'border-gray-300'
                                    }`}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Experience */}
                        <div>
                            <label
                                htmlFor="experience"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Years of Sales Experience *
                            </label>
                            <select
                                id="experience"
                                name="experience"
                                required
                                className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    errors.experience
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                                value={formData.experience}
                                onChange={handleInputChange}
                            >
                                <option value="">
                                    Select experience level
                                </option>
                                <option value="0-1">0-1 years</option>
                                <option value="1-3">1-3 years</option>
                                <option value="3-5">3-5 years</option>
                                <option value="5-10">5-10 years</option>
                                <option value="10+">10+ years</option>
                            </select>
                            {errors.experience && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.experience}
                                </p>
                            )}
                        </div>

                        {/* Specialties */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Specialties * (Select all that apply)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {specialties.map((specialty) => (
                                    <label
                                        key={specialty}
                                        className="flex items-center"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.specialties.includes(
                                                specialty
                                            )}
                                            onChange={() =>
                                                handleSpecialtyChange(specialty)
                                            }
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            {specialty}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.specialties && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.specialties}
                                </p>
                            )}
                        </div>

                        {/* Bio */}
                        <div>
                            <label
                                htmlFor="bio"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                rows={4}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Tell us about your sales experience and achievements..."
                                value={formData.bio}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Submit */}
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
                                Register as Agent
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register
