"use client"

import { useState, useEffect } from "react"

export function TypingCommand() {
  const command = "pnpm dlx xmerch create my-app"
  const [displayedText, setDisplayedText] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let index = 0
    const typingInterval = setInterval(() => {
      if (index <= command.length) {
        setDisplayedText(command.slice(0, index))
        index++
      } else {
        clearInterval(typingInterval)
      }
    }, 80)

    return () => clearInterval(typingInterval)
  }, [])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-muted/50 border border-border/50 font-mono text-sm backdrop-blur-sm">
      <span className="text-muted-foreground">$</span>
      <span className="text-foreground">
        {displayedText}
        <span
          className={`inline-block w-2 h-5 ml-0.5 bg-foreground align-middle transition-opacity ${
            showCursor ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>
    </div>
  )
}
