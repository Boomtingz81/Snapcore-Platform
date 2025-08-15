import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  ClipboardList,
  BarChart3,
  Wrench,
  PlusCircle,
  CheckCircle2,
  Search,
  Filter,
  UserPlus,
  Activity,
  Settings,
  RefreshCcw,
} from "lucide-react";
import GaragePDFTools from "../components/GaragePDFTools";
import { supabase } from "../supabaseClient"; // ✅ Supabase connection

export default function GarageDashboard() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchJobs();
  }, []);

  // ✅ Fetch Jobs from Supabase
  const fetchJobs = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setError("❌ Failed to load jobs. Try again.");
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  // ✅ Mark Job as Completed
  const markJobDone = async (id) => {
    await supabase.from("jobs").update({ status: "Completed" }).eq("id", id);
    fetchJobs(); // Refresh jobs
  };

  // ✅ Filter Jobs by search term
  const filteredJobs = jobs.filter(
    (job) =>
      job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.reg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.technician.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Garage Dashboard – SnapCore AI</title>
      </Helmet>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-gray-950 text-white px-6 py-20"
      >
        {/* Page Title */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent drop-shadow-md">
            Garage Dashboard
          </h1>
          <div className="flex gap-3">
            <button
              onClick={fetchJobs}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition"
            >
              <RefreshCcw size={18} /> Refresh
            </button>
            <Link
              to="/create-job"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition"
            >
              <PlusCircle size={20} /> New Job
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <UserPlus size={18} /> Add Customer
          </Link>
          <Link className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <FileText size={18} /> View Reports
          </Link>
          <Link className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <Settings size={18} /> Manage Technicians
          </Link>
        </div>

        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<Users />} label="Active Customers" value="12" />
          <StatCard
            icon={<Wrench />}
            label="Jobs In Progress"
            value={jobs.filter((j) => j.status !== "Completed").length}
          />
          <StatCard icon={<BarChart3 />} label="Monthly Revenue" value="£4,250" />
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center bg-gray-900 px-3 py-2 rounded-lg w-full md:w-1/2">
            <Search className="text-gray-400 mr-2" size={18} />
            <input
              type="text"
              placeholder="Search by customer, reg, or technician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent w-full outline-none text-sm text-white"
            />
          </div>
          <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition">
            <Filter size={18} /> Filter
          </button>
        </div>

        {/* Jobs List */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ClipboardList size={20} /> Active Jobs
          </h2>

          {loading && <p className="text-gray-400">Loading jobs...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && filteredJobs.length === 0 && !error && (
            <p className="text-gray-400">No jobs found.</p>
          )}

          {!loading &&
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-800 rounded-lg border border-gray-700 mb-3"
              >
                <div>
                  <p className="text-lg font-semibold">{job.customer}</p>
                  <p className="text-sm text-gray-400">
                    {job.vehicle} | Reg: {job.reg}
                  </p>
                  <p className="text-sm text-gray-400">Technician: {job.technician}</p>
                </div>
                <div className="mt-2 md:mt-0 flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      job.status === "Completed"
                        ? "bg-green-600 text-white"
                        : job.status === "In Progress"
                        ? "bg-yellow-500 text-black"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {job.status}
                  </span>
                  {job.status !== "Completed" && (
                    <button
                      onClick={() => markJobDone(job.id)}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg text-sm"
                    >
                      <CheckCircle2 size={16} /> Mark Done
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* PDF Tools */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText size={20} /> Generate Documents
          </h2>
          <GaragePDFTools />
        </div>

        {/* Technician Leaderboard */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity size={20} /> Top Technicians
          </h2>
          <ul className="space-y-2 text-gray-300">
            <li>🔹 John Doe – 12 jobs completed</li>
            <li>🔹 Sarah Lee – 9 jobs completed</li>
            <li>🔹 Mike Adams – 6 jobs completed</li>
          </ul>
        </div>

        {/* Placeholder for Analytics */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 size={20} /> Garage Analytics (Coming Soon)
          </h2>
          <p className="text-gray-400">
            View trends for completed jobs, revenue, and technician performance here.
          </p>
        </div>
      </motion.section>
    </>
  );
}

// 🔹 Small Stat Card Component
function StatCard({ icon, label, value }) {
  return (
    <div className="p-5 bg-gray-900 rounded-xl shadow border border-gray-700 flex flex-col items-start hover:shadow-red-500/20 hover:scale-[1.02] transition">
      <div className="p-2 bg-gray-800 rounded-full mb-3">{icon}</div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
