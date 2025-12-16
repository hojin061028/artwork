'use client'

import { useStore } from '@/store/useStore'
import { useState } from 'react'

export const Overlay = () => {
    const { navigation, setNavigation } = useStore()

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {/* Logo / Header Removed as requested */}

            {/* Intro UI - NOW AUTOMATIC, NO UI NEEDED */}
            {navigation === 'intro' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
                    {/* Automatic transition handling in 3D scene */}
                </div>
            )}


            {/* Detail UI */}
            {navigation === 'detail' && (
                <div className="absolute top-8 left-8 pointer-events-auto z-50">
                    <button
                        onClick={() => setNavigation('starfield')}
                        className="text-white hover:text-gray-300 text-sm font-bold tracking-widest transition-colors flex items-center gap-2 group bg-transparent border-none outline-none"
                        style={{ color: 'white', textShadow: '0 0 4px rgba(0,0,0,0.5)' }}
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        BACK TO GALAXY
                    </button>
                </div>
            )}
        </div>
    )
}
