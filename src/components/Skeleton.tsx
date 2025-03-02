interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return <div className={`animate-pulse bg-white/10 rounded ${className}`} />;
}

export function TasksSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white/5 rounded-lg overflow-hidden">
          <div className="px-4 py-2 border-b border-white/10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="divide-y divide-white/10">
            {[1, 2, 3].map((j) => (
              <div
                key={j}
                className="flex items-center justify-between p-3 gap-3"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-4 flex-1" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
