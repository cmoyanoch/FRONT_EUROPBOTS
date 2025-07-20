'use client'

export default function FuturisticBackground() {
  return (
    <div className="futuristic-bg fixed inset-0 -z-10">
      {/* Grid de energía */}
      <div className="energy-grid"></div>
      
      {/* Líneas de energía */}
      <div className="energy-lines">
        <div className="energy-line"></div>
        <div className="energy-line"></div>
        <div className="energy-line"></div>
        <div className="energy-line"></div>
        <div className="energy-line"></div>
        <div className="energy-line"></div>
      </div>
      
      {/* Partículas de energía */}
      <div className="energy-particles">
        <div className="energy-particle"></div>
        <div className="energy-particle"></div>
        <div className="energy-particle"></div>
        <div className="energy-particle"></div>
        <div className="energy-particle"></div>
        <div className="energy-particle"></div>
      </div>
    </div>
  )
} 