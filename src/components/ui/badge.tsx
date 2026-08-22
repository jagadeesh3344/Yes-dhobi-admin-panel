import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps {
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "gray";
  children?: React.ReactNode;
}

function Badge({ className, variant = "default", children, ...props }: BadgeProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
        {
          "bg-blue-600 text-white": variant === "default",
          "bg-gray-100 text-gray-900": variant === "secondary",
          "bg-red-100 text-red-700": variant === "destructive",
          "bg-green-100 text-green-700": variant === "success",
          "bg-yellow-100 text-yellow-800": variant === "warning",
          "bg-blue-100 text-blue-700": variant === "info",
          "bg-gray-200 text-gray-700": variant === "gray",
          "text-gray-950 border border-gray-200": variant === "outline",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge }
