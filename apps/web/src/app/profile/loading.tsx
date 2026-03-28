export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
        <p className="text-sm text-text-muted font-medium animate-pulse">Loading profile...</p>
      </div>
    </div>
  )
}
