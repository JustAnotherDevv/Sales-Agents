import React, { useState } from 'react'

interface LeadRevealModalProps {
    isOpen: boolean
    onClose: () => void
    onReveal: (leadId: string) => void
    leadId?: string
    bountyAmount?: number
    loading?: boolean
}

interface LeadData {
    id: string
    name: string
    email: string
    phone: string
    company: string
    position: string
    linkedinUrl?: string
    notes?: string
}

const LeadRevealModal: React.FC<LeadRevealModalProps> = ({
    isOpen,
    onClose,
    onReveal,
    leadId,
    bountyAmount = 0,
    loading = false,
}) => {
    const [isRevealed, setIsRevealed] = useState(false)
    const [leadData, setLeadData] = useState<LeadData | null>(null)

    const handleReveal = async () => {
        if (leadId) {
            setIsRevealed(true)
            onReveal(leadId)

            // Simulate fetching lead data
            // In a real app, this would be an API call
            setTimeout(() => {
                setLeadData({
                    id: leadId,
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    phone: '+1 (555) 123-4567',
                    company: 'Tech Corp',
                    position: 'Senior Developer',
                    linkedinUrl: 'https://linkedin.com/in/johndoe',
                    notes: 'Interested in our enterprise solution. Prefers afternoon calls.',
                })
            }, 1000)
        }
    }

    const handleClose = () => {
        setIsRevealed(false)
        setLeadData(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            {isRevealed ? 'Lead Information' : 'Reveal Lead'}
                        </h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>

                    {!isRevealed ? (
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-yellow-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    Reveal Lead Information
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    This will reveal the complete contact
                                    information for this lead.
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                            Bounty Amount:
                                        </span>
                                        <span className="text-lg font-bold text-blue-600">
                                            ${bountyAmount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleReveal}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Revealing...
                                        </div>
                                    ) : (
                                        'Reveal Lead'
                                    )}
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {leadData ? (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center">
                                            <svg
                                                className="w-5 h-5 text-green-600 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            <span className="text-green-800 font-medium">
                                                Lead information revealed!
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Name
                                            </label>
                                            <p className="text-gray-900 font-medium">
                                                {leadData.name}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Email
                                            </label>
                                            <p className="text-gray-900">
                                                {leadData.email}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Phone
                                            </label>
                                            <p className="text-gray-900">
                                                {leadData.phone}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Company
                                            </label>
                                            <p className="text-gray-900">
                                                {leadData.company}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Position
                                            </label>
                                            <p className="text-gray-900">
                                                {leadData.position}
                                            </p>
                                        </div>

                                        {leadData.linkedinUrl && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    LinkedIn
                                                </label>
                                                <a
                                                    href={leadData.linkedinUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 underline"
                                                >
                                                    View Profile
                                                </a>
                                            </div>
                                        )}

                                        {leadData.notes && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Notes
                                                </label>
                                                <p className="text-gray-900 text-sm">
                                                    {leadData.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleClose}
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">
                                        Loading lead information...
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LeadRevealModal
