import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'

const Login: React.FC = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const history = useHistory()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsVerifying(true)

        // Simulate verification process with 4-second timer
        setTimeout(() => {
            setIsVerifying(false)
            // Navigate to create bounty page after successful verification
            history.push('/company/create-bounty')
        }, 4000)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                        Log in with
                    </h2>
                    <div className="mt-4 flex justify-center">
                        <img
                            src="/src/assets/images/self.png"
                            alt="Self Logo"
                            className="h-16 w-auto"
                        />
                    </div>
                </div>

                {isVerifying ? (
                    <div className="mt-8 space-y-6">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-center text-foreground">
                                Verifying identity with Self...
                            </p>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Verify Identity
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default Login
