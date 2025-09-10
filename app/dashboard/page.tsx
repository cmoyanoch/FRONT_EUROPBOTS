"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter()

  // Redirigir /dashboard a /campaign
  useEffect(() => {
    router.replace('/campaign')
  }, [router])

  // Mostrar loading mientras redirige
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
}