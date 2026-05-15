import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #0f172a 50%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* X with Document Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              marginBottom: 20,
            }}
          >
            {/* Stylized X */}
            <svg
              width="200"
              height="200"
              viewBox="0 0 100 100"
              style={{ position: "relative" }}
            >
              {/* X shape */}
              <path
                d="M15 20 L45 55 L15 90"
                stroke="white"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M45 55 L75 20"
                stroke="white"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M45 55 L75 90"
                stroke="#2dd4bf"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Document icon */}
              <rect
                x="55"
                y="25"
                width="35"
                height="45"
                rx="3"
                stroke="white"
                strokeWidth="4"
                fill="none"
              />
              {/* Folded corner */}
              <path
                d="M78 25 L90 25 L90 37 L78 37 Z"
                fill="#2dd4bf"
              />
              {/* Document lines */}
              <line x1="62" y1="42" x2="83" y2="42" stroke="white" strokeWidth="3" />
              <line x1="62" y1="52" x2="78" y2="52" stroke="white" strokeWidth="3" />
              {/* Checkmark */}
              <path
                d="M65 60 L72 67 L85 50"
                stroke="#2dd4bf"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Brand Name */}
          <div
            style={{
              display: "flex",
              fontSize: 80,
              fontWeight: 700,
              letterSpacing: "-2px",
            }}
          >
            <span style={{ color: "#2dd4bf" }}>x</span>
            <span style={{ color: "white" }}>Tax</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              color: "#94a3b8",
              fontSize: 28,
              marginTop: 20,
              letterSpacing: "0.5px",
            }}
          >
            Professional Tax Services
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
