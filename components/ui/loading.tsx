"use client";

import { useState, useEffect } from "react";
import { Loader2, Bitcoin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  /**
   * The size of the loading indicator
   * @default "default"
   */
  size?: "sm" | "default" | "lg" | "xl";

  /**
   * The variant of the loading indicator
   * @default "spinner"
   */
  variant?: "spinner" | "pulse" | "bitcoin" | "dots";

  /**
   * Text to display below the loading indicator
   */
  text?: string;

  /**
   * Whether to show the loading indicator in a centered container
   * @default false
   */
  centered?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export function Loading({
  size = "default",
  variant = "spinner",
  text,
  centered = false,
  className,
}: LoadingProps) {
  const [dots, setDots] = useState(".");

  // Animate dots if variant is dots
  useEffect(() => {
    if (variant !== "dots") return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [variant]);

  // Size classes for the loading indicator
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  // Size classes for the container
  const containerSizeClasses = {
    sm: "gap-2",
    default: "gap-3",
    lg: "gap-4",
    xl: "gap-5",
  };

  // Text size classes
  const textSizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  // Render the appropriate loading indicator based on variant
  const renderLoadingIndicator = () => {
    switch (variant) {
      case "spinner":
        return (
          <Loader2
            className={cn("animate-spin text-primary", sizeClasses[size])}
          />
        );
      case "pulse":
        return (
          <div
            className={cn(
              "rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 animate-pulse",
              sizeClasses[size],
            )}
          />
        );
      case "bitcoin":
        return (
          <div className="relative">
            <Bitcoin className={cn("text-orange-500", sizeClasses[size])} />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-75 animate-shimmer" />
          </div>
        );
      case "dots":
        return (
          <div className={cn("font-bold text-primary", textSizeClasses[size])}>
            {text || "Loading"}
            {dots}
          </div>
        );
      default:
        return (
          <Loader2
            className={cn("animate-spin text-primary", sizeClasses[size])}
          />
        );
    }
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        containerSizeClasses[size],
        className,
      )}
    >
      {renderLoadingIndicator()}
      {text && variant !== "dots" && (
        <p className={cn("text-muted-foreground", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );

  // If centered, wrap in a centered container
  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[100px]">
        {content}
      </div>
    );
  }

  return content;
}
