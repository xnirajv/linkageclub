'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils/cn';

interface ChartProps {
  data: any[];
  className?: string;
  height?: number;
  width?: number | string;
}

// Line Chart
interface LineChartProps extends ChartProps {
  lines: Array<{
    dataKey: string;
    stroke: string;
    name?: string;
  }>;
  xAxisDataKey: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

const CustomLineChart = ({
  data,
  lines,
  xAxisDataKey,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  height = 300,
  width = '100%',
  className,
}: LineChartProps) => {
  return (
    <ResponsiveContainer width={width} height={height} className={className}>
      <LineChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#CDC8C0" />}
        <XAxis dataKey={xAxisDataKey} stroke="#6E6B66" />
        <YAxis stroke="#6E6B66" />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {lines.map((line, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke}
            name={line.name || line.dataKey}
            strokeWidth={2}
            dot={{ strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Bar Chart
interface BarChartProps extends ChartProps {
  bars: Array<{
    dataKey: string;
    fill: string;
    name?: string;
  }>;
  xAxisDataKey: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  layout?: 'horizontal' | 'vertical';
}

const CustomBarChart = ({
  data,
  bars,
  xAxisDataKey,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  layout = 'horizontal',
  height = 300,
  width = '100%',
  className,
}: BarChartProps) => {
  return (
    <ResponsiveContainer width={width} height={height} className={className}>
      <BarChart data={data} layout={layout}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#CDC8C0" />}
        <XAxis dataKey={xAxisDataKey} stroke="#6E6B66" />
        <YAxis stroke="#6E6B66" />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {bars.map((bar, index) => (
          <Bar
            key={index}
            dataKey={bar.dataKey}
            fill={bar.fill}
            name={bar.name || bar.dataKey}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

// Pie Chart
interface PieChartProps extends ChartProps {
  pieDataKey: string;
  nameKey: string;
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
}

const CustomPieChart = ({
  data,
  pieDataKey,
  nameKey,
  colors = ['#344A86', '#C2964B', '#407794', '#A3A3A3', '#4B4945'],
  innerRadius = 0,
  outerRadius = 80,
  showTooltip = true,
  showLegend = true,
  height = 300,
  width = '100%',
  className,
}: PieChartProps) => {
  return (
    <ResponsiveContainer width={width} height={height} className={className}>
      <PieChart>
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        <Pie
          data={data}
          dataKey={pieDataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

// Area Chart
interface AreaChartProps extends ChartProps {
  areas: Array<{
    dataKey: string;
    stroke: string;
    fill: string;
    name?: string;
  }>;
  xAxisDataKey: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
}

const CustomAreaChart = ({
  data,
  areas,
  xAxisDataKey,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  stacked = false,
  height = 300,
  width = '100%',
  className,
}: AreaChartProps) => {
  return (
    <ResponsiveContainer width={width} height={height} className={className}>
      <AreaChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#CDC8C0" />}
        <XAxis dataKey={xAxisDataKey} stroke="#6E6B66" />
        <YAxis stroke="#6E6B66" />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {areas.map((area, index) => (
          <Area
            key={index}
            type="monotone"
            dataKey={area.dataKey}
            stroke={area.stroke}
            fill={area.fill}
            name={area.name || area.dataKey}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Progress Chart (Circular)
interface ProgressChartProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  labelFormatter?: (value: number, max: number) => string;
  className?: string;
}

const ProgressChart = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = '#344A86',
  backgroundColor = '#CDC8C0',
  showLabel = true,
  labelFormatter = (val, max) => `${Math.round((val / max) * 100)}%`,
  className,
}: ProgressChartProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;

  return (
    <div className={cn('relative inline-flex', className)} style={{ width: size, height: size }}>
      <svg className="absolute -rotate-90" width={size} height={size}>
        <circle
          stroke={backgroundColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold">{labelFormatter(value, max)}</span>
        </div>
      )}
    </div>
  );
};

export {
  CustomLineChart as LineChart,
  CustomBarChart as BarChart,
  CustomPieChart as PieChart,
  CustomAreaChart as AreaChart,
  ProgressChart,
};
