import React, { useEffect, useState } from "react";
import { 
  MessageSquare, 
  Star, 
  RefreshCw, 
  Clock,
  TrendingUp,
  FileSpreadsheet,
  Mail,
  Copy,
  Check
} from "lucide-react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

import StatsCard from "./StatsCard";
import FileUpload from "./FileUpload";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSentiment, setSelectedSentiment] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const analyticsResponse = await fetch(`${API_URL}/analytics/summary`);
      if (!analyticsResponse.ok) throw new Error("Failed to load analytics summary.");
      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData);

      const feedbacksResponse = await fetch(`${API_URL}/feedback/?limit=100`);
      if (!feedbacksResponse.ok) throw new Error("Failed to load feedback list.");
      const feedbacksData = await feedbacksResponse.json();
      setFeedbacks(feedbacksData);
    } catch (err) {
      setError(err.message || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  // Helper for flat pastel sentiment badges
  const getSentimentBadge = (sentiment) => {
    switch (sentiment) {
      case "Positive":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      case "Negative":
        return "bg-rose-50 text-rose-700 border border-rose-100";
      case "Neutral":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      default:
        return "bg-slate-50 text-slate-500 border border-slate-200";
    }
  };

  // Helper for flat pastel category badges (Violet main, supporting colors)
  const getCategoryBadge = (category) => {
    switch (category) {
      case "Bug":
        return "bg-rose-50 text-rose-700 border border-rose-100";
      case "Feature Request":
        return "bg-violet-50 text-violet-700 border border-violet-100";
      case "Billing":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "Customer Support":
        return "bg-sky-50 text-sky-700 border border-sky-100";
      default:
        return "bg-slate-50 text-slate-500 border border-slate-200";
    }
  };

  const filteredFeedbacks = feedbacks.filter(item => {
    const matchesStatus = filterStatus === "all" || item.status.toLowerCase() === filterStatus;
    const matchesSentiment = selectedSentiment === "all" || item.sentiment === selectedSentiment;
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesStatus && matchesSentiment && matchesCategory;
  });

  // Flat Pastel Dataset Configuration for Chart.js
  const sentimentChartData = {
    labels: analytics?.sentiment_distribution.map(d => d.sentiment) || [],
    datasets: [
      {
        data: analytics?.sentiment_distribution.map(d => d.count) || [],
        backgroundColor: [
          "rgba(16, 185, 129, 0.45)", // Emerald Pastel
          "rgba(245, 158, 11, 0.45)", // Amber Pastel
          "rgba(244, 63, 94, 0.45)",  // Rose Pastel
          "rgba(148, 163, 184, 0.45)" // Slate Pastel
        ].slice(0, analytics?.sentiment_distribution.length),
        borderColor: [
          "rgba(16, 185, 129, 0.9)",
          "rgba(245, 158, 11, 0.9)",
          "rgba(244, 63, 94, 0.9)",
          "rgba(148, 163, 184, 0.9)"
        ].slice(0, analytics?.sentiment_distribution.length),
        borderWidth: 1.5,
      }
    ]
  };

  const categoryChartData = {
    labels: analytics?.category_distribution.map(d => d.category) || [],
    datasets: [
      {
        label: "Feedback Count",
        data: analytics?.category_distribution.map(d => d.count) || [],
        backgroundColor: "rgba(167, 139, 250, 0.45)", // Violet Pastel
        borderColor: "rgba(167, 139, 250, 0.9)",
        borderWidth: 1.5,
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#475569",
          font: { family: "Inter", size: 11, weight: "500" }
        }
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#475569", font: { family: "Inter", size: 10 } }
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: { color: "#475569", font: { family: "Inter", size: 10 }, stepSize: 1 }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
            Feedback Intelligence Dashboard
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Analyze customer reviews, extract sentiments, and draft support replies using Gemini 2.5.
          </p>
        </div>
        <button
          onClick={triggerRefresh}
          className="flex items-center gap-2 self-start px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-none text-xs font-bold transition duration-150 shadow-none"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {/* Metrics Section (Strictly Flat) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Feedback"
          value={analytics?.total_feedback ?? 0}
          icon={<MessageSquare size={18} />}
          description="Total uploads"
          badgeColor="bg-violet-50 text-violet-600 border-violet-100"
        />
        <StatsCard
          title="Average Rating"
          value={analytics?.average_rating ? `${analytics.average_rating.toFixed(1)} / 5.0` : "N/A"}
          icon={<Star size={18} />}
          description="Average rating score"
          badgeColor="bg-violet-50 text-violet-600 border-violet-100"
        />
        <StatsCard
          title="Analyzed"
          value={analytics?.processed_feedback ?? 0}
          icon={<TrendingUp size={18} />}
          description="Processed by AI"
          badgeColor="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <StatsCard
          title="Pending Queue"
          value={analytics?.pending_feedback ?? 0}
          icon={<Clock size={18} />}
          description="Awaiting processing"
          badgeColor="bg-slate-50 text-slate-600 border-slate-200"
        />
      </div>

      {/* Ingest Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-none">
        <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileSpreadsheet className="text-violet-600" size={16} />
          Ingest Customer Feedback
        </h2>
        <FileUpload onUploadSuccess={triggerRefresh} />
      </div>

      {/* Analytics Charts */}
      {analytics && analytics.processed_feedback > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col h-80 shadow-none">
            <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Sentiment Breakdown</h3>
            <div className="relative flex-1">
              <Doughnut data={sentimentChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col h-80 shadow-none">
            <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Category Distribution</h3>
            <div className="relative flex-1">
              <Bar data={categoryChartData} options={barChartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Feedback Feed Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-none">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Feedback Records Feed</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Showing up to 100 most recent records.</p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-600 font-semibold rounded-none px-2.5 py-1.5 focus:outline-none focus:border-violet-300"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-600 font-semibold rounded-none px-2.5 py-1.5 focus:outline-none focus:border-violet-300"
            >
              <option value="all">All Sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-600 font-semibold rounded-none px-2.5 py-1.5 focus:outline-none focus:border-violet-300"
            >
              <option value="all">All Categories</option>
              <option value="Bug">Bug</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Billing">Billing</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6 w-5/12">Feedback Text</th>
                <th className="py-3.5 px-6 text-center">Rating</th>
                <th className="py-3.5 px-6 text-center">Sentiment</th>
                <th className="py-3.5 px-6 text-center">Category</th>
                <th className="py-3.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-semibold">
                    No matching records found. Upload a CSV file above to begin.
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-slate-50/50 transition duration-150">
                      <td className="py-4 px-6 font-bold text-slate-700">
                        {item.customer_name || <span className="text-slate-400 font-normal italic">Anonymous</span>}
                      </td>
                      <td className="py-4 px-6 text-slate-600 break-words font-medium">
                        {item.feedback_text}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {item.rating ? (
                          <div className="flex items-center justify-center gap-0.5 text-amber-500 font-bold">
                            {item.rating} <Star size={12} className="fill-amber-500" />
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getSentimentBadge(item.sentiment)}`}>
                          {item.sentiment || "Pending"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getCategoryBadge(item.category)}`}>
                          {item.category || "Pending"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {item.status === "PROCESSED" && item.suggested_response ? (
                          <button
                            onClick={() => toggleRow(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-100 rounded-none text-[10px] font-bold transition duration-150 shadow-none"
                          >
                            <Mail size={11} />
                            {expandedRowId === item.id ? "Hide Draft" : "View Draft"}
                          </button>
                        ) : item.status === "PENDING" ? (
                          <span className="text-slate-400 font-medium">Analyzing...</span>
                        ) : (
                          <span className="text-rose-500 font-bold">Failed</span>
                        )}
                      </td>
                    </tr>

                    {/* Collapsible suggested response drawer */}
                    {expandedRowId === item.id && item.suggested_response && (
                      <tr className="bg-slate-50/40">
                        <td colSpan="6" className="p-4 border-t border-b border-slate-100">
                          <div className="bg-white border border-slate-200 rounded-xl p-4 ml-6 shadow-none">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                <Mail size={12} className="text-violet-600" />
                                Suggested AI Response Draft
                              </div>
                              <button
                                onClick={() => handleCopy(item.id, item.suggested_response)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold rounded-none border border-slate-200 transition duration-150"
                              >
                                {copiedId === item.id ? (
                                  <>
                                    <Check size={11} className="text-emerald-600" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy size={11} />
                                    Copy
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="text-slate-700 font-medium text-xs bg-slate-50/50 p-3 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
                              {item.suggested_response}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
