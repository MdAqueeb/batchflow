export default function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className="flex justify-center items-center p-4">
      <div className={`animate-spin rounded-full border-4 border-blue-500 border-t-transparent ${sizes[size]}`} />
    </div>
  )
}
