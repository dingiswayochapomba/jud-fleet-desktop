import {
  BarChart,
  Bar,
  Cell,
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

const CHART_HEIGHT = 280;

export default function VehicleStatusChart() {
  return (
    <div className="w-full flex flex-col min-h-0 min-w-0">
      <div className="flex items-start justify-between mb-3 shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Vehicle Status</h3>
          <p className="text-xs text-gray-500">Current allocation across the fleet</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Fleet view</div>
      </div>
      <div className="w-full min-w-0 rounded-lg bg-gradient-to-br from-slate-50 to-emerald-50/60 p-2" style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="status"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#6b7280' }}
              label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} isAnimationActive={true}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
