export default function ResultsLoading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-40 bg-gray-200 dark:bg-white/10 rounded-lg" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-white/10 rounded-xl" />
      </div>

      {/* Hobby pills skeleton */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-20 bg-gray-200 dark:bg-white/10 rounded-full" />
        ))}
        <div className="h-6 w-16 bg-gray-200 dark:bg-white/10 rounded-full" />
      </div>

      {/* Map skeleton */}
      <div className="h-64 bg-gray-200 dark:bg-white/10 rounded-2xl mb-8" />

      {/* Loading message */}
      <div className="flex flex-col items-center justify-center py-8 mb-8">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-white/10" />
          <div className="absolute inset-0 rounded-full border-4 border-[#EE4D65] border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-medium text-[#876047] dark:text-[#D9BCA6]">
          Generating your personalized activities...
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          This may take a few seconds
        </p>
      </div>

      {/* Card skeletons */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-5"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-200 dark:bg-white/10 rounded-full" />
                <div className="h-5 w-48 bg-gray-200 dark:bg-white/10 rounded-lg" />
              </div>
              <div className="h-6 w-14 bg-gray-200 dark:bg-white/10 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-white/10 rounded" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded" />
            </div>
            <div className="h-4 w-2/3 bg-gray-100 dark:bg-white/5 rounded mt-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
