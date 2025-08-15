// src/pages/SnapNotes.jsx

import { useState, useEffect } from "react";

import { Helmet } from "react-helmet";

import { motion } from "framer-motion";

import { StickyNote, Trash, Pencil, PlusCircle, Lock } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function SnapNotes() {

  const [tier] = useState("pro"); // Replace with useAuthContext() in real app

  const [notes, setNotes] = useState([]);

  const [filter, setFilter] = useState("");

  const [editingIdx, setEditingIdx] = useState(null);

  const [newNote, setNewNote] = useState({ jobRef: "", vehicle: "", text: "" });

  // Load saved notes on mount

  useEffect(() => {

    try {

      const saved = JSON.parse(localStorage.getItem("snap-notes"));

      if (Array.isArray(saved)) setNotes(saved);

    } catch (err) {

      console.error("❌ Failed to load notes:", err);

    }

  }, []);

  // Auto-save to localStorage

  useEffect(() => {

    localStorage.setItem("snap-notes", JSON.stringify(notes));

  }, [notes]);

  // Gate access by tier

  if (!ALLOWED_TIERS.includes(tier)) {

    return (

      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">

        <div className="text-center">

          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />

          <h1 className="text-2xl font-bold">Access Denied</h1>

          <p className="mt-2">SnapNotes is available for Pro, Garage, and Owner tiers only.</p>

        </div>

      </main>

    );

  }

  const addNote = () => {

    if (!newNote.text.trim()) return;

    const timestamp = new Date().toISOString();

    setNotes([{ ...newNote, timestamp }, ...notes]);

    setNewNote({ jobRef: "", vehicle: "", text: "" });

  };

  const deleteNote = (idx) => {

    if (window.confirm("Delete this note?")) {

      setNotes((prev) => prev.filter((_, i) => i !== idx));

    }

  };

  const updateNote = (idx) => {

    if (!notes[idx].text.trim()) return;

    setEditingIdx(null);

  };

  const filtered = notes.filter((note) => {

    const query = filter.toLowerCase();

    return (

      (note.jobRef || "").toLowerCase().includes(query) ||

      (note.vehicle || "").toLowerCase().includes(query) ||

      (note.text || "").toLowerCase().includes(query)

    );

  });

  return (

    <>

      <Helmet>

        <title>SnapNotes – Technician Notes</title>

        <meta name="description" content="Add and manage technician notes for SnapCore jobs and vehicles." />

      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.5 }}

          className="max-w-4xl mx-auto"

        >

          {/* Header */}

          <div className="flex items-center gap-3 mb-6">

            <StickyNote className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />

            <h1 className="text-3xl font-bold">SnapNotes</h1>

          </div>

          {/* Filter and Add Note */}

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6 space-y-4">

            <input

              type="text"

              placeholder="Search by job ref, vehicle, or content..."

              value={filter}

              onChange={(e) => setFilter(e.target.value)}

              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"

            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <input

                type="text"

                placeholder="Job Ref"

                value={newNote.jobRef}

                onChange={(e) => setNewNote({ ...newNote, jobRef: e.target.value })}

                className="p-2 rounded border bg-white dark:bg-gray-900"

              />

              <input

                type="text"

                placeholder="Vehicle"

                value={newNote.vehicle}

                onChange={(e) => setNewNote({ ...newNote, vehicle: e.target.value })}

                className="p-2 rounded border bg-white dark:bg-gray-900"

              />

              <button

                onClick={addNote}

                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"

              >

                <PlusCircle className="w-4 h-4" /> Add Note

              </button>

            </div>

            <textarea

              rows={3}

              placeholder="Note text"

              value={newNote.text}

              onChange={(e) => setNewNote({ ...newNote, text: e.target.value })}

              className="w-full p-3 rounded border bg-white dark:bg-gray-900"

            />

          </div>

          {/* Notes List */}

          <ul className="space-y-4">

            {filtered.map((note, idx) => (

              <li

                key={idx}

                className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-5 rounded-lg shadow"

              >

                <div className="flex justify-between items-start">

                  <div>

                    <div className="text-sm font-semibold text-blue-600">{note.jobRef || "No Ref"}</div>

                    <div className="text-xs text-gray-500">{new Date(note.timestamp).toLocaleString()}</div>

                    <div className="text-sm mt-1"><strong>Vehicle:</strong> {note.vehicle || "N/A"}</div>

                  </div>

                  <div className="flex gap-2">

                    <button onClick={() => deleteNote(idx)}>

                      <Trash className="text-red-600 hover:text-red-800 w-5 h-5" />

                    </button>

                    <button onClick={() => setEditingIdx(idx)}>

                      <Pencil className="text-blue-600 hover:text-blue-800 w-5 h-5" />

                    </button>

                  </div>

                </div>

                {editingIdx === idx ? (

                  <div className="mt-3 space-y-2">

                    <textarea

                      value={note.text}

                      onChange={(e) => {

                        const updated = [...notes];

                        updated[idx].text = e.target.value;

                        setNotes(updated);

                      }}

                      className="w-full p-2 border rounded bg-white dark:bg-gray-800"

                    />

                    <button

                      onClick={() => updateNote(idx)}

                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"

                    >

                      Save

                    </button>

                  </div>

                ) : (

                  <p className="mt-3 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">

                    {note.text}

                  </p>

                )}

              </li>

            ))}

          </ul>

        </motion.div>

      </main>

    </>

  );

}

