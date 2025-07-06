import React, { useState } from 'react'
import walrusLogo from '../../assets/images/walrus.png'

interface Lead {
    id: string
    name: string
    email: string
    company: string
    position: string
    phone: string
    status: 'new' | 'purchased'
    submittedBy: string
    submittedDate: string
    background: string
    revealPrice: number
}

const LeadResults: React.FC = () => {
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [revealedLeads, setRevealedLeads] = useState<Set<string>>(new Set())
    const [showDecryptPopup, setShowDecryptPopup] = useState(false)

    // Mock data - replace with actual data from your API
    const [leads] = useState<Lead[]>([
        {
            id: '1',
            name: 'Alex Chen',
            email: 'alex.chen@uniswap.org',
            company: 'Uniswap Labs',
            position: 'Senior DeFi Developer',
            phone: '+1 (555) 123-4567',
            status: 'new',
            submittedBy: 'Agent001',
            submittedDate: '2024-01-15',
            background:
                'Core contributor to Uniswap v4, specializing in AMM protocol development and MEV protection. 8+ years in DeFi with experience building yield farming protocols and cross-chain bridges. Previously worked on Compound and Aave integrations.',
            revealPrice: 45,
        },
        {
            id: '2',
            name: 'Maria Rodriguez',
            email: 'maria.r@optimism.io',
            company: 'Optimism Foundation',
            position: 'Core Developer',
            phone: '+1 (555) 987-6543',
            status: 'new',
            submittedBy: 'Agent002',
            submittedDate: '2024-01-14',
            background:
                "Leading developer on Optimism's OP Stack, focused on Layer 2 scaling solutions and rollup technology. Expert in EVM compatibility and gas optimization. Previously contributed to Polygon and Arbitrum ecosystems.",
            revealPrice: 60,
        },
        {
            id: '3',
            name: 'David Kim',
            email: 'david.kim@blur.io',
            company: 'Blur Protocol',
            position: 'NFT Platform Architect',
            phone: '+1 (555) 456-7890',
            status: 'new',
            submittedBy: 'Agent003',
            submittedDate: '2024-01-13',
            background:
                "Architect behind Blur's innovative NFT marketplace and trading infrastructure. Pioneer in NFT lending protocols and royalty enforcement. Previously built gaming platforms on Ethereum and Solana.",
            revealPrice: 75,
        },
        {
            id: '4',
            name: 'Lisa Wang',
            email: 'lisa.wang@snapshot.org',
            company: 'Snapshot Labs',
            position: 'Governance Engineer',
            phone: '+1 (555) 321-6540',
            status: 'new',
            submittedBy: 'Agent004',
            submittedDate: '2024-01-12',
            background:
                'Leading governance tool development for DAOs and decentralized organizations. Expert in voting mechanisms, proposal systems, and on-chain governance. Previously worked with Aragon and Moloch DAO frameworks.',
            revealPrice: 40,
        },
        {
            id: '5',
            name: 'James Wilson',
            email: 'james.w@chainlink.network',
            company: 'Chainlink Labs',
            position: 'Oracle Infrastructure Lead',
            phone: '+1 (555) 789-0123',
            status: 'purchased',
            submittedBy: 'Agent005',
            submittedDate: '2024-01-11',
            background:
                "Leading Chainlink's oracle infrastructure and cross-chain data feeds. Expert in decentralized oracle networks and real-world data integration. Previously built DeFi protocols requiring reliable price feeds.",
            revealPrice: 55,
        },
    ])

    const filteredLeads = leads.filter((lead) => {
        const matchesStatus =
            filterStatus === 'all' || lead.status === filterStatus
        const matchesSearch =
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'purchased':
                return 'bg-green-100 text-green-800'
            case 'new':
                return 'bg-blue-100 text-blue-800'
            default:
                return 'bg-muted text-muted-foreground'
        }
    }

    const handleStatusChange = (leadId: string, newStatus: string) => {
        // Handle status change logic here
        console.log(`Changing lead ${leadId} status to ${newStatus}`)
    }

    const handleReveal = (leadId: string) => {
        // Show the decrypt popup
        setShowDecryptPopup(true)

        // Simulate decryption process with a delay
        setTimeout(() => {
            setShowDecryptPopup(false)
            // Handle payment logic here
            console.log(`Revealing lead ${leadId}`)
            setRevealedLeads((prev) => new Set(prev).add(leadId))
        }, 3000) // 3 second delay to show the animation
    }

    const isRevealed = (leadId: string) => revealedLeads.has(leadId)

    return (
        <div className="min-h-screen bg-background py-8">
            {/* Decrypt Popup */}
            {showDecryptPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-card rounded-lg p-8 max-w-md w-full mx-4 text-center">
                        <div className="flex flex-col items-center space-y-6">
                            {/* Animated Loader */}
                            <div className="relative">
                                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>

                            {/* Text */}
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Decrypting Data
                                </h3>
                                <img
                                    src={walrusLogo}
                                    alt="Walrus Logo"
                                    className="w-64 h-64 object-contain mx-auto mb-2"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Please wait while we securely decrypt the
                                    lead information...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-card shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-border">
                        <h1 className="text-2xl font-bold text-foreground">
                            Lead Results
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Review and manage submitted leads
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="px-6 py-4 border-b border-border">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search leads..."
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value)
                                    }
                                    className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring"
                                >
                                    <option value="all">All Status</option>
                                    <option value="new">New</option>
                                    <option value="purchased">Purchased</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Lead
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Company & Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Background
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Submitted By
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-card divide-y divide-border">
                                {filteredLeads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        className="hover:bg-muted/20"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-foreground">
                                                    {lead.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {lead.position}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div
                                                className={`${
                                                    !isRevealed(lead.id)
                                                        ? 'blur-sm select-none'
                                                        : ''
                                                }`}
                                            >
                                                <div className="text-sm font-medium text-foreground">
                                                    {lead.company}
                                                </div>
                                                <div className="text-sm text-foreground">
                                                    {lead.email}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {lead.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div
                                                className={`text-sm text-foreground max-w-md ${
                                                    !isRevealed(lead.id)
                                                        ? 'blur-sm select-none'
                                                        : ''
                                                }`}
                                            >
                                                {lead.background}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                    lead.status
                                                )}`}
                                            >
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                            {lead.submittedBy}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {new Date(
                                                lead.submittedDate
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex flex-col space-y-2">
                                                {!isRevealed(lead.id) ? (
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() =>
                                                                handleReveal(
                                                                    lead.id
                                                                )
                                                            }
                                                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                        >
                                                            Reveal
                                                        </button>
                                                        <span className="text-xs text-muted-foreground">
                                                            ${lead.revealPrice}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-green-600 font-medium">
                                                        You paid $
                                                        {lead.revealPrice}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredLeads.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                No leads found matching your criteria.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LeadResults
