'use client'

import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

export const Effects = () => {
    return (
        <EffectComposer multisampling={0}>
            {/* Bloom for glowing stars and text */}
            <Bloom
                luminanceThreshold={0.2}
                mipmapBlur
                intensity={1.5}
                radius={0.8}
            />

            {/* Vignette for deep space focus */}
            <Vignette eskil={false} offset={0.1} darkness={1.1} />

            {/* Subtle Noise for cinematic film grain */}
            <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
        </EffectComposer>
    )
}
