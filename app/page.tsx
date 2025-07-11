import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Image from 'next/image'

export default function HomePage() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) redirect('/login')
  
  return (
    <main className="flex flex-col items-center justify-center min-h-screen europbots-gradient">
      <div className="europbots-card p-12 flex flex-col items-center gap-8 max-w-2xl w-full mx-4 mt-24">
        <Image
          src="/images/logo-europbots.svg"
          alt="EUROPBOTS Logo"
          width={250}
          height={100}
          className="h-20 w-auto"
        />
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-europbots-primary font-syncopate uppercase tracking-wide">
            Bienvenue sur <span className="text-europbots-secondary">EUROPBOTS</span>
          </h1>
          <p className="text-xl text-europbots-gray font-red-hat leading-relaxed max-w-lg">
            Découvrez notre gamme de robots innovants et nos solutions d'automatisation pour tous les secteurs d'activité.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button className="europbots-button px-8 py-3 rounded-lg font-bold font-red-hat hover:bg-europbots-secondary/90 transition-all duration-200 transform hover:scale-105">
            Explorer nos robots
          </button>
          <button className="border-2 border-europbots-secondary text-europbots-secondary px-8 py-3 rounded-lg font-bold font-red-hat hover:bg-europbots-secondary hover:text-europbots-primary transition-all duration-200">
            Nous contacter
          </button>
        </div>
      </div>
    </main>
  )
} 