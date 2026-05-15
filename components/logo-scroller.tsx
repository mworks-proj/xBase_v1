"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

interface Logo {
  src: string
  srcLight?: string // Optional light mode variant
  alt: string
  invert?: boolean // Use CSS invert filter for light mode
}

interface LogoScrollerProps {
  logos: Logo[]
  logoHeight?: number
  speed?: number
  gap?: number
  className?: string
}

export function LogoScroller({ logos, logoHeight = 40, speed = 20, gap = 38, className = "" }: LogoScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Small delay to ensure images are loaded before animation starts
    const timer = setTimeout(() => setIsReady(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Calculate animation duration based on speed
  // Lower speed value = faster animation
  const animationDuration = logos.length * speed

  return (
    <section
      className={`w-full py-16 md:py-24 lg:py-32 flex items-center justify-center ${className}`}
      aria-label="Partner logos"
    >
      <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div
          ref={scrollerRef}
          className={`flex w-max ${isReady ? "animate-scroll" : ""}`}
          style={{
            animationDuration: `${animationDuration}s`,
            gap: `${gap}px`,
          }}
        >
          {/* Render logos multiple times for seamless loop */}
          {[...Array(4)].map((_, setIndex) => (
            <div key={setIndex} className="flex shrink-0 items-center" style={{ gap: `${gap}px` }}>
              {logos.map((logo, logoIndex) => (
                <div
                  key={`${setIndex}-${logoIndex}`}
                  className="relative shrink-0 transition-all duration-300"
                  style={{ height: `${logoHeight}px` }}
                >
                  {/* Dark mode logo (default) */}
                  <Image
                    src={logo.src || "/placeholder.svg"}
                    alt={logo.alt}
                    height={logoHeight}
                    width={logoHeight * 3}
                    className={`h-full w-auto object-contain brightness-50 ${
                      logo.srcLight ? "dark:block hidden" : logo.invert ? "dark:invert-0 invert" : ""
                    }`}
                    style={{ height: `${logoHeight}px`, width: "auto" }}
                  />
                  {/* Light mode logo (if separate image provided) */}
                  {logo.srcLight && (
                    <Image
                      src={logo.srcLight}
                      alt={logo.alt}
                      height={logoHeight}
                      width={logoHeight * 3}
                      className="h-full w-auto object-contain brightness-50 dark:hidden block"
                      style={{ height: `${logoHeight}px`, width: "auto" }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-25%);
          }
        }

        .animate-scroll {
          animation: scroll linear infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-scroll {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
