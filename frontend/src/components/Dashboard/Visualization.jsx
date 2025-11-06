import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import axios from "../../api/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Visualization({ runId }) {
  const [data, setData] = useState(null);
  const [chartType, setChartType] = useState("line");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!runId) {
      return;
    }
    axios
      .get(`/train/status/${runId}`)
      .then((res) => {
        setData(res.data);
        setError("");
      })
      .catch(() => {
        setError("Failed to fetch training results.");
      });
  }, [runId]);

  if (!runId) {
    return <p>Select a training run to view visualization.</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!data) {
    return <p>Loading visualization...</p>;
  }

  // For demonstration, show accuracy as single bar or line
  const chartData = {
    labels: ["Accuracy"],
    datasets: [
      {
        label: "Model Accuracy",
        data: [data.accuracy ?? 0],
        backgroundColor: "rgba(37, 99, 235, 0.7)",
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Model Training Accuracy",
      },
    },
    scales: {
      y: {
        min: 0,
        max: 1,
        ticks: {
          callback: (value) => `${(value * 100).toFixed(0)}%`,
        },
      },
    },
  };

  return (
    <div className="max-w-md mx-auto my-6">
      <div className="mb-4 flex justify-center space-x-4">
        <button
          className={`px-4 py-2 rounded ${
            chartType === "line" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setChartType("line")}
          aria-pressed={chartType === "line"}
        >
          Line Chart
        </button>
        <button
          className={`px-4 py-2 rounded ${
            chartType === "bar" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setChartType("bar")}
          aria-pressed={chartType === "bar"}
        >
          Bar Chart
        </button>
      </div>
      {chartType === "line" ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
}
