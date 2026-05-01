import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-5xl font-bold text-gray-300">404</p>
      <p className="text-gray-500">Page not found.</p>
      <Link to="/" className="text-blue-600 hover:underline text-sm">Go home</Link>
    </div>
  )
}
