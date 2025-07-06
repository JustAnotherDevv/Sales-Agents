import React from 'react'
import { useHistory } from 'react-router-dom'
import SplashCursor from '../../components/SplashCursor'
import CircularText from '../../components/ui/circular-text'
import { useWindowSize } from '../../hooks/useWindowSize'

const Landing: React.FC = () => {
    const history = useHistory()
    const { width } = useWindowSize()
    const isDesktop = width >= 768

    const handleCreateBountyClick = () => {
        history.push('/company/login')
    }

    const handleOfferAgentClick = () => {
        history.push('/agent/dashboard')
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Centered Content */}
                <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-8">
                    {/* Hero Image */}
                    <img
                        src="/src/assets/images/logo-text.png"
                        alt="Sales Agents Logo"
                        className="h-24 md:h-32 w-auto mb-0"
                    />

                    {/* Main Value Proposition */}
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
                            The Incentivized Sales Network for
                            <span className="text-primary block">
                                Blockchain Ecosystems
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
                            A decentralized network of humans and AI
                            collaborating to identify and close leads
                        </p>
                    </div>

                    {/* Hero Image */}
                    <img
                        src="/src/assets/images/header-image.png"
                        alt="Sales Agents Hero"
                        className="w-full max-w-4xl h-auto mb-8"
                    />

                    {/* Key Benefits */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
                        <div className="bg-card p-6 rounded-lg border">
                            <h3 className="text-xl font-semibold text-foreground mb-3">
                                For Grant Programs
                            </h3>
                            <p className="text-muted-foreground">
                                Connect with qualified applicants and builders
                                who are actively seeking funding opportunities
                                in your ecosystem.
                            </p>
                        </div>
                        <div className="bg-card p-6 rounded-lg border">
                            <h3 className="text-xl font-semibold text-foreground mb-3">
                                For Chain Builders
                            </h3>
                            <p className="text-muted-foreground">
                                Find developers, projects, and teams looking to
                                build on your blockchain with proven on-chain
                                traction.
                            </p>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="text-center space-y-6 max-w-4xl">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                            How Our Network Works
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                    <span className="text-2xl font-bold text-primary">
                                        1
                                    </span>
                                </div>
                                <h3 className="font-semibold text-foreground">
                                    Lead Discovery
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Our agents use LinkedIn and X scraping to
                                    identify high-potential leads for your
                                    ecosystem
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                    <span className="text-2xl font-bold text-primary">
                                        2
                                    </span>
                                </div>
                                <h3 className="font-semibold text-foreground">
                                    Lead Filtering & Verification
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Agents review, approve, and work to validate
                                    ensuring quality and relevance
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                    <span className="text-2xl font-bold text-primary">
                                        3
                                    </span>
                                </div>
                                <h3 className="font-semibold text-foreground">
                                    Buy Leads
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Purchase leads from agents and close more
                                    deals faster
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleCreateBountyClick}
                            className="px-8 py-4 bg-primary text-primary-foreground text-xl font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                        >
                            Post Lead Bounty
                        </button>
                        <button
                            onClick={handleOfferAgentClick}
                            className="px-8 py-4 bg-secondary text-secondary-foreground text-xl font-semibold rounded-lg hover:bg-secondary/90 transition-colors shadow-lg hover:shadow-xl"
                        >
                            Become an Agent
                        </button>
                    </div>

                    {/* Technology Stack Section */}
                    <div className="mt-16 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                            Powered By
                        </h2>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                            {/* Artificial Superintelligence Alliance */}
                            <div className="flex flex-col items-center space-y-3">
                                <img
                                    src="/src/assets/images/alliance.png"
                                    alt="Artificial Superintelligence Alliance"
                                    className="h-24 w-auto"
                                />
                                <p className="text-sm text-muted-foreground max-w-48 text-center">
                                    Multi-agent workflow to aggregate, evaluate,
                                    compare, and prioritize leads for optimal
                                    results.
                                </p>
                            </div>

                            {/* Walrus */}
                            <div className="flex flex-col items-center space-y-3">
                                <img
                                    src="/src/assets/images/walrus.png"
                                    alt="Walrus"
                                    className="h-24 w-auto"
                                />
                                <p className="text-sm text-muted-foreground max-w-48 text-center">
                                    Secure storage of sales lead information
                                    with advanced access permissioning and data
                                    protection.
                                </p>
                            </div>

                            {/* Self */}
                            <div className="flex flex-col items-center space-y-3">
                                <img
                                    src="/src/assets/images/self.png"
                                    alt="Self"
                                    className="h-24 w-auto"
                                />
                                <p className="text-sm text-muted-foreground max-w-48 text-center">
                                    Verification of company identity to
                                    guarantee legitimacy and trust in lead
                                    requests.
                                </p>
                            </div>

                            {/* OG Labs */}
                            <div className="flex flex-col items-center space-y-3">
                                <img
                                    src="/src/assets/images/og.png"
                                    alt="OG Labs"
                                    className="h-24 w-auto"
                                />
                                <p className="text-sm text-muted-foreground max-w-48 text-center">
                                    Multi-stage payouts of funds to agents that
                                    discover quality leads, ensuring fair
                                    compensation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Landing
