const API_URL = import.meta.env.VITE_API_URL;

// Trigger the full automation pipeline
export const triggerPipeline = async () => {
  const res = await fetch(`${API_URL}/trigger-pipeline`, { method: "POST" });
  return res.json();
};

// Fetch Suricata alerts
export const fetchAlerts = async () => {
  const res = await fetch(`${API_URL}/alerts`);
  return res.json();
};

// Fetch summary report
export const fetchSummaries = async () => {
  const res = await fetch(`${API_URL}/summaries`);
  return res.json();
};

// Fetch rule suggestions
export const fetchRules = async () => {
  const res = await fetch(`${API_URL}/rules`);
  return res.json();
};

