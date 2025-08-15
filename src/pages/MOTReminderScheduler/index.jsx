// src/pages/MOTReminderScheduler.jsx

import { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { CalendarClock, Lock, CheckCircle, Trash2 } from "lucide-react";
import { supabase } from "../supabaseClient";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function MOTReminderScheduler() {
  const tier = useMemo(() => localStorage.getItem("user-tier") || "lite", []);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    reg: "",
    customer: "",
    motDate: "",
  });

  useEffect(() => {
    if (ALLOWED_TIERS.includes(tier)) fetchReminders();
  }, [tier]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("mot_reminders")
        .select("*")
        .order("motDate", { ascending: true });

      if (error) throw error;
      const sorted = [...(data || [])].sort(
        (a, b) => new Date(a.motDate) - new Date(b.motDate)
      );
      setReminders(sorted);
    } catch (err) {
      console.error("Error fetching MOT reminders:", err.message);
      alert("Failed to fetch reminders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    const { reg, customer, motDate } = form;
    if (!reg.trim() || !motDate || !customer.trim())
      return alert("All fields are required.");

    try {
      const { error } = await supabase
        .from("mot_reminders")
        .insert([{ reg, customer, motDate }]);

      if (error) throw error;
      setForm({ reg: "", customer: "", motDate: "" });
      alert("Reminder added successfully.");
      fetchReminders();
    } catch (err) {
      console.error("Failed to add MOT reminder:", err.message);
      alert("Could not add reminder. Please check the fields and try again.");
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reminder?")) return;
    try {
      const { error } = await supabase
        .from("mot_reminders")
        .delete()
        .eq("id", id);

      if (error) throw error;
      alert("Reminder deleted.");
      fetchReminders();
    } catch (err) {
      console.error("Failed to delete reminder:", err.message);
      alert("Error deleting reminder. Try again.");
    }
  };

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center px-4">
          <Lock className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-sm">This page is only available to Pro, Garage, and Owner users.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>MOT Reminder Scheduler – SnapCore</title>
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <CalendarClock className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            <h1 className="text-3xl font-bold">MOT Reminder Scheduler</h1>
          </div>

          <form
            onSubmit={handleAddReminder}
            className="grid md:grid-cols-3 gap-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-6"
          >
            <input
              type="text"
              name="reg"
              value={form.reg}
              onChange={handleChange}
              placeholder="Vehicle Reg"
              className="p-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
              required
            />
            <input
              type="text"
              name="customer"
              value={form.customer}
              onChange={handleChange}
              placeholder="Customer Name"
              className="p-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
              required
            />
            <input
              type="date"
              name="motDate"
              value={form.motDate}
              onChange={handleChange}
              className="p-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
              required
            />
            <button
              type="submit"
              aria-label="Add MOT Reminder"
              className="md:col-span-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              <CheckCircle className="inline w-4 h-4 mr-2" />
              Add Reminder
            </button>
          </form>

          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl space-y-4">
            {loading ? (
              <p>Loading reminders...</p>
            ) : reminders.length === 0 ? (
              <p className="text-sm text-gray-500">No MOT reminders yet.</p>
            ) : (
              <ul className="space-y-3">
                {reminders.map((r) => (
                  <li
                    key={r.id}
                    className="flex justify-between items-center bg-white dark:bg-gray-900 p-3 rounded-lg shadow"
                  >
                    <div>
                      <p className="font-semibold text-blue-500">
                        {r.reg.toUpperCase()} – {r.customer}
                      </p>
                      <p className="text-sm text-gray-500">
                        MOT Due:{" "}
                        {r.motDate
                          ? new Date(r.motDate).toLocaleDateString("en-GB")
                          : "Unknown"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteReminder(r.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Delete Reminder"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}
