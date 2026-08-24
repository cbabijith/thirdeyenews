export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="h-9 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow overflow-hidden h-48 flex flex-row border border-gray-100 animate-pulse">
            <div className="w-48 h-full bg-gray-100 flex-shrink-0" />
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
              </div>
              <div className="h-8 w-24 bg-gray-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
