import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

const Header: React.FC = () => {
    const history = useHistory()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const handleLoginClick = () => {
        history.push('/company/login')
    }

    const handleRegisterClick = () => {
        history.push('/agent/register')
    }

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    const closeDropdown = () => {
        setIsDropdownOpen(false)
    }

    const navigateTo = (path: string) => {
        history.push(path)
        closeDropdown()
    }

    const companyMenuItems = [
        { name: 'Login', path: '/company/login' },
        { name: 'Create Lead Request', path: '/company/create-bounty' },
        { name: 'Lead Results', path: '/company/lead-results' },
    ]

    const agentMenuItems = [{ name: 'Dashboard', path: '/agent/dashboard' }]

    const otherMenuItems = [{ name: 'Home', path: '/' }]

    return (
        <header className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
                <img
                    src="/src/assets/images/logo.png"
                    alt="Sales Agents"
                    className="h-12"
                />
            </div>

            <nav className="flex items-center space-x-4">
                {/* Desktop Navigation */}
                {/* Optionally comment out or remove the desktop buttons if you want only the hamburger menu */}
                {/*
                <div className="hidden md:flex items-center space-x-4">
                    <button
                        onClick={handleLoginClick}
                        className="px-4 py-2 text-foreground hover:text-primary transition-colors"
                    >
                        Login
                    </button>
                    <button
                        onClick={handleRegisterClick}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Register
                    </button>
                </div>
                */}

                {/* Hamburger Dropdown Menu - always visible now */}
                <div className="relative">
                    <button
                        onClick={toggleDropdown}
                        className="p-2 text-foreground hover:text-primary transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
                            <div className="py-2">
                                {/* Other Menu Items */}
                                {otherMenuItems.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => navigateTo(item.path)}
                                        className="w-full text-left px-4 py-3 text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                    >
                                        {item.name}
                                    </button>
                                ))}

                                {/* Divider */}
                                <div className="border-t border-border my-2"></div>

                                {/* Company Section */}
                                <div className="px-4 py-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                        Company
                                    </h3>
                                    {companyMenuItems.map((item, index) => (
                                        <button
                                            key={`company-${index}`}
                                            onClick={() =>
                                                navigateTo(item.path)
                                            }
                                            className="w-full text-left px-4 py-2 text-foreground hover:bg-primary/10 hover:text-primary transition-colors text-sm"
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-border my-2"></div>

                                {/* Agent Section */}
                                <div className="px-4 py-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                        Agent
                                    </h3>
                                    {agentMenuItems.map((item, index) => (
                                        <button
                                            key={`agent-${index}`}
                                            onClick={() =>
                                                navigateTo(item.path)
                                            }
                                            className="w-full text-left px-4 py-2 text-foreground hover:bg-primary/10 hover:text-primary transition-colors text-sm"
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Overlay to close dropdown when clicking outside */}
            {isDropdownOpen && (
                <div
                    className="fixed inset-0 z-40 md:hidden"
                    onClick={closeDropdown}
                />
            )}
        </header>
    )
}

export default Header
