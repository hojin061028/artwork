'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cloud, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

export const Nebula = () => {
    const group = useRef<THREE.Group>(null!)

    useFrame((state) => {
        // Slow constant rotation
        const t = state.clock.getElapsedTime()

        // Mouse interaction parallax
        const { x, y } = state.pointer

        // Softly follow mouse with delay
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, y * 0.05, 0.05)
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x * 0.05 + t * 0.02, 0.05)
    })

    return (
        <group ref={group}>
            {/* Deep background color hint is in global css, but we can add large background planes or clouds */}

            {/* Background Nebula Clouds - Purple/Blue vibes */}
            <Cloud opacity={0.3} speed={0.2} segments={20} position={[0, -5, -20]} color="#4a1c6e" />
            <Cloud opacity={0.2} speed={0.2} segments={20} position={[8, 5, -20]} color="#1c3d6e" />
            <Cloud opacity={0.2} speed={0.2} segments={20} position={[-8, 0, -20]} color="#6e1c4a" />

            {/* Cosmic Dust */}
            <Sparkles count={300} scale={30} size={4} speed={0.3} opacity={0.6} color="#ffffff" />
            <Sparkles count={100} scale={25} size={6} speed={0.5} opacity={0.4} color="#ffd700" noise={1} />
        </group>
    )
}
