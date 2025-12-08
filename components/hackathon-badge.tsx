export function HackathonBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5  text-xs font-medium">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full  opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span className="text-green-500">Build on Xahau 2026</span>
    </div>
  )
}
