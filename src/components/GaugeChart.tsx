import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';

interface GaugeChartProps {
  value: number; // 0 to 1.5 (or more) representing attainment percentage (e.g. 1.0 = 100%)
  min?: number;
  max?: number;
}

export default function GaugeChart({ value, min = 0, max = 1.5 }: GaugeChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clamp value for the needle
  const displayValue = Math.min(Math.max(value, min), max);
  
  // Calculate angle for the needle (-90 to 90 degrees)
  const percentage = (displayValue - min) / (max - min);
  const angle = (percentage * 180) - 90;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = width / 1.5;
    const radius = Math.min(width, height * 2) / 2 - 20;
    const innerRadius = radius * 0.7;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height - 20})`);

    // Define the arcs for different zones
    const arcData = [
      { label: "< 75%", start: 0, end: 0.75, color: "#ef4444" }, // Red
      { label: "75-90%", start: 0.75, end: 0.9, color: "#f97316" }, // Orange
      { label: "90-100%", start: 0.9, end: 1.0, color: "#eab308" }, // Yellow
      { label: "100-110%", start: 1.0, end: 1.1, color: "#84cc16" }, // Lime
      { label: "110-120%", start: 1.1, end: 1.2, color: "#22c55e" }, // Green
      { label: "> 120%", start: 1.2, end: 1.5, color: "#10b981" }, // Emerald
    ];

    const arcGenerator = d3.arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4);

    // Draw background arcs
    g.selectAll("path")
      .data(arcData)
      .enter()
      .append("path")
      .attr("d", (d) => arcGenerator({
        startAngle: (d.start / max) * Math.PI - Math.PI / 2,
        endAngle: (d.end / max) * Math.PI - Math.PI / 2
      }))
      .attr("fill", (d) => d.color)
      .attr("stroke", "#1a1a1a")
      .attr("stroke-width", 2)
      .style("opacity", 0.8);

    // Add labels for zones
    g.selectAll("text")
      .data(arcData)
      .enter()
      .append("text")
      .attr("transform", (d) => {
        const centroid = arcGenerator.centroid({
          startAngle: (d.start / max) * Math.PI - Math.PI / 2,
          endAngle: (d.end / max) * Math.PI - Math.PI / 2
        });
        return `translate(${centroid[0]}, ${centroid[1]})`;
      })
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("fill", "white")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .text(d => d.label);

  }, [max]);

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto aspect-[3/2] flex items-end justify-center overflow-hidden">
      <svg ref={svgRef} className="overflow-visible" />
      
      {/* Needle */}
      <motion.div
        className="absolute bottom-[20px] left-1/2 w-1 h-[70%] bg-white origin-bottom rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] z-10"
        initial={{ rotate: -90 }}
        animate={{ rotate: angle }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
        style={{ translateX: "-50%" }}
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
      </motion.div>
      
      {/* Center Pivot */}
      <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-6 h-6 bg-zinc-800 border-2 border-zinc-600 rounded-full z-20" />
      
      {/* Value Display */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center">
        <div className="text-3xl font-bold text-white tabular-nums">
          {(value * 100).toFixed(1)}%
        </div>
        <div className="text-xs text-zinc-400 uppercase tracking-widest font-medium">
          Atingimento
        </div>
      </div>
    </div>
  );
}
