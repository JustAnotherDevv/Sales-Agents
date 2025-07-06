import React, { useState } from 'react'

interface BountyFormProps {
    onSubmit?: (data: BountyFormData) => void
    onCancel?: () => void
}

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

const BountyForm: React.FC<BountyFormProps> = ({ onSubmit, onCancel }) => {
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
        if (onSubmit) {
            onSubmit(formData)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
                🚀 Lead Request Form
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
                            handleInputChange('companyName', e.target.value)
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
                            handleInputChange('mainLink', e.target.value)
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
                                handleInputChange('contactName', e.target.value)
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
                                handleInputChange('contactInfo', e.target.value)
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
                    <div className="space-y-2">
                        {leadTypeOptions.map((option) => (
                            <label
                                key={option}
                                className="flex items-center space-x-2"
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.leadTypes.includes(
                                        option
                                    )}
                                    onChange={(e) =>
                                        handleCheckboxChange(
                                            'leadTypes',
                                            option,
                                            e.target.checked
                                        )
                                    }
                                    className="rounded border-input focus:ring-ring"
                                />
                                <span className="text-sm">{option}</span>
                            </label>
                        ))}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.leadTypes.includes('Other')}
                                onChange={(e) =>
                                    handleCheckboxChange(
                                        'leadTypes',
                                        'Other',
                                        e.target.checked
                                    )
                                }
                                className="rounded border-input focus:ring-ring"
                            />
                            <span className="text-sm">Other:</span>
                            <input
                                type="text"
                                value={formData.otherLeadType}
                                onChange={(e) =>
                                    handleInputChange(
                                        'otherLeadType',
                                        e.target.value
                                    )
                                }
                                className="flex-1 px-2 py-1 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Specify other lead type"
                                disabled={!formData.leadTypes.includes('Other')}
                            />
                        </div>
                    </div>
                </div>

                {/* Sector */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Preferred Sector (optional)
                    </label>
                    <div className="space-y-2">
                        {sectorOptions.map((option) => (
                            <label
                                key={option}
                                className="flex items-center space-x-2"
                            >
                                <input
                                    type="radio"
                                    name="sector"
                                    value={option}
                                    checked={formData.sector === option}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'sector',
                                            e.target.value
                                        )
                                    }
                                    className="border-input focus:ring-ring"
                                />
                                <span className="text-sm">{option}</span>
                            </label>
                        ))}
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="sector"
                                value="Other"
                                checked={formData.sector === 'Other'}
                                onChange={(e) =>
                                    handleInputChange('sector', e.target.value)
                                }
                                className="border-input focus:ring-ring"
                            />
                            <span className="text-sm">Other:</span>
                            <input
                                type="text"
                                value={formData.otherSector}
                                onChange={(e) =>
                                    handleInputChange(
                                        'otherSector',
                                        e.target.value
                                    )
                                }
                                className="flex-1 px-2 py-1 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Specify other sector"
                                disabled={formData.sector !== 'Other'}
                            />
                        </div>
                    </div>
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
                                <span className="text-sm">{option}</span>
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
                            handleInputChange('additionalNotes', e.target.value)
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
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-muted text-muted-foreground py-2 px-4 rounded-md hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}

export default BountyForm
