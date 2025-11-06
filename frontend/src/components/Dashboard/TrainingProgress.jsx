import React, { useEffect, useState, useRef } from "react";

export default function TrainingProgress({ runId }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("pending");
  const [accuracy, setAccuracy] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${window.location.host}/ws/train-progress`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      // No message to send on open
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.run_id === runId) {
          if (typeof data.progress === "number") {
            setProgress(data.progress);
          }
          if (data.status) {
            setStatus(data.status);
          }
          if (data.accuracy !== undefined) {
            setAccuracy(data.accuracy);
          }
        }
      } catch {
        // ignore malformed messages
      }
    };

    wsRef.current.onerror = () => {
      // Optionally handle errors
    };

    wsRef.current.onclose = () => {
      // Optionally handle close
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [runId]);

  return (
    <div className="w-full max-w-md mx-auto my-6">
      <div className="text-center font-semibold mb-2">
        Training Status: {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
      <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
        <div
          className={`h-6 transition-all duration-500 ${
            status === "completed"
              ? "bg-green-600"
              : status === "failed"
              ? "bg-red-600"
              : "bg-blue-600"
          }`}
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
      {accuracy !== null && status === "completed" && (
        <div className="mt-2 text-center text-green-700 font-semibold">
          Accuracy: {(accuracy * 100).toFixed(2)}%
        </div>
      )}
    </div>
  );
}
