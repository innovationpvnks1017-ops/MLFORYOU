import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-cyan-600 flex flex-col items-center justify-center text-white p-6">
      <motion.h1
        className="text-5xl font-extrabold mb-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        MLops Intelligent Analyzer
      </motion.h1>
      <motion.p
        className="text-xl mb-12 max-w-xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        Empower your machine learning workflows with seamless training, live
        progress visualization, and intelligent analytics.
      </motion.p>
      <motion.div
        className="flex space-x-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <Link
          to="/auth/login"
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition"
        >
          Login
        </Link>
        <Link
          to="/auth/register"
          className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
        >
          Sign Up
        </Link>
      </motion.div>
    </div>
  );
}
