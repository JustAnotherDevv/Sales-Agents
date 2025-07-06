import React, { useState, useRef, useEffect } from 'react'

interface CircularTextProps {
    text: string
    spinDuration?: number
    onHover?: 'speedUp' | 'slowDown' | 'pause' | 'reverse'
    className?: string
    size?: number
}

const CircularText: React.FC<CircularTextProps> = ({
    text,
    spinDuration = 20,
    onHover = 'speedUp',
    className = '',
    size = 200,
}) => {
    const [isHovered, setIsHovered] = useState(false)
    const [currentDuration, setCurrentDuration] = useState(spinDuration)
    const [isReversed, setIsReversed] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isHovered) {
            switch (onHover) {
                case 'speedUp':
                    setCurrentDuration(spinDuration * 0.5)
                    break
                case 'slowDown':
                    setCurrentDuration(spinDuration * 2)
                    break
                case 'pause':
                    setIsPaused(true)
                    break
                case 'reverse':
                    setIsReversed(true)
                    break
            }
        } else {
            setCurrentDuration(spinDuration)
            setIsPaused(false)
            setIsReversed(false)
        }
    }, [isHovered, onHover, spinDuration])

    const characters = text.split('')
    const angleStep = 360 / characters.length

    return (
        <div
            ref={containerRef}
            className={`relative ${className}`}
            style={{ width: size, height: size }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                    animation: isPaused
                        ? 'none'
                        : `${
                              isReversed ? 'spin-reverse' : 'spin'
                          } ${currentDuration}s linear infinite`,
                }}
            >
                {characters.map((char, index) => (
                    <span
                        key={index}
                        className="absolute origin-center text-lg md:text-xl font-medium"
                        style={{
                            transform: `rotate(${
                                index * angleStep
                            }deg) translateY(-${size / 2 - 30}px)`,
                            transformOrigin: 'center',
                        }}
                    >
                        {char}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default CircularText
