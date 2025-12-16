'use client'

import { OrbitControls } from '@react-three/drei'
import { useStore } from '@/store/useStore'
import { HeroParticles } from './HeroParticles'
import { Nebula } from './Nebula'
import { StarField } from './StarField'
import { WarpStars } from './WarpStars'
import { ProjectDetail } from './ProjectDetail'
import { Effects } from './Effects'

export const Experience = () => {
    const navigation = useStore((state) => state.navigation)

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <OrbitControls makeDefault />

            <Nebula />



            {/* Hero Section */}
            {navigation === 'intro' && (
                <HeroParticles />
            )}

            {/* Star Field Section - Only visible AFTER arrival */}
            {(navigation === 'starfield') && (
                <StarField />
            )}
            {/* Warp Effect Layer */}
            <WarpStars />

            {/* Project Detail Section */}
            {navigation === 'detail' && (
                <ProjectDetail />
            )}

            {/* Re-enabling Bloom for the Gemstone Glow */}
            <Effects />
        </>
    )
}
