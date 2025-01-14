import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface RevenueChartsProps {
  forecastData: any[];
  achievedData: any[];
}

export const RevenueCharts = ({ forecastData, achievedData }: RevenueChartsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Revenue Forecast Chart */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Revenue Forecast</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achieved Revenue Chart */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Achieved Revenue</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={achievedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#1A1F2C" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};