import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';

const data = [
  { day: 'Mon', consumption: 85, target: 100 },
  { day: 'Tue', consumption: 92, target: 100 },
  { day: 'Wed', consumption: 78, target: 100 },
  { day: 'Thu', consumption: 110, target: 100 },
  { day: 'Fri', consumption: 88, target: 100 },
  { day: 'Sat', consumption: 95, target: 100 },
  { day: 'Sun', consumption: 105, target: 100 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-gray-900">{payload[0].payload.day}</p>
        <p className="text-xs text-blue-600">
          Consumption: <span className="font-bold">{payload[0].value}L</span>
        </p>
        {payload[1] && (
          <p className="text-xs text-gray-500">
            Target: <span className="font-semibold">{payload[1].value}L</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CHART_HEIGHT = 280;

export default function FuelConsumptionChart() {
  return (
    <div className="w-full flex flex-col min-h-0 min-w-0">
      <div className="flex items-start justify-between mb-3 shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Fuel Consumption</h3>
          <p className="text-xs text-gray-500">Weekly usage versus the planned target</p>
        </div>
        <div className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">Target 100L</div>
      </div>
      <div className="w-full min-w-0 rounded-lg bg-gradient-to-br from-slate-50 to-blue-50/60 p-2" style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="6 4" label={{ value: 'Target', position: 'insideTopLeft', fill: '#92400e', fontSize: 11 }} />
            <XAxis
              dataKey="day"
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
              label={{ value: 'Liters', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="consumption"
              stroke="#2563eb"
              strokeWidth={2.8}
              dot={{ fill: '#2563eb', r: 4 }}
              activeDot={{ r: 6 }}
              name="Fuel Used"
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#d1d5db"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Target"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
