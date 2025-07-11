import React from 'react'

export default function ContactPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen europbots-gradient-alt">
      <div className="bg-white/80 rounded-xl shadow-xl p-10 flex flex-col items-center gap-6 max-w-xl w-full mt-24">
        <h1 className="text-3xl font-bold text-europbots-dark text-center">Contact</h1>
        <p className="text-lg text-gray-700 text-center max-w-md">
          Contactez-nous pour discuter de vos besoins en automatisation et obtenir un devis personnalisé.
        </p>
      </div>
    </main>
  )
} 