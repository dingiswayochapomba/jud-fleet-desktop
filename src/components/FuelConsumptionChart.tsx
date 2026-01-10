import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

export default function FuelConsumptionChart() {
  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Fuel Consumption</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
            label={{ value: 'Liters', angle: -90, position: 'insideLeft' }}
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
            strokeWidth={2.5}
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
  );
}
