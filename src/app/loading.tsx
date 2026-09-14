import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="gap-0">
            <CardContent className="flex items-center gap-4 px-4 py-4">
              <Skeleton className="size-11 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-40 rounded" />
        <Card className="gap-0">
          <CardContent className="space-y-4 px-3 py-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3 rounded" />
                  <Skeleton className="h-3 w-1/4 rounded" />
                </div>
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}