"use client";

import { useEffect, useState } from "react";

export default function IntakeFormBuilder() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [fields, setFields] = useState<any[]>([]);
  const [newField, setNewField] = useState({
    label: "",
    type: "text",
  });

  useEffect(() => {
    fetchForms();
  }, []);

  async function fetchForms() {
    try {
      const res = await fetch("/api/intake");
      const data = await res.json();
      setForms(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  function addField() {
    if (!newField.label) return;

    setFields([...fields, newField]);
    setNewField({ label: "", type: "text" });
  }

  async function saveForm() {
    if (!title || fields.length === 0) {
      alert("Please add title and at least one field.");
      return;
    }

    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        fields,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert("Failed to create form");
      return;
    }

    setTitle("");
    setFields([]);
    fetchForms();
  }

  if (loading) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10">
      <h1 className="text-3xl font-bold">Intake Form Builder</h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-4 max-w-lg">
        <input
          placeholder="Form Title"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex gap-2">
          <input
            placeholder="Field Label"
            className="border p-2 rounded flex-1"
            value={newField.label}
            onChange={(e) =>
              setNewField({ ...newField, label: e.target.value })
            }
          />

          <select
            className="border p-2 rounded"
            value={newField.type}
            onChange={(e) =>
              setNewField({ ...newField, type: e.target.value })
            }
          >
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="number">Number</option>
          </select>

          <button
            onClick={addField}
            className="bg-black text-white px-4 rounded"
          >
            Add
          </button>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={index} className="text-sm text-gray-600">
              {field.label} ({field.type})
            </div>
          ))}
        </div>

        <button
          onClick={saveForm}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Save Form
        </button>
      </div>

      <div className="space-y-4">
        {forms.map((form) => (
          <div key={form.id} className="bg-white p-4 rounded shadow">
            <p className="font-semibold">{form.title}</p>
            <p className="text-sm text-gray-500">
              Public Link: {process.env.NEXT_PUBLIC_APP_URL}/intake/{form.id}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
