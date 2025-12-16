'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Image, useVideoTexture, Text, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/store/useStore'
import { useGesture } from '@use-gesture/react'

const VideoPlane = ({ url, position, rotation, scale, muted }: any) => {
    const texture = useVideoTexture(url)

    useEffect(() => {
        if (texture.image) {
            texture.image.muted = muted
            texture.image.volume = 1.0
            if (!muted) {
                texture.image.play().catch((e: any) => console.log("Play error", e))
            }
        }
    }, [muted, texture])

    return (
        <mesh position={position} rotation={rotation} scale={scale}>
            <planeGeometry />
            <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
    )
}

const FloatingItem = ({ url, type, index, total }: any) => {
    const group = useRef<THREE.Group>(null!)
    const [hovered, setHover] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const { viewport, controls } = useThree() as any // Access default controls
    useCursor(hovered)

    // Physics State
    const velocity = useRef(new THREE.Vector3(0, 0, 0))
    const isThrown = useRef(false)
    const isDragging = useRef(false)

    // Random float params
    const randomPos = useMemo(() => {
        const x = (Math.random() - 0.5) * 15
        const y = (Math.random() - 0.5) * 8
        const z = (Math.random() - 0.5) * 5
        return new THREE.Vector3(x, y, z)
    }, [])

    const randomSpeed = useMemo(() => 0.2 + Math.random() * 0.5, [])
    const randomOffset = useMemo(() => Math.random() * 100, [])

    const baseScale = type === 'video' ? [4, 2.25, 1] : [3, 4, 1]

    // Gesture Logic
    const bind = useGesture({
        onPointerEnter: ({ event }) => {
            event.stopPropagation()
            setHover(true)
        },
        onPointerLeave: ({ event }) => {
            // event.stopPropagation() // Optional on leave
            setHover(false)
        },
        onDragStart: ({ event }) => {
            event.stopPropagation()
            isDragging.current = true
            isThrown.current = false
            setExpanded(false)
            if (controls) controls.enabled = false
        },
        onDrag: ({ delta, down, event }) => {
            if (down) event.stopPropagation()
            if (down && group.current) {
                // Map screen pixels to simple 3D movement (approx)
                group.current.position.x += delta[0] * 0.02
                group.current.position.y -= delta[1] * 0.02

                velocity.current.set(delta[0] * 0.05, -delta[1] * 0.05, 0)
            }
        },
        onDragEnd: ({ velocity: gestureVel, direction, event }) => {
            // event.stopPropagation()
            isDragging.current = false
            if (controls) controls.enabled = true

            const speed = Math.hypot(gestureVel[0], gestureVel[1])
            if (speed > 0.5) {
                isThrown.current = true
            }
        }
    })

    const handleClick = (e: any) => {
        // R3F event delta is the distance the mouse moved between down and up
        // If minimal movement, treat as click
        if (e.delta < 5) { // 5 pixels tolerance
            e.stopPropagation()
            setExpanded(!expanded)
            isThrown.current = false
            velocity.current.set(0, 0, 0)
        }
    }

    useFrame((state, delta) => {
        if (!group.current) return
        const t = state.clock.elapsedTime

        if (isDragging.current) {
            // Manual control - do nothing in loop
        } else if (expanded) {
            // Zoom to center
            const targetPos = new THREE.Vector3(0, 0, 3)
            const targetScale = new THREE.Vector3(baseScale[0] * 2, baseScale[1] * 2, 1)

            group.current.position.lerp(targetPos, delta * 3)
            group.current.scale.lerp(targetScale, delta * 3)
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, delta * 3)
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0, delta * 3)
            group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, 0, delta * 3)
        } else if (isThrown.current) {
            // Apply physics
            group.current.position.add(velocity.current)
            // Rotate wildly
            group.current.rotation.z += velocity.current.x * 0.5
            // Friction
            velocity.current.multiplyScalar(0.95)

            // Stop throwing if slow enough
            if (velocity.current.length() < 0.01) {
                isThrown.current = false
            }
        } else {
            // Default Floating
            // Drift logic
            group.current.position.y += Math.sin(t * randomSpeed + randomOffset) * 0.002
            group.current.rotation.z = Math.sin(t * 0.5 + randomOffset) * 0.05

            // Return to base scale
            const targetScale = new THREE.Vector3(baseScale[0], baseScale[1], 1)
            group.current.scale.lerp(targetScale, delta * 3)
        }
    })

    return (
        <group ref={group} position={randomPos} {...bind() as any} onClick={handleClick}>
            {type === 'video' ? (
                <VideoPlane url={url} position={[0, 0, 0]} scale={[1, 1, 1]} muted={!expanded} />
            ) : (
                // @ts-ignore
                <Image url={url} scale={[1, 1, 1]} transparent opacity={0.9} />
            )}
        </group>
    )
}

export const ProjectDetail = () => {
    const groupRef = useRef<THREE.Group>(null!)
    const { setIsWarping, projectFocus } = useStore()
    const [assets, setAssets] = useState<{ images: string[], videos: string[], artworks: string[] }>({ images: [], videos: [], artworks: [] })

    // Fetch Assets
    useEffect(() => {
        // Use static JSON (root path for Vercel)
        fetch('/assets.json')
            .then(res => res.json())
            .then(data => setAssets(data))
            .catch(err => {
                console.error("Failed to load assets", err)
            })
    }, [])

    // Arrival Animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsWarping(false)
        }, 1000)
        return () => clearTimeout(timer)
    }, [])

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Fly-in Transition
            groupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), delta * 2)
            groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 2)
        }
    })

    const items = useMemo(() => {
        // No base path needed for Vercel (root)
        const bp = ''
        if (projectFocus === 'image') return assets.images.map(f => `${bp}/assets/works/${f}`)
        if (projectFocus === 'video') return assets.videos.map(f => `${bp}/assets/works/${f}`)
        if (projectFocus === 'artwork') return assets.artworks.map(f => `${bp}/assets/artwork/${f}`)
        return []
    }, [projectFocus, assets])

    return (
        <group ref={groupRef} position={[0, 0, -50]} scale={[0.01, 0.01, 0.01]}>
            {items.map((url, i) => (
                <FloatingItem
                    key={url}
                    url={url}
                    type={projectFocus}
                    index={i}
                    total={items.length}
                />
            ))}

            {items.length === 0 && (
                <Text position={[0, 0, 0]} fontSize={0.5} color="white">
                    {projectFocus === 'music' || projectFocus === 'artwork' ? 'COMING SOON' : 'LOADING...'}
                </Text>
            )}
        </group>
    )
}
