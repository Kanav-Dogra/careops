"use client";

import { useEffect, useState } from "react";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    threshold: "",
    vendorEmail: "",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  async function addItem(e: any) {
    e.preventDefault();

    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Failed to add item");
      return;
    }

    setForm({
      name: "",
      quantity: "",
      threshold: "",
      vendorEmail: "",
    });

    fetchItems();
  }

  async function updateQuantity(id: string, quantity: number) {
    await fetch(`/api/inventory/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });

    fetchItems();
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;

    await fetch(`/api/inventory/${id}`, {
      method: "DELETE",
    });

    fetchItems();
  }

  if (loading) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Loading Inventory...</h1>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10">
      <h1 className="text-3xl font-bold">Inventory Management</h1>

      <form
        onSubmit={addItem}
        className="bg-white p-6 rounded-xl shadow space-y-4 w-96"
      >
        <input
          placeholder="Item Name"
          className="w-full border p-2 rounded"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          required
        />

        <input
          type="number"
          placeholder="Quantity"
          className="w-full border p-2 rounded"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.value })
          }
          required
        />

        <input
          type="number"
          placeholder="Threshold"
          className="w-full border p-2 rounded"
          value={form.threshold}
          onChange={(e) =>
            setForm({ ...form, threshold: e.target.value })
          }
          required
        />

        <input
          type="email"
          placeholder="Vendor Email"
          className="w-full border p-2 rounded"
          value={form.vendorEmail}
          onChange={(e) =>
            setForm({ ...form, vendorEmail: e.target.value })
          }
          required
        />

        <button className="bg-black text-white px-4 py-2 rounded w-full">
          Add Item
        </button>
      </form>

      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-6 rounded-xl shadow flex justify-between items-center ${
              item.quantity <= item.threshold
                ? "bg-red-100"
                : "bg-white"
            }`}
          >
            <div>
              <p className="font-semibold text-lg">
                {item.name}
              </p>
              <p className="text-sm text-gray-600">
                Quantity: {item.quantity}
              </p>
              <p className="text-sm text-gray-600">
                Vendor: {item.vendorEmail}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  updateQuantity(item.id, item.quantity - 1)
                }
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Use 1
              </button>

              <button
                onClick={() => deleteItem(item.id)}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
