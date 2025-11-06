import React, { useEffect, useState } from "react";
import axios from "../../api/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingUserId, setDeletingUserId] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    axios
      .get("/admin/users")
      .then((res) => {
        setUsers(res.data);
        setError("");
      })
      .catch(() => {
        setError("Failed to fetch users.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    setDeletingUserId(userId);
    try {
      await axios.delete(`/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
    } catch {
      alert("Failed to delete user.");
    } finally {
      setDeletingUserId(null);
    }
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!users.length) {
    return <p>No users found.</p>;
  }

  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-300 p-2">Username</th>
          <th className="border border-gray-300 p-2">Email</th>
          <th className="border border-gray-300 p-2">Admin</th>
          <th className="border border-gray-300 p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="hover:bg-gray-100">
            <td className="border border-gray-300 p-2">{user.username}</td>
            <td className="border border-gray-300 p-2">{user.email}</td>
            <td className="border border-gray-300 p-2 text-center">
              {user.is_admin ? "Yes" : "No"}
            </td>
            <td className="border border-gray-300 p-2 text-center">
              <button
                onClick={() => handleDelete(user.id)}
                disabled={deletingUserId === user.id}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                aria-label={`Delete user ${user.username}`}
              >
                {deletingUserId === user.id ? "Deleting..." : "Delete"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
