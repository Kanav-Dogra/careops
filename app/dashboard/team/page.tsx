"use client";

import { useEffect, useState } from "react";

export default function TeamPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "Staff",
  });

  // 🔥 Load user + role from session
  async function fetchContext() {
    try {
      const res = await fetch("/api/business");
      const data = await res.json();

      if (!data?.success) {
        setError("Session expired. Please login again.");
        setLoading(false);
        return;
      }

      setRole(data.role);
    } catch (err) {
      console.error("Context fetch failed:", err);
      setError("Failed to load session.");
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch("/api/team");
      const data = await res.json();

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Team fetch error:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      await fetchContext();
      await fetchUsers();
    }
    init();
  }, []);

  async function addUser(e: any) {
    e.preventDefault();

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to add team member");
        return;
      }

      setForm({
        email: "",
        password: "",
        role: "Staff",
      });

      fetchUsers();
    } catch (err) {
      console.error("Add user failed:", err);
    }
  }

  async function deleteUser(id: string) {
    const confirmDelete = confirm(
      "Are you sure you want to remove this team member?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/team/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to delete user");
        return;
      }

      fetchUsers();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  // 🔐 Owner-only protection
  if (role === "Staff") {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold text-red-600">
          Access Denied — Owner Only
        </h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Loading Team...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-red-600 font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10">
      <h1 className="text-3xl font-bold">
        Team Management
      </h1>

      {/* ➕ Add Team Member */}
      <form
        onSubmit={addUser}
        className="bg-white p-6 rounded-xl shadow space-y-4 w-96"
      >
        <input
          type="email"
          placeholder="Team Member Email"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          required
        />

        <input
          type="password"
          placeholder="Temporary Password"
          className="w-full border p-2 rounded"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          required
        />

        <select
          className="w-full border p-2 rounded"
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="Staff">Staff</option>
          <option value="Owner">Owner</option>
        </select>

        <button className="bg-black text-white px-4 py-2 rounded w-full">
          Add Team Member
        </button>
      </form>

      {/* 👥 Team List */}
      <div className="space-y-6">
        {users.length === 0 && (
          <p className="text-gray-500">
            No team members yet.
          </p>
        )}

        {users.map((user: any) => (
          <div
            key={user.id}
            className="bg-white p-6 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {user.email}
              </p>
              <p className="text-sm text-gray-600">
                Role: {user.role}
              </p>
            </div>

            <button
              onClick={() => deleteUser(user.id)}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
