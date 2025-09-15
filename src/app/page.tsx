import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dek-blue to-dek-navy flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dek-navy mb-2">DEK Innovations</h1>
          <p className="text-gray-600">Business Dashboard</p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/auth/signin"
            className="block w-full bg-dek-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-dek-navy transition-colors"
          >
            Sign In
          </Link>
          
          <p className="text-sm text-gray-500">
            Access your business dashboard and client portal
          </p>
        </div>
      </div>
    </div>
  )
}
