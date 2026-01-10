import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { status: 'Available', count: 35, fill: '#10b981' },
  { status: 'In Use', count: 8, fill: '#f59e0b' },
  { status: 'Maintenance', count: 4, fill: '#ef4444' },
  { status: 'Reserved', count: 1, fill: '#8b5cf6' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-gray-900">{payload[0].payload.status}</p>
        <p className="text-xs font-bold" style={{ color: payload[0].fill }}>
          Vehicles: <span>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function VehicleStatusChart() {
  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Vehicle Status</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="status"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
            label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            fill="#2563eb"
            radius={[8, 8, 0, 0]}
            isAnimationActive={true}
          >
            {data.map((entry, index) => (
              <Bar key={`bar-${index}`} dataKey="count" fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
