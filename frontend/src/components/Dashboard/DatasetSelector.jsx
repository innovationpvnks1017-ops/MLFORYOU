import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../../api/api";

export default function DatasetSelector({ selectedDataset, onSelectDataset }) {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    axios
      .get("/datasets")
      .then((res) => {
        if (isMounted) {
          setDatasets(res.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load datasets.");
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <p>Loading datasets...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!datasets.length) {
    return <p>No datasets available.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {datasets.map((dataset) => (
        <motion.button
          key={dataset.id}
          onClick={() => onSelectDataset(dataset)}
          className={`p-4 rounded-lg shadow-md border transition-colors text-left ${
            selectedDataset?.id === dataset.id
              ? "bg-blue-600 text-white border-blue-700"
              : "bg-white text-gray-800 border-gray-300 hover:bg-blue-50"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-pressed={selectedDataset?.id === dataset.id}
        >
          <h3 className="text-lg font-semibold mb-1">{dataset.name}</h3>
          <p className="text-sm">{dataset.description}</p>
        </motion.button>
      ))}
    </div>
  );
}
