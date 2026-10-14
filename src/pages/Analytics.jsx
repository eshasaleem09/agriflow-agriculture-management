import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { crop: "Wheat", production: 2500 },
  { crop: "Rice", production: 3200 },
  { crop: "Corn", production: 1800 },
  { crop: "Cotton", production: 950 },
];

function Analytics() {
  return (
    <section>
      <h2>Crop Analytics</h2>
      <p>Compare production across different crops.</p>

      <article className="panel analytics-card">
        <h3>Production by Crop</h3>

        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis dataKey="crop" />

              <YAxis />

              <Tooltip formatter={(value) => `${value} kg`} />

              <Bar
                dataKey="production"
                fill="#398653"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}

export default Analytics;