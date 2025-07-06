import React, { useEffect, useState } from 'react'

const SplashCursor: React.FC = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY })
            setIsVisible(true)
        }

        const handleMouseLeave = () => {
            setIsVisible(false)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [])

    if (!isVisible) return null

    return (
        <div
            className="fixed pointer-events-none z-50 transition-transform duration-100 ease-out"
            style={{
                left: position.x - 20,
                top: position.y - 20,
                transform: 'translate(-50%, -50%)',
            }}
        >
            <div className="w-10 h-10 bg-primary/20 rounded-full animate-pulse"></div>
        </div>
    )
}

export default SplashCursor
