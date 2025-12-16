'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { ProjectStar } from './ProjectStar'
import * as THREE from 'three'
import { useStore } from '@/store/useStore'

const projects = [
    { id: 'image', title: 'Image', color: '#00ccff', position: [-3, 2, -6], scale: 1.0 }, // Space Stone (Blue)
    { id: 'video', title: 'Video', color: '#ff3333', position: [3, -1, -8], scale: 1.3 }, // Reality Stone (Red)
    //{ id: 'music', title: 'Music', color: '#cc00cc', position: [-2, -3, -5], scale: 0.9 }, // Power Stone (Purple) - REMOVED
    { id: 'artwork', title: 'Artwork', color: '#ffcc00', position: [2, 3, -7], scale: 1.1 }, // Mind Stone (Yellow)
] as const

export const StarField = () => {
    const groupRef = useRef<THREE.Group>(null!)
    const { setIsWarping, isWarping } = useStore()
    const arrivalFinished = useRef(false)

    // Handle Arrival (Deceleration)
    useEffect(() => {
        // Reset warp state AFTER arrival animation
        // This ensures the "brake" effect happens during the first 1.5s
        const timeout = setTimeout(() => {
            setIsWarping(false)
            arrivalFinished.current = true
        }, 1500)
        return () => clearTimeout(timeout)
    }, [setIsWarping])

    useFrame((state, delta) => {
        if (!groupRef.current) return

        if (!arrivalFinished.current) {
            // ARRIVAL: Come from far (-50) to 0
            groupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), delta * 2)
            groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 2)
        }

        // DEPARTURE: Removed as requested. 
        // The "Flash" transition from ProjectStar handles the visual exit.

        // Slow drift of the entire field (Rotation)
        groupRef.current.rotation.y += 0.0005
    })

    return (
        // Start very small and slightly far back to simulate "distant galaxy" coming into view
        <group ref={groupRef} scale={[0.01, 0.01, 0.01]} position={[0, 0, -100]}>
            {/* Background background stars (distant) */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {/* Interactive Project Stars */}
            {projects.map((project) => (
                <ProjectStar
                    key={project.id}
                    projectId={project.id}
                    title={project.title}
                    color={project.color}
                    position={project.position as any}
                    scale={project.scale}
                />
            ))}
        </group>
    )
}
