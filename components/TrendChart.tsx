
import React from 'react';

interface SessionData {
  date: string; // YYYY-MM
  rate: number;
  count: number;
}

interface Props {
  data: SessionData[];
}

const TrendChart: React.FC<Props> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <p>所选时间段内没有记录</p>
      </div>
    );
  }

  const width = 800;
  const height = 220;
  const paddingX = 60;
  const paddingY = 40;
  
  const barWidth = Math.min(80, (width - paddingX * 2) / (data.length || 1) * 0.7);
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const getX = (index: number) => {
    if (data.length === 1) return width / 2;
    return paddingX + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (rate: number) => height - paddingY - (rate / 100) * chartHeight;

  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
      <div className="min-w-[600px] relative pt-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Y-Axis Labels */}
          {[0, 50, 100].map((v) => (
            <g key={v}>
              <line 
                x1={paddingX} y1={getY(v)} x2={width - paddingX} y2={getY(v)} 
                stroke="#f1f5f9" strokeWidth="1" 
              />
              <text x={paddingX - 10} y={getY(v) + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-bold">
                {v}%
              </text>
            </g>
          ))}

          {/* Bars */}
          {data.map((s, i) => {
            const x = getX(i);
            const barHeight = (s.rate / 100) * chartHeight;
            const y = height - paddingY - barHeight;
            
            return (
              <g key={s.date} className="group cursor-help">
                {/* Background Shadow Bar */}
                <rect 
                  x={x - barWidth / 2} y={paddingY} 
                  width={barWidth} height={chartHeight} 
                  fill="#f8fafc" rx={barWidth / 4}
                />
                
                {/* Actual Data Bar */}
                <rect 
                  x={x - barWidth / 2} y={y} 
                  width={barWidth} height={barHeight} 
                  fill={s.rate > 80 ? "#10b981" : s.rate > 50 ? "#f59e0b" : "#ef4444"} 
                  rx={barWidth / 4}
                  className="transition-all duration-500 ease-out"
                >
                  <animate attributeName="height" from="0" to={barHeight} dur="0.8s" fill="freeze" />
                  <animate attributeName="y" from={height - paddingY} to={y} dur="0.8s" fill="freeze" />
                </rect>

                {/* Month Label (YYYY/MM) */}
                <text 
                  x={x} y={height - 15} 
                  textAnchor="middle" 
                  className="text-[10px] fill-slate-500 font-bold"
                >
                  {s.date.replace('-', '/')}
                </text>

                {/* Rate text above bar */}
                <text 
                  x={x} y={y - 8} 
                  textAnchor="middle" 
                  className="text-[10px] fill-slate-600 font-black opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {Math.round(s.rate)}%
                </text>

                <title>月份: {s.date}&#10;平均出勤率: {Math.round(s.rate)}%</title>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 text-center text-xs text-slate-400 font-medium">
        (图表展示月度出勤率百分比)
      </div>
    </div>
  );
};

export default TrendChart;
