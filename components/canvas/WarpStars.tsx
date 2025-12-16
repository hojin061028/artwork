'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '@/store/useStore'

export const WarpStars = () => {
    const isWarping = useStore((state) => state.isWarping)
    const meshRef = useRef<THREE.InstancedMesh>(null!)
    const groupRef = useRef<THREE.Group>(null!)
    const count = 2000 // More particles for dense effect
    const dummy = useMemo(() => new THREE.Object3D(), [])

    // Generate random initial positions
    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100
            const factor = (Math.random() - 0.5) * 100
            const speed = 0.01 + Math.random() / 200
            const x = (Math.random() - 0.5) * 100 // Spread wide
            const y = (Math.random() - 0.5) * 100
            const z = (Math.random() - 0.5) * 200 - 100 // Start deep

            // Push items away from center to form a tunnel
            const r = 10 + Math.random() * 40
            const theta = 2 * Math.PI * Math.random()

            const xPos = r * Math.cos(theta)
            const yPos = r * Math.sin(theta)

            temp.push({ t, factor, speed, x: xPos, y: yPos, z, mx: 0, my: 0 })
        }
        return temp
    }, [count])

    const warpIntensity = useRef(0)

    useFrame((state, delta) => {
        if (!meshRef.current || !groupRef.current) return

        // 1. Calculate Momentum (Throttle vs Brake)
        const targetIntensity = isWarping ? 1 : 0
        // Lerp factor determines braking "softness". 
        // Lower val = smoother, heavier braking feel.
        warpIntensity.current = THREE.MathUtils.lerp(warpIntensity.current, targetIntensity, delta * 2)

        // 2. Visibility Optimization
        if (warpIntensity.current < 0.01) {
            groupRef.current.visible = false
            return
        }
        groupRef.current.visible = true

        particles.forEach((particle, i) => {
            // Speed scaled by intensity
            // Using easeIn/Out logic or just linear multiplier
            // Power of 2 gives a nice curve to the slowdown
            let speed = 200 * delta * (warpIntensity.current)

            particle.z += speed

            // Loop particles
            if (particle.z > 20) {
                particle.z = -200
            }

            // Update dummy object
            dummy.position.set(particle.x, particle.y, particle.z)

            // Stretch depends on speed too! Less speed = shorter streaks
            const stretch = 10 * warpIntensity.current + Math.random() * 10 * warpIntensity.current
            dummy.scale.set(0.1, 0.1, Math.max(1, stretch))

            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        })

        meshRef.current.instanceMatrix.needsUpdate = true

        // Rotate the whole tunnel slightly
        groupRef.current.rotation.z += delta * 0.1 * warpIntensity.current
    })

    return (
        <group ref={groupRef}>
            <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
                <boxGeometry args={[0.2, 0.2, 1]} />
                <meshBasicMaterial
                    color="#88ccff"
                    transparent
                    opacity={0.8}
                // We can't easily animate opacity per instance here efficiently without custom shader or attributes,
                // but we can animate the global material opacity if we extract it, 
                // or just rely on the 'shorter streaks' and 'disappearing' to look like fading.
                // Actually, let's just assume opacity prop update works for the batch.
                />
            </instancedMesh>
        </group>
    )
}
