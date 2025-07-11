import React from 'react'

export default function CataloguePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen europbots-gradient-alt">
      <div className="bg-white/80 rounded-xl shadow-xl p-10 flex flex-col items-center gap-6 max-w-xl w-full mt-24">
        <h1 className="text-3xl font-bold text-europbots-dark text-center">Catalogue</h1>
        <p className="text-lg text-gray-700 text-center max-w-md">
          Explorez notre catalogue complet de robots et solutions d'automatisation.
        </p>
      </div>
    </main>
  )
} 