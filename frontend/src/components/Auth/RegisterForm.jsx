import React, { useState } from "react";
import axios from "../../api/api";

export default function RegisterForm({ onRegisterSuccess }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return false;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await axios.post("/auth/register", { username, email, password });
      onRegisterSuccess(response.data);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data.detail || "Registration failed.");
      } else {
        setError("Failed to register. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <label className="block mb-2 font-semibold" htmlFor="username">
        Username
      </label>
      <input
        id="username"
        type="text"
        className="w-full p-2 border rounded mb-4"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
        autoComplete="username"
      />
      <label className="block mb-2 font-semibold" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        className="w-full p-2 border rounded mb-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        autoComplete="email"
      />
      <label className="block mb-2 font-semibold" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        className="w-full p-2 border rounded mb-6"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        autoComplete="new-password"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
      >
        {loading ? "Registering..." : "Sign Up"}
      </button>
    </form>
  );
}
