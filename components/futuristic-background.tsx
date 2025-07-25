'use client'

export default function FuturisticBackground() {
  return (
    <div className="futuristic-bg fixed inset-0 -z-10">
      {/* Grid de energía sutil */}
      <div className="energy-grid"></div>
      
      {/* Múltiples puntos luminosos distribuidos */}
      <div className="energy-dots">
        <div className="energy-dot dot-1"></div>
        <div className="energy-dot dot-2"></div>
        <div className="energy-dot dot-3"></div>
        <div className="energy-dot dot-4"></div>
        <div className="energy-dot dot-5"></div>
        <div className="energy-dot dot-6"></div>
        <div className="energy-dot dot-7"></div>
        <div className="energy-dot dot-8"></div>
      </div>
    </div>
  )
} 