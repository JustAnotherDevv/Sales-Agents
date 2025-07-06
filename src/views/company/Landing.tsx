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
        history.push('/company/create-bounty')
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
                    <p className="text-xl md:text-2xl text-center text-muted-foreground mb-8 font-medium -mt-2">
                        The incentivised AI network for sales leads
                    </p>
                    <img
                        src="/src/assets/images/header-image.png"
                        alt="Sales Agents Hero"
                        className="w-full max-w-3xl h-auto mb-8"
                    />

                    <p className="text-lg md:text-xl text-center text-muted-foreground max-w-2xl">
                        Connect with top sales agents and grow your business.
                    </p>
                    <p className="text-lg md:text-xl text-center text-muted-foreground max-w-2xl">
                        Our innovative bounty system ensures quality leads.
                    </p>
                    <p className="text-lg md:text-xl text-center text-muted-foreground max-w-2xl">
                        Scale your sales team without the overhead.
                    </p>
                    <p className="text-lg md:text-xl text-center text-muted-foreground max-w-2xl">
                        Get results that matter to your bottom line.
                    </p>
                    <p className="text-lg md:text-xl text-center text-muted-foreground max-w-2xl">
                        We need a decentralized, efficient way to manage sales
                        operations.
                    </p>
                    <div className="flex items-center gap-3">
                        <img
                            src="/src/assets/images/logo-text.png"
                            alt="Sales Agents Logo"
                            className="h-32 md:h-48 w-auto"
                        />
                    </div>

                    <p className="text-lg md:text-xl text-center text-muted-foreground max-w-2xl">
                        Sales Agents is a bounty management system that allows
                        you to create on-chain verifiable bounties that help
                        your business grow with quality leads from trusted
                        agents.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleCreateBountyClick}
                            className="px-8 py-4 bg-primary text-primary-foreground text-xl font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                        >
                            Get Sales Leads
                        </button>
                        <button className="px-8 py-4 bg-secondary text-secondary-foreground text-xl font-semibold rounded-lg hover:bg-secondary/90 transition-colors shadow-lg hover:shadow-xl">
                            Offer an Agent
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
