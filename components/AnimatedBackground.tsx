'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const allBackgroundImages = [
  '/images/background.png',
  '/images/picture1.jpg',
  '/images/picture2.jpg',
  '/images/picture3.jpeg',
  '/images/picture4.jpeg',
  '/images/picture5.jpg',
  '/images/picture6.jpg',
  '/images/picture7.jpg',
  '/images/picture8.jpg',
  '/images/picture9.jpg',
  '/images/picture10.jpg',
]

// Náhodné rozmíchání pole
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function AnimatedBackground() {
  // Použít původní pořadí pro SSR, shuffleovat až na klientovi
  const [backgroundImages, setBackgroundImages] = useState(allBackgroundImages)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)

  // Shuffleovat až po mount na klientovi - zabrání hydration mismatch
  useEffect(() => {
    setIsClient(true)
    setBackgroundImages(shuffleArray(allBackgroundImages))
  }, [])

  // Preload všech obrázků
  useEffect(() => {
    const preloadImages = backgroundImages.map(src => {
      const img = new window.Image()
      img.src = src
      return img
    })

    Promise.all(
      preloadImages.map(img => 
        new Promise<string>((resolve) => {
          img.onload = () => resolve(img.src)
          img.onerror = () => resolve(img.src)
        })
      )
    ).then(srcs => setLoadedImages(srcs))
  }, [backgroundImages])

  // Přepínání obrázků každých 5 sekund
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % backgroundImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [backgroundImages.length])

  return (
    <div className="fixed inset-0 z-0 transition-opacity duration-1000 ease-in-out">
      {backgroundImages.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={index === 0}
            className="object-cover"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              filter: 'blur(5px) brightness(0.95)',
            }}
          />
        </div>
      ))}
      {/* Překryvný gradient pro lepší čitelnost textu */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,17,19,0.7), rgba(15,17,19,0.85))' }} />
    </div>
  )
}

