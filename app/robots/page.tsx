import React from 'react'

export default function RobotsPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen europbots-gradient">
      <div className="europbots-card p-12 flex flex-col items-center gap-8 max-w-2xl w-full mx-4 mt-24">
        <h1 className="text-4xl font-bold text-europbots-primary font-syncopate uppercase tracking-wide text-center">
          Nos Robots
        </h1>
        
        <p className="text-xl text-europbots-gray font-red-hat leading-relaxed text-center max-w-lg">
          Découvrez notre gamme complète de robots industriels et de service, conçus pour optimiser vos processus et améliorer votre productivité.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
          <div className="europbots-bg-primary-10 p-6 rounded-xl europbots-border-secondary-20 border">
            <h3 className="text-xl font-bold text-europbots-secondary font-red-hat mb-3">Robots Industriels</h3>
            <p className="text-europbots-gray">Automatisation des chaînes de production</p>
          </div>
          <div className="europbots-bg-primary-10 p-6 rounded-xl europbots-border-secondary-20 border">
            <h3 className="text-xl font-bold text-europbots-secondary font-red-hat mb-3">Robots de Service</h3>
            <p className="text-europbots-gray">Solutions pour l'accueil et l'assistance</p>
          </div>
        </div>
      </div>
    </main>
  )
} 