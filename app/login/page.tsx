import { LoginForm } from '@/components/auth/login-form'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center europbots-gradient py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/images/logo-europbots.svg"
            alt="EUROPBOTS Logo"
            width={200}
            height={80}
            className="h-16 w-auto mx-auto mb-8"
          />
          <h2 className="text-3xl font-bold text-europbots-text font-syncopate uppercase tracking-wide">
            Connexion
          </h2>
        </div>
        <div className="europbots-card p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
} 