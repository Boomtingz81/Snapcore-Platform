// src/pages/SnapSign.jsx
import { useRef, useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import SignatureCanvas from "react-signature-canvas";
import { FilePenLine, Lock } from "lucide-react";

export default function SnapSign() {
  const [tier, setTier] = useState("pro"); // Simulated user tier
  const [customerName, setCustomerName] = useState("");
  const [jobRef, setJobRef] = useState("");
  const [approved, setApproved] = useState(false);
  const [signatureURL, setSignatureURL] = useState(null);
  const sigRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("snapcore-signature");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSignatureURL(parsed.signature || null);
        setCustomerName(parsed.name || "");
        setJobRef(parsed.jobRef || "");
        setApproved(parsed.approved || false);
      } catch (err) {
        console.warn("Failed to parse saved signature:", err);
      }
    }
  }, []);

  const clearSignature = () => {
    sigRef.current?.clear();
    setSignatureURL(null);
    localStorage.removeItem("snapcore-signature");
  };

  const saveSignature = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      alert("⚠️ Please sign before saving.");
      return;
    }

    const url = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    const approvalData = {
      name: customerName,
      jobRef,
      approved,
      signature: url,
      timestamp: new Date().toISOString(),
    };

    setSignatureURL(url);
    localStorage.setItem("snapcore-signature", JSON.stringify(approvalData));
    alert("✅ Signature saved successfully.");
  };

  if (!["pro", "garage"].includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">SnapSign is available for Pro and Garage users only.</p>
          <button
            onClick={() => (window.location.href = "/pricing")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Upgrade Now
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapSign – Job Signature & Approval</title>
        <meta name="description" content="Digitally sign off jobs and approvals securely using SnapSign." />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <FilePenLine className="h-8 w-8 text-green-600 dark:text-green-400" />
            <h1 className="text-3xl font-bold">SnapSign Approval Form</h1>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-4">
            <div>
              <label htmlFor="name" className="block font-semibold mb-1">Customer Name</label>
              <input
                id="name"
                type="text"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                placeholder="e.g. John Smith"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                aria-label="Customer Name"
              />
            </div>

            <div>
              <label htmlFor="jobRef" className="block font-semibold mb-1">Job Reference Number</label>
              <input
                id="jobRef"
                type="text"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                placeholder="e.g. JOB-20341"
                value={jobRef}
                onChange={(e) => setJobRef(e.target.value)}
                aria-label="Job Reference"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="approval"
                checked={approved}
                onChange={(e) => setApproved(e.target.checked)}
                aria-label="Approval Confirmation"
              />
              <label htmlFor="approval" className="font-medium text-sm">
                I confirm customer approval for this job
              </label>
            </div>

            <div>
              <label className="block font-semibold mb-2">Signature</label>
              <SignatureCanvas
                penColor="black"
                canvasProps={{
                  width: typeof window !== "undefined" ? Math.min(500, window.innerWidth - 40) : 500,
                  height: 180,
                  className: "bg-white dark:bg-gray-900 border border-gray-400 rounded-lg w-full"
                }}
                ref={sigRef}
              />
              <div className="mt-3 flex gap-3">
                <button
                  onClick={clearSignature}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Clear
                </button>
                <button
                  onClick={saveSignature}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Save Signature
                </button>
              </div>
            </div>

            {signatureURL && (
              <div className="mt-6 border-t pt-4">
                <h2 className="text-lg font-semibold mb-2">Saved Signature Preview:</h2>
                <img
                  src={signatureURL}
                  alt="Saved Signature"
                  className="border border-gray-300 rounded shadow-md bg-white"
                />
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}
