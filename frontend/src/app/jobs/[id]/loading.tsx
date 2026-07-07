export default function Loading() {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="p-8 border-b border-zinc-200">
        <div className="flex items-start gap-5 mb-4">
          <div className="h-16 w-16 bg-zinc-200 rounded-xl hidden sm:block"></div>
          <div className="flex-1">
            <div className="h-8 bg-zinc-200 rounded-md w-3/4 mb-4"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-zinc-200 rounded-full w-24"></div>
              <div className="h-6 bg-zinc-200 rounded-full w-24"></div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <div className="h-5 bg-zinc-200 rounded w-32"></div>
          <div className="h-5 bg-zinc-200 rounded w-32"></div>
          <div className="h-5 bg-zinc-200 rounded w-32"></div>
        </div>
        <div className="flex gap-4 mt-8">
          <div className="h-12 bg-zinc-200 rounded-lg w-32"></div>
          <div className="h-12 bg-zinc-200 rounded-lg w-32"></div>
        </div>
      </div>
      <div className="p-8 space-y-8">
        <div>
          <div className="h-6 bg-zinc-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-zinc-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-zinc-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
        </div>
        <div>
          <div className="h-6 bg-zinc-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-zinc-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2"></div>
        </div>
      </div>
    </div>
  );
}
