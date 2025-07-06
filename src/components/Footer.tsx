import React from 'react'
import { useHistory } from 'react-router-dom'

const Footer: React.FC = () => {
    const history = useHistory()

    const handleCreateBountyClick = () => {
        history.push('/company/create-bounty')
    }

    const handleRegisterClick = () => {
        history.push('/agent/register')
    }

    const handleLoginClick = () => {
        history.push('/company/login')
    }

    return (
        <footer className="bg-background ">
            <div className="container mx-auto px-4 py-12">
                {/* Bottom Bar */}
                <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className="text-sm text-muted-foreground">
                        © 2025 AI Sales Agents. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-4">
                        <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            View on Github
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
