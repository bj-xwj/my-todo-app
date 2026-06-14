export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-500 text-sm">加载中...</p>
      </div>
    </div>
  )
}
