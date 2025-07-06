import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'

const LeadGeneration: React.FC = () => {
    const history = useHistory()
    const [currentStep, setCurrentStep] = useState(0)
    const [progress, setProgress] = useState(0)
    const [isComplete, setIsComplete] = useState(false)

    const agents = [
        {
            id: 1,
            name: 'Lead Finder Agent',
            description: 'Currently scraping leads from across the internet',
            image: '/src/assets/images/1-agent-1-scrape.png',
            color: 'blue',
            progress: 75,
            duration: 7000, // 7 seconds
        },
        {
            id: 2,
            name: 'Alignment Agent',
            description:
                'Currently assessing alignment of leads compared to criteria set by the company',
            image: '/src/assets/images/1-agent-2-filter.png',
            color: 'green',
            progress: 50,
            duration: 4000, // 4 seconds
        },
        {
            id: 3,
            name: 'Scoring Agent',
            description:
                'Currently ranking leads based on how well they fit a client',
            image: '/src/assets/images/1-agent-3-score.png',
            color: 'purple',
            progress: 25,
            duration: 5000, // 5 seconds
        },
        {
            id: 4,
            name: 'Summary Agent',
            description:
                'Currently writing a TLDR about each lead to help you decide who to pick',
            image: '/src/assets/images/1-agent-4-summarize.png',
            color: 'orange',
            progress: 0,
            duration: 3000, // 3 seconds
        },
    ]

    useEffect(() => {
        if (isComplete) return // Don't cycle if complete

        const interval = setInterval(() => {
            setCurrentStep((prev) => {
                const nextStep = (prev + 1) % 4
                if (nextStep === 0) {
                    // We've completed all 4 steps
                    setIsComplete(true)
                }
                return nextStep
            })
            setProgress(0)
        }, agents[currentStep].duration)

        return () => clearInterval(interval)
    }, [currentStep, isComplete])

    useEffect(() => {
        if (isComplete) return // Don't update progress if complete

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100
                return prev + 1
            })
        }, agents[currentStep].duration / 100) // Dynamic interval based on current agent's duration

        return () => clearInterval(progressInterval)
    }, [currentStep, isComplete])

    const currentAgent = agents[currentStep]

    const getColorClasses = (color: string) => {
        const colorMap = {
            blue: {
                bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20',
                border: 'border-blue-200 dark:border-blue-800',
                iconBg: 'bg-blue-100 dark:bg-blue-900/30',
                progressBg: 'bg-blue-200 dark:bg-blue-800',
                progressFill: 'bg-blue-600',
            },
            green: {
                bg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20',
                border: 'border-green-200 dark:border-green-800',
                iconBg: 'bg-green-100 dark:bg-green-900/30',
                progressBg: 'bg-green-200 dark:bg-green-800',
                progressFill: 'bg-green-600',
            },
            purple: {
                bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20',
                border: 'border-purple-200 dark:border-purple-800',
                iconBg: 'bg-purple-100 dark:bg-purple-900/30',
                progressBg: 'bg-purple-200 dark:bg-purple-800',
                progressFill: 'bg-purple-600',
            },
            orange: {
                bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20',
                border: 'border-orange-200 dark:border-orange-800',
                iconBg: 'bg-orange-100 dark:bg-orange-900/30',
                progressBg: 'bg-orange-200 dark:bg-orange-800',
                progressFill: 'bg-orange-600',
            },
        }
        return colorMap[color as keyof typeof colorMap]
    }

    const colors = getColorClasses(currentAgent.color)

    const handleExploreLeads = () => {
        history.push('/company/lead-results')
    }

    if (isComplete) {
        return (
            <div className="min-h-screen bg-background py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-card shadow rounded-lg p-6">
                        <h1 className="text-3xl font-bold text-foreground mb-6 text-center">
                            Searching for Leads...
                        </h1>

                        <div className="text-muted-foreground mb-8 text-center">
                            <p className="text-lg">
                                Your lead request has been submitted
                                successfully! Our AI agents are now working to
                                find the best leads for your business.
                            </p>
                        </div>

                        {/* Step Indicator */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center space-x-2 bg-muted/50 rounded-full px-4 py-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Complete
                                </span>
                            </div>
                        </div>

                        {/* Completion Agent Display */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg p-8 border border-green-200 dark:border-green-800">
                            <div className="text-center">
                                <div className="w-64 h-64 mx-auto mb-6 flex items-center justify-center">
                                    <svg
                                        className="max-h-56 w-auto text-green-600"
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
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-4">
                                    It looks like the agents found some leads
                                    for you!
                                </h3>
                                <p className="text-lg text-muted-foreground mb-6">
                                    Our AI agents have completed their search
                                    and analysis. You now have a curated list of
                                    leads ready for review.
                                </p>

                                {/* Action Button */}
                                <div className="max-w-md mx-auto">
                                    <button
                                        onClick={handleExploreLeads}
                                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 w-full"
                                    >
                                        Explore Leads
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Status Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            {/* Status Card */}
                            <div className="bg-muted/50 rounded-lg p-4">
                                <h3 className="font-semibold text-foreground mb-2">
                                    Status
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Complete
                                </p>
                            </div>

                            {/* Agents Working Card */}
                            <div className="bg-muted/50 rounded-lg p-4">
                                <h3 className="font-semibold text-foreground mb-2">
                                    AI Agents
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    4 agents completed
                                </p>
                            </div>

                            {/* Estimated Time Card */}
                            <div className="bg-muted/50 rounded-lg p-4">
                                <h3 className="font-semibold text-foreground mb-2">
                                    Time Taken
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    ~19 seconds
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-card shadow rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-foreground mb-6 text-center">
                        Searching for Leads...
                    </h1>

                    <div className="text-muted-foreground mb-8 text-center">
                        <p className="text-lg">
                            Your lead request has been submitted successfully!
                            Our AI agents are now working to find the best leads
                            for your business.
                        </p>
                    </div>

                    {/* Step Indicator */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center space-x-2 bg-muted/50 rounded-full px-4 py-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                Step
                            </span>
                            <span className="text-lg font-bold text-foreground">
                                {currentStep + 1}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                of 4
                            </span>
                        </div>
                    </div>

                    {/* Timer Bar */}
                    <div className="mb-8">
                        <div className="w-full bg-muted rounded-full h-2">
                            <div
                                className={`${colors.progressFill} h-2 rounded-full transition-all duration-100 ease-linear`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-sm text-muted-foreground">
                                {Math.ceil(
                                    (agents[currentStep].duration -
                                        (progress *
                                            agents[currentStep].duration) /
                                            100) /
                                        1000
                                )}
                                s remaining
                            </span>
                        </div>
                    </div>

                    {/* Current Agent Display */}
                    <div
                        className={`${colors.bg} ${colors.border} rounded-lg p-8 border`}
                    >
                        <div className="text-center">
                            <div className="w-64 h-64 mx-auto mb-6 flex items-center justify-center">
                                <img
                                    src={currentAgent.image}
                                    alt={currentAgent.name}
                                    className="max-h-56 w-auto object-contain"
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-4">
                                {currentAgent.name}
                            </h3>
                            <p className="text-lg text-muted-foreground mb-6">
                                {currentAgent.description}
                            </p>
                        </div>
                    </div>

                    {/* Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        {/* Status Card */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <h3 className="font-semibold text-foreground mb-2">
                                Status
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Processing
                            </p>
                        </div>

                        {/* Agents Working Card */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <h3 className="font-semibold text-foreground mb-2">
                                AI Agents
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                4 agents active
                            </p>
                        </div>

                        {/* Estimated Time Card */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <h3 className="font-semibold text-foreground mb-2">
                                Estimated Time
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                24-48 hours
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LeadGeneration
