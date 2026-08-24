export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="h-9 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-5 bg-gray-200 rounded" />
              <div className="h-6 w-40 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-24 bg-gray-100 rounded ml-7" />
          </div>
        ))}
      </div>
    </div>
  )
}
