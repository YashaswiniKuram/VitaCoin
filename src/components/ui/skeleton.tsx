import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gradient-to-r from-muted/50 via-muted to-muted/50", className)}
      {...props}
    />
  )
}

export { Skeleton }
