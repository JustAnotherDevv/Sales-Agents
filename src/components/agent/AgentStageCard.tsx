import React from 'react'

interface AgentStageCardProps {
    agent: AgentData
    onViewProfile?: (agentId: string) => void
    onContact?: (agentId: string) => void
    onAssign?: (agentId: string) => void
    stage?: 'available' | 'busy' | 'offline'
}

interface AgentData {
    id: string
    firstName: string
    lastName: string
    avatar?: string
    company: string
    position: string
    experience: string
    specialties: string[]
    hourlyRate: number
    rating: number
    totalDeals: number
    successRate: number
    availability: string[]
    bio: string
    isOnline: boolean
    lastActive?: string
}

const AgentStageCard: React.FC<AgentStageCardProps> = ({
    agent,
    onViewProfile,
    onContact,
    onAssign,
    stage = 'available',
}) => {
    const getStageColor = () => {
        switch (stage) {
            case 'available':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'busy':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'offline':
                return 'bg-gray-100 text-gray-800 border-gray-200'
            default:
                return 'bg-green-100 text-green-800 border-green-200'
        }
    }

    const getStageText = () => {
        switch (stage) {
            case 'available':
                return 'Available'
            case 'busy':
                return 'Busy'
            case 'offline':
                return 'Offline'
            default:
                return 'Available'
        }
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <svg
                key={i}
                className={`w-4 h-4 ${
                    i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))
    }

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            {agent.avatar ? (
                                <img
                                    src={agent.avatar}
                                    alt={`${agent.firstName} ${agent.lastName}`}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                    {agent.firstName.charAt(0)}
                                    {agent.lastName.charAt(0)}
                                </div>
                            )}
                            <div
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                    agent.isOnline
                                        ? 'bg-green-500'
                                        : 'bg-gray-400'
                                }`}
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {agent.firstName} {agent.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {agent.position}
                            </p>
                        </div>
                    </div>
                    <div
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStageColor()}`}
                    >
                        {getStageText()}
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                            {renderStars(agent.rating)}
                            <span className="text-gray-600 ml-1">
                                ({agent.rating})
                            </span>
                        </div>
                        <div className="text-gray-600">
                            {agent.totalDeals} deals
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-semibold text-blue-600">
                            ${agent.hourlyRate}/hr
                        </div>
                        <div className="text-xs text-gray-500">
                            {agent.successRate}% success
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-4">
                <div className="mb-3">
                    <p className="text-sm text-gray-700 line-clamp-2">
                        {agent.bio}
                    </p>
                </div>

                <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Specialties
                    </h4>
                    <div className="flex flex-wrap gap-1">
                        {agent.specialties
                            .slice(0, 3)
                            .map((specialty, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                    {specialty}
                                </span>
                            ))}
                        {agent.specialties.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{agent.specialties.length - 3} more
                            </span>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Experience
                    </h4>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                            {agent.experience} years
                        </span>
                        <span className="text-gray-500">{agent.company}</span>
                    </div>
                </div>

                <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Availability
                    </h4>
                    <div className="flex flex-wrap gap-1">
                        {agent.availability.slice(0, 5).map((day, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                            >
                                {day.slice(0, 3)}
                            </span>
                        ))}
                        {agent.availability.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{agent.availability.length - 5} more
                            </span>
                        )}
                    </div>
                </div>

                {agent.lastActive && (
                    <div className="text-xs text-gray-500 mb-4">
                        Last active: {agent.lastActive}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-2">
                    {onViewProfile && (
                        <button
                            onClick={() => onViewProfile(agent.id)}
                            className="flex-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            View Profile
                        </button>
                    )}
                    {onContact && (
                        <button
                            onClick={() => onContact(agent.id)}
                            className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Contact
                        </button>
                    )}
                    {onAssign && stage === 'available' && (
                        <button
                            onClick={() => onAssign(agent.id)}
                            className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            Assign
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AgentStageCard
