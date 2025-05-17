"use client";

import { useEffect, useRef, useState } from "react";

export function CreditScoreGauge({ score }: { score: number }) {
  const [rotation, setRotation] = useState(0);
  const [inView, setInView] = useState(false);
  const gaugeRef = useRef<HTMLDivElement>(null);

  // Clamp score between 0 and 1000
  const safeScore = Math.min(1000, Math.max(0, score));
  const targetRotation = (safeScore / 1000) * 180;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.3 },
    );

    if (gaugeRef.current) observer.observe(gaugeRef.current);

    return () => {
      if (gaugeRef.current) observer.unobserve(gaugeRef.current);
    };
  }, []);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setRotation(targetRotation), 200);
      return () => clearTimeout(timer);
    }
  }, [inView, targetRotation]);

  const getColor = () => {
    if (score < 300) return "#ef4444";
    if (score < 700) return "#eab308";
    return "#22c55e";
  };

  const color = getColor();

  return (
    <div ref={gaugeRef} className="relative w-48 h-24 overflow-hidden">
      {/* Gauge background */}
      <div className="absolute w-full h-full rounded-t-full overflow-hidden bg-gray-800/50 backdrop-blur-sm z-0" />

      {/* Needle */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10">
        <div
          className="relative w-1 h-20 bg-orange-500 rounded-t-full"
          style={{
            transformOrigin: "bottom center",
            transform: `rotate(${rotation - 90}deg)`,
            backgroundColor: `${color}`,
            transition: "transform 1s ease-out",
            boxShadow: "0 0 10px rgba(255, 255, 255, 0.7)",
          }}
        >
          <div
            className="absolute -left-1 top-0 w-3 h-3 rounded-full bg-orange-500 shadow-lg"
            style={{ backgroundColor: `${color}` }}
          />
        </div>
        <div className="w-1 h-2 rounded-full bg-yellow-500 shadow-lg -mt-2" />
      </div>

      {/* Score */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center z-20">
        <div className="text-2xl font-bold glow-text">{score}</div>
        <div className="text-xs text-muted-foreground">Credit Score</div>
      </div>

      {/* Markers */}
      <div className="absolute bottom-0 left-0 w-full h-full z-20">
        <div
          className="absolute bottom-0 w-1 h-2 bg-red-500 origin-bottom"
          style={{ left: "25%", transform: "rotate(-45deg)" }}
        />
        <div
          className="absolute bottom-0 w-1 h-2 bg-green-500 origin-bottom"
          style={{ left: "75%", transform: "rotate(45deg)" }}
        />
      </div>
    </div>
  );
}
