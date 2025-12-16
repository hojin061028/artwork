'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/store/useStore'

interface ProjectStarProps {
    position: [number, number, number]
    color: string
    title: string
    projectId: string
    scale?: number
}

export const ProjectStar = ({ position, color, title, projectId, scale = 1 }: ProjectStarProps) => {
    const mesh = useRef<THREE.Mesh>(null)
    const [clicked, setClicked] = useState(false)
    const [hovered, setHover] = useState(false)
    useCursor(hovered)
    const { setIsWarping, setNavigation, setProjectFocus } = useStore()

    // Smooth hover animation & Pulse & Transition Flash
    useFrame((state, delta) => {
        if (mesh.current) {
            // Hover scale effect
            // If clicked, scale up massively to "enter" the light
            const targetScale = clicked ? scale * 15 : (hovered ? 1.4 : 1.0) * scale
            mesh.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * (clicked ? 2 : 5))

            // Rotating animation (Slow tumble)
            mesh.current.rotation.x += delta * 0.2
            mesh.current.rotation.y += delta * 0.3

            // Pulsing Emissive Intensity
            const t = state.clock.elapsedTime
            const pulse = Math.sin(t * 2) * 0.5 + 1.5

            if (mesh.current.material) {
                const mat = mesh.current.material as THREE.MeshStandardMaterial
                // FLASH EFFECT: If clicked, ramp up emissive intensity to blinding levels
                const targetIntensity = clicked ? 100 : (hovered ? 3 : pulse)
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetIntensity, delta * 5)

                // Also ramp up the internal light to flood the scene
                // We can't access pointLight ref easily unless we add one.
                // But the mesh glow with Bloom should be enough if high enough.
            }
        }
    })

    const handleClick = (e: any) => {
        e.stopPropagation()
        setClicked(true)
        setIsWarping(true)

        // Timer to switch scene after flash peaks
        setTimeout(() => {
            setProjectFocus(projectId)
            setNavigation('detail')
        }, 1200)
    }

    // Procedural "Paleolithic Stone" Geometry - Knapped Flint/Obsidian Look
    const geometry = useMemo(() => {
        let geo: THREE.BufferGeometry
        const seed = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const rng = (val: number) => {
            const m = 2 ** 35 - 31
            const a = 185852
            let s = val % m
            return ((s = s * a % m) / m)
        }

        // Base Shapes: Rough, blocky, primitive
        switch (projectId) {
            case 'image':
                geo = new THREE.DodecahedronGeometry(0.5, 0) // Blocky
                break;
            case 'video':
                geo = new THREE.IcosahedronGeometry(0.5, 0) // Triangular
                break;
            case 'music':
                geo = new THREE.OctahedronGeometry(0.5, 1) // Sharp spikes
                break;
            case 'artwork':
                geo = new THREE.TetrahedronGeometry(0.6, 2) // Jagged
                break;
            default:
                geo = new THREE.IcosahedronGeometry(0.5, 0)
        }

        // Convert to non-indexed to allow sharp flat shading per face
        geo = geo.toNonIndexed()
        geo.computeVertexNormals()

        const posAttribute = geo.getAttribute('position')
        const vertex = new THREE.Vector3()

        // Apply "Knapping" (Chipping)
        // We iterate and aggressively flatten or scoop areas
        for (let i = 0; i < posAttribute.count; i++) {
            vertex.fromBufferAttribute(posAttribute, i)

            // Deterministic Random based on position + Seed
            // Use simple spatial hash
            const noise = Math.sin(vertex.x * 3 + vertex.y * 5 + vertex.z * 2 + seed)

            // Sharp Displacement:
            // "Paleolithic" means removed flakes.
            // We push vertices INWARD if noise is below threshold, to simulate a scoop.

            let distortion = 1.0

            // Random chip
            if (noise > 0.5) {
                distortion -= 0.15 // Chip it out
            } else if (noise < -0.5) {
                distortion += 0.05 // Slight bump
            }

            // Global irregularity
            distortion += (Math.random() - 0.5) * 0.1

            vertex.multiplyScalar(distortion)
            posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z)
        }

        // Recompute normals for flat shading logic
        geo.computeVertexNormals()
        return geo
    }, [projectId])

    return (
        <group position={position as any}>
            {/* 1. Internal Power Source (The "Soul" of the stone) */}
            <mesh scale={[scale, scale, scale]}>
                <icosahedronGeometry args={[0.2, 0]} />
                <meshBasicMaterial
                    color={color}
                    toneMapped={false}
                />
            </mesh>
            <pointLight
                color={color}
                intensity={5}
                distance={3 * scale}
                decay={2}
            />

            {/* 2. The Paleolithic Stone Shell */}
            <mesh
                ref={mesh}
                geometry={geometry}
                scale={[scale, scale, scale]}
                onPointerOver={() => {
                    document.body.style.cursor = 'pointer'
                    setHover(true)
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'auto'
                    setHover(false)
                }}
                onClick={handleClick}
            >
                {/* Raw, Chipped Stone Material */}
                <meshPhysicalMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.3 : 0.1}
                    roughness={0.7} // Rough rock
                    metalness={0.2} // Slight mineral sheen
                    transmission={0.2} // Semi-opaque like flint/obsidian
                    thickness={2.0}
                    ior={1.4}
                    clearcoat={0.1} // Dry stone
                    flatShading={true} // Crucial for "Low Poly" / "Chipped" look
                    toneMapped={false}
                />
            </mesh>

            {/* No fake Aura - rely on Bloom finding the bright pixels */}

            <Html
                position={[0, 1.2 * scale, 0]}
                center
                style={{
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.3s',
                    pointerEvents: 'none',
                    transform: `scale(${hovered ? 1 : 0.5})`, // Pop-in effect
                }}
            >
                <div className="flex flex-col items-center">
                    <div className="px-4 py-1.5 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 text-white text-xs font-bold tracking-[0.2em] shadow-2xl shadow-white/10">
                        {title}
                    </div>
                    {/* Little connection line */}
                    <div className="w-px h-4 bg-gradient-to-b from-white/20 to-transparent"></div>
                </div>
            </Html>
        </group>
    )
}
