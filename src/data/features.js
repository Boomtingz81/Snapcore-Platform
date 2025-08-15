import {
  CheckCircle,
  Cpu,
  Database,
  LockKeyhole,
  Globe,
  Mic,
  BadgeCheck,
  Activity,
} from "lucide-react";

const features = [
  {
    title: "AI Diagnostics Engine",
    icon: Cpu,
    desc: "Real-time fault scanning with adaptive learning models and vehicle-specific logic.",
  },
  {
    title: "Garage Dashboard",
    icon: Database,
    desc: "Manage staff, jobs, and reports across bays with advanced insights and analytics.",
  },
  {
    title: "Secure SnapCore Cloud",
    icon: LockKeyhole,
    desc: "Military-grade encryption protects all diagnostics, history, and customer data.",
  },
  {
    title: "Global Language Support",
    icon: Globe,
    desc: "Auto-detects device language and supports multilingual AI technician guidance.",
  },
  {
    title: "Voice-Controlled SnapTech",
    icon: Mic,
    desc: "Chat with SnapTech using voice commands — scan, repair, and reset hands-free.",
  },
  {
    title: "Verified Repair Procedures",
    icon: BadgeCheck,
    desc: "Access manufacturer-approved reset steps, TSBs, recall data, and torque specs.",
  },
  {
    title: "SnapCore Predict",
    icon: Activity,
    desc: "Predictive fault detection engine trained on historic faults + SnapDNA learning.",
  },
  {
    title: "SnapTech Sentience Mode",
    icon: CheckCircle,
    desc: "Next-gen AI interaction with adaptive tone, role memory, and live diagnostics flow.",
  },
];

export default features;
