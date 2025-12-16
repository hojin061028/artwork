'use client'

import dynamic from 'next/dynamic'
import { Overlay } from '@/components/dom/Overlay'
import { Experience } from '@/components/canvas/Experience'

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

export default function Home() {
  return (
    <main className="w-full h-screen relative">
      <div className="canvas-container absolute inset-0 z-0">
        <Scene>
          <Experience />
        </Scene>
      </div>
      <Overlay />
    </main>
  )
}
