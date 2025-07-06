import React, { useState } from 'react'

interface Lead {
    id: string
    name: string
    email: string
    company: string
    position: string
    phone: string
    status: 'pending' | 'approved' | 'rejected'
    submittedBy: string
    submittedDate: string
}

const LeadResults: React.FC = () => {
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')

    // Mock data - replace with actual data from your API
    const [leads] = useState<Lead[]>([
        {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@techcorp.com',
            company: 'TechCorp Inc',
            position: 'CTO',
            phone: '+1 (555) 123-4567',
            status: 'pending',
            submittedBy: 'Agent001',
            submittedDate: '2024-01-15',
        },
        {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.j@innovate.com',
            company: 'Innovate Solutions',
            position: 'VP of Sales',
            phone: '+1 (555) 987-6543',
            status: 'approved',
            submittedBy: 'Agent002',
            submittedDate: '2024-01-14',
        },
        {
            id: '3',
            name: 'Mike Davis',
            email: 'mike.davis@startup.com',
            company: 'StartupXYZ',
            position: 'CEO',
            phone: '+1 (555) 456-7890',
            status: 'rejected',
            submittedBy: 'Agent003',
            submittedDate: '2024-01-13',
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
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-muted text-muted-foreground'
        }
    }

    const handleStatusChange = (leadId: string, newStatus: string) => {
        // Handle status change logic here
        console.log(`Changing lead ${leadId} status to ${newStatus}`)
    }

    return (
        <div className="min-h-screen bg-background py-8">
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
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
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
                                        Company
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Contact
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                            {lead.company}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-foreground">
                                                {lead.email}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {lead.phone}
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
                                            {lead.status === 'pending' && (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                lead.id,
                                                                'approved'
                                                            )
                                                        }
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                lead.id,
                                                                'rejected'
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
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
