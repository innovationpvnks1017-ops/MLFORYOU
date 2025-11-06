import React, { useEffect, useState } from "react";
import axios from "../../api/api";

export default function RunManagement() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingRunId, setUpdatingRunId] = useState(null);
  const [deletingRunId, setDeletingRunId] = useState(null);

  const fetchRuns = () => {
    setLoading(true);
    axios
      .get("/admin/runs")
      .then((res) => {
        setRuns(res.data);
        setError("");
      })
      .catch(() => {
        setError("Failed to fetch training runs.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const updateStatus = async (runId, newStatus) => {
    setUpdatingRunId(runId);
    try {
      await axios.put(`/admin/runs/${runId}/status`, { status: newStatus });
      setRuns((prevRuns) =>
        prevRuns.map((run) => (run.id === runId ? { ...run, status: newStatus } : run))
      );
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdatingRunId(null);
    }
  };

  const deleteRun = async (runId) => {
    const confirmed = window.confirm("Are you sure you want to delete this training run?");
    if (!confirmed) return;
    setDeletingRunId(runId);
    try {
      await axios.delete(`/admin/runs/${runId}`);
      setRuns(runs.filter((r) => r.id !== runId));
    } catch {
      alert("Failed to delete training run.");
    } finally {
      setDeletingRunId(null);
    }
  };

  if (loading) {
    return <p>Loading training runs...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!runs.length) {
    return <p>No training runs found.</p>;
  }

  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-300 p-2">ID</th>
          <th className="border border-gray-300 p-2">User ID</th>
          <th className="border border-gray-300 p-2">Dataset ID</th>
          <th className="border border-gray-300 p-2">Status</th>
          <th className="border border-gray-300 p-2">Accuracy</th>
          <th className="border border-gray-300 p-2">Created At</th>
          <th className="border border-gray-300 p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {runs.map((run) => (
          <tr key={run.id} className="hover:bg-gray-100">
            <td className="border border-gray-300 p-2">{run.id}</td>
            <td className="border border-gray-300 p-2">{run.user_id}</td>
            <td className="border border-gray-300 p-2">{run.dataset_id ?? "N/A"}</td>
            <td className="border border-gray-300 p-2">
              <select
                value={run.status}
                onChange={(e) => updateStatus(run.id, e.target.value)}
                disabled={updatingRunId === run.id}
                aria-label={`Update status for run ${run.id}`}
                className="border rounded p-1"
              >
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </td>
            <td className="border border-gray-300 p-2">
              {run.accuracy !== null ? (run.accuracy * 100).toFixed(2) + "%" : "N/A"}
            </td>
            <td className="border border-gray-300 p-2">{new Date(run.created_at).toLocaleString()}</td>
            <td className="border border-gray-300 p-2 text-center">
              <button
                onClick={() => deleteRun(run.id)}
                disabled={deletingRunId === run.id}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                aria-label={`Delete training run ${run.id}`}
              >
                {deletingRunId === run.id ? "Deleting..." : "Delete"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
