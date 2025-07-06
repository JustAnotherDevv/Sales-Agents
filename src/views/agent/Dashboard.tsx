import React, { useState } from 'react'

interface Bounty {
    id: string
    title: string
    description: string
    reward: number
    company: string
    industry: string
    deadline: string
    status: 'active' | 'completed' | 'expired'
}

interface Lead {
    id: string
    name: string
    company: string
    position: string
    email: string
    phone: string
    bountyId: string
    bountyTitle: string
    status: 'pending' | 'approved' | 'rejected'
    submittedDate: string
}

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<
        'overview' | 'bounties' | 'leads' | 'earnings'
    >('overview')

    // Mock data - replace with actual data from your API
    const [bounties] = useState<Bounty[]>([
        {
            id: '1',
            title: 'DeFi Protocol Builder Lead',
            description:
                'Seeking experienced DeFi developers and protocol builders with proven track record in yield farming, DEX development, or lending protocols',
            reward: 1200,
            company: 'Ethereum Foundation',
            industry: 'DeFi',
            deadline: '2024-02-15',
            status: 'active',
        },
        {
            id: '2',
            title: 'Layer 2 Scaling Solution Lead',
            description:
                'Looking for developers and teams building on Polygon, Arbitrum, Optimism, or other L2 solutions with active user base',
            reward: 800,
            company: 'Polygon Labs',
            industry: 'Layer 2',
            deadline: '2024-02-20',
            status: 'active',
        },
        {
            id: '3',
            title: 'NFT Marketplace Builder Lead',
            description:
                'Seeking developers building innovative NFT marketplaces, gaming platforms, or digital art platforms with on-chain traction',
            reward: 950,
            company: 'OpenSea',
            industry: 'NFT',
            deadline: '2024-02-25',
            status: 'active',
        },
        {
            id: '4',
            title: 'DAO Governance Tool Builder Lead',
            description:
                'Looking for teams building governance tools, voting mechanisms, or DAO management platforms with active communities',
            reward: 650,
            company: 'Aragon',
            industry: 'DAO',
            deadline: '2024-03-01',
            status: 'active',
        },
    ])

    const [leads] = useState<Lead[]>([
        {
            id: '1',
            name: 'Alex Chen',
            company: 'Uniswap Labs',
            position: 'Senior DeFi Developer',
            email: 'alex.chen@uniswap.org',
            phone: '+1 (555) 123-4567',
            bountyId: '1',
            bountyTitle: 'DeFi Protocol Builder Lead',
            status: 'approved',
            submittedDate: '2024-01-15',
        },
        {
            id: '2',
            name: 'Maria Rodriguez',
            company: 'Optimism Foundation',
            position: 'Core Developer',
            email: 'maria.r@optimism.io',
            phone: '+1 (555) 987-6543',
            bountyId: '2',
            bountyTitle: 'Layer 2 Scaling Solution Lead',
            status: 'pending',
            submittedDate: '2024-01-16',
        },
        {
            id: '3',
            name: 'David Kim',
            company: 'Blur Protocol',
            position: 'NFT Platform Architect',
            email: 'david.kim@blur.io',
            phone: '+1 (555) 456-7890',
            bountyId: '3',
            bountyTitle: 'NFT Marketplace Builder Lead',
            status: 'approved',
            submittedDate: '2024-01-18',
        },
        {
            id: '4',
            name: 'Lisa Wang',
            company: 'Snapshot Labs',
            position: 'Governance Engineer',
            email: 'lisa.wang@snapshot.org',
            phone: '+1 (555) 321-6540',
            bountyId: '4',
            bountyTitle: 'DAO Governance Tool Builder Lead',
            status: 'rejected',
            submittedDate: '2024-01-20',
        },
    ])

    const stats = {
        totalEarnings: 2150,
        activeBounties: 4,
        submittedLeads: 4,
        approvedLeads: 2,
        pendingLeads: 1,
        rejectedLeads: 1,
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'active':
                return 'bg-blue-100 text-blue-800'
            case 'completed':
                return 'bg-muted text-muted-foreground'
            case 'expired':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-muted text-muted-foreground'
        }
    }

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Earnings
                            </p>
                            <p className="text-2xl font-semibold text-foreground">
                                ${stats.totalEarnings}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg
                                className="w-6 h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                Active Bounties
                            </p>
                            <p className="text-2xl font-semibold text-foreground">
                                {stats.activeBounties}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <svg
                                className="w-6 h-6 text-yellow-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                Submitted Leads
                            </p>
                            <p className="text-2xl font-semibold text-foreground">
                                {stats.submittedLeads}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                Approved Leads
                            </p>
                            <p className="text-2xl font-semibold text-foreground">
                                {stats.approvedLeads}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-lg shadow">
                <div className="px-6 py-4 border-b border-border">
                    <h3 className="text-lg font-medium text-foreground">
                        Recent Activity
                    </h3>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {leads.slice(0, 3).map((lead) => (
                            <div
                                key={lead.id}
                                className="flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Lead submitted for "{lead.bountyTitle}"
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {lead.name} at {lead.company}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                            lead.status
                                        )}`}
                                    >
                                        {lead.status}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(
                                            lead.submittedDate
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )

    const renderBounties = () => (
        <div className="space-y-4">
            {bounties.map((bounty) => (
                <div key={bounty.id} className="bg-card rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="text-lg font-medium text-foreground">
                                {bounty.title}
                            </h3>
                            <p className="text-muted-foreground mt-1">
                                {bounty.description}
                            </p>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>{bounty.company}</span>
                                <span>•</span>
                                <span>{bounty.industry}</span>
                                <span>•</span>
                                <span>
                                    Deadline:{' '}
                                    {new Date(
                                        bounty.deadline
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl font-bold text-green-600">
                                ${bounty.reward}
                            </span>
                            <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                    bounty.status
                                )}`}
                            >
                                {bounty.status}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-md transition duration-300 flex items-center space-x-2">
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            <span>Looking for Leads</span>
                        </button>
                    </div>
                </div>
            ))}
            7
        </div>
    )

    const renderLeads = () => (
        <div className="bg-card rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                    My Submitted Leads
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Lead
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bounty
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-muted/20">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {lead.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {lead.company} • {lead.position}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {lead.bountyTitle}
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(
                                        lead.submittedDate
                                    ).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

    const renderEarnings = () => (
        <div className="space-y-6">
            <div className="bg-card rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Earnings Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                            ${stats.totalEarnings}
                        </p>
                        <p className="text-sm text-gray-600">Total Earnings</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                            {stats.approvedLeads}
                        </p>
                        <p className="text-sm text-gray-600">Approved Leads</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                            {stats.pendingLeads}
                        </p>
                        <p className="text-sm text-gray-600">Pending Leads</p>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Recent Transactions
                </h3>
                <div className="space-y-3">
                    {leads
                        .filter((lead) => lead.status === 'approved')
                        .map((lead) => (
                            <div
                                key={lead.id}
                                className="flex justify-between items-center py-2 border-b border-gray-100"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {lead.bountyTitle}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {lead.name} at {lead.company}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-green-600">
                                        +$
                                        {bounties.find(
                                            (b) => b.id === lead.bountyId
                                        )?.reward || 500}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(
                                            lead.submittedDate
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">
                        Agent Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Welcome back! Here's your sales performance overview.
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'bounties', label: 'Available Bounties' },
                            { id: 'leads', label: 'My Leads' },
                            { id: 'earnings', label: 'Earnings' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'bounties' && renderBounties()}
                {activeTab === 'leads' && renderLeads()}
                {activeTab === 'earnings' && renderEarnings()}
            </div>
        </div>
    )
}

export default Dashboard
