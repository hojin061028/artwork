'use client'

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, extend } from '@react-three/fiber'
import { Center, useFont } from '@react-three/drei'
import { TextGeometry, MeshSurfaceSampler } from 'three-stdlib'

extend({ TextGeometry })

import { useStore } from '@/store/useStore'

export const HeroParticles = () => {
    const fontUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_bold.typeface.json'
    const font = useFont(fontUrl)
    const setNavigation = useStore((state) => state.setNavigation)
    const setIsWarping = useStore((state) => state.setIsWarping)

    const { points } = useMemo(() => {
        const geometry = new TextGeometry('ART STAR', {
            font: font as any,
            size: 1.8, // Slightly larger
            height: 0.4, // Thicker
            curveSegments: 20, // Smoother
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        } as any)

        geometry.center()

        // Create a temporary mesh to sample from
        const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial())
        const sampler = new MeshSurfaceSampler(mesh).build()

        const count = 5000 // High density for readability
        const positions = new Float32Array(count * 3)
        const tempPosition = new THREE.Vector3()

        for (let i = 0; i < count; i++) {
            sampler.sample(tempPosition)
            positions[i * 3] = tempPosition.x
            positions[i * 3 + 1] = tempPosition.y
            positions[i * 3 + 2] = tempPosition.z
        }

        return { points: positions }
    }, [font])

    const pointsRef = useRef<THREE.Points>(null!)
    const groupRef = useRef<THREE.Group>(null!)
    const materialRef = useRef<THREE.PointsMaterial>(null!)
    const transitionTriggered = useRef(false)

    useFrame((state) => {
        if (!pointsRef.current || !groupRef.current) return

        const t = state.clock.elapsedTime

        // 3 seconds hold, then "Light Speed" jump
        if (t > 3 && !transitionTriggered.current) {
            // Trigger warp lines effect
            setIsWarping(true)

            // Longer transition (1.5s) for travel feel
            const transitionProgress = (t - 3) / 1.5

            // Text flies TOWARDS and PAST camera significantly
            groupRef.current.position.z = THREE.MathUtils.lerp(0, 50, transitionProgress)

            // Fade out
            if (materialRef.current) {
                materialRef.current.opacity = THREE.MathUtils.lerp(1, 0, transitionProgress)
            }

            // Switch scene mid-warp (at 1.5s mark)
            if (t > 4.5) {
                transitionTriggered.current = true
                // Do NOT stop warping yet. Let StarField handle the "Arrival" deceleration.
                setNavigation('starfield')
            }
        }
    })

    return (
        <group ref={groupRef}>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[points, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    ref={materialRef}
                    size={0.02} // Smaller but denser
                    color="#4aaeff"
                    sizeAttenuation
                    transparent
                    opacity={0.9}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    )
}
