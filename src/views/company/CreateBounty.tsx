import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

interface BountyFormData {
    companyName: string
    mainLink: string
    contactName: string
    contactInfo: string
    leadTypes: string[]
    otherLeadType: string
    sector: string
    otherSector: string
    supportOfferings: string[]
    additionalNotes: string
}

const CreateBounty: React.FC = () => {
    const history = useHistory()
    const [formData, setFormData] = useState<BountyFormData>({
        companyName: '',
        mainLink: '',
        contactName: '',
        contactInfo: '',
        leadTypes: [],
        otherLeadType: '',
        sector: '',
        otherSector: '',
        supportOfferings: [],
        additionalNotes: '',
    })

    const leadTypeOptions = [
        'Early-stage builders',
        'Live projects',
        'Projects looking for grants',
        'Teams raising funding',
        'Startups for our incubator',
    ]

    const sectorOptions = [
        'Infra / Tooling',
        'DeFi',
        'Gaming',
        'Social / Community',
        'RWA / Sustainability',
    ]

    const supportOptions = [
        'Grant',
        'Investment',
        'Incubation',
        'Infra / tech support',
    ]

    const handleInputChange = (field: keyof BountyFormData, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleCheckboxChange = (
        field: 'leadTypes' | 'supportOfferings',
        value: string,
        checked: boolean
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: checked
                ? [...prev[field], value]
                : prev[field].filter((item) => item !== value),
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle bounty creation logic here
        console.log('Creating bounty:', formData)
        // Navigate to lead generation page
        history.push('/lead-generation')
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-card shadow rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-foreground mb-6">
                        🚀 Lead Request Form
                    </h1>
                    <h2 className="text-xl font-bold text-foreground mb-6">
                        Request leads for agents in the network to seek out!
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Company or Protocol Name */}
                        <div>
                            <label
                                htmlFor="companyName"
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                Company or Protocol Name
                            </label>
                            <input
                                type="text"
                                id="companyName"
                                value={formData.companyName}
                                onChange={(e) =>
                                    handleInputChange(
                                        'companyName',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Who you are"
                                required
                            />
                        </div>

                        {/* Main Link */}
                        <div>
                            <label
                                htmlFor="mainLink"
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                Main Link
                            </label>
                            <input
                                type="url"
                                id="mainLink"
                                value={formData.mainLink}
                                onChange={(e) =>
                                    handleInputChange(
                                        'mainLink',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Website, dApp, or Twitter"
                                required
                            />
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="contactName"
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="contactName"
                                    value={formData.contactName}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'contactName',
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="Your name"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="contactInfo"
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    Email or Telegram
                                </label>
                                <input
                                    type="text"
                                    id="contactInfo"
                                    value={formData.contactInfo}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'contactInfo',
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="Email or @username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Lead Types */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                What kind of leads are you looking for?
                            </label>
                            <select
                                value={formData.leadTypes[0] || ''}
                                onChange={(e) => {
                                    const value = e.target.value
                                    if (value === 'Other') {
                                        handleInputChange('leadTypes', [
                                            'Other',
                                        ])
                                    } else if (value) {
                                        handleInputChange('leadTypes', [value])
                                    } else {
                                        handleInputChange('leadTypes', [])
                                    }
                                }}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                required
                            >
                                <option value="">Select lead type</option>
                                {leadTypeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                                <option value="Other">Other</option>
                            </select>
                            {formData.leadTypes.includes('Other') && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={formData.otherLeadType}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'otherLeadType',
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="Specify other lead type"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Sector */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Preferred Sector (optional)
                            </label>
                            <select
                                value={formData.sector}
                                onChange={(e) =>
                                    handleInputChange('sector', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">Select sector</option>
                                {sectorOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                                <option value="Other">Other</option>
                            </select>
                            {formData.sector === 'Other' && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={formData.otherSector}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'otherSector',
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="Specify other sector"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Support Offerings */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                What support are you offering?
                            </label>
                            <div className="space-y-2">
                                {supportOptions.map((option) => (
                                    <label
                                        key={option}
                                        className="flex items-center space-x-2"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.supportOfferings.includes(
                                                option
                                            )}
                                            onChange={(e) =>
                                                handleCheckboxChange(
                                                    'supportOfferings',
                                                    option,
                                                    e.target.checked
                                                )
                                            }
                                            className="rounded border-input focus:ring-ring"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            {option}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label
                                htmlFor="additionalNotes"
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                Anything else we should know? (Optional)
                            </label>
                            <textarea
                                id="additionalNotes"
                                value={formData.additionalNotes}
                                onChange={(e) =>
                                    handleInputChange(
                                        'additionalNotes',
                                        e.target.value
                                    )
                                }
                                rows={3}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Optional notes"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                Submit Lead Request
                            </button>
                            <button
                                type="button"
                                className="flex-1 bg-muted text-muted-foreground py-2 px-4 rounded-md hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateBounty
