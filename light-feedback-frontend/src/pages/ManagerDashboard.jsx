import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar";

export default function ManagerDashboard() {
  const { state } = useLocation();
  const username = state?.username;
  const [summary, setSummary] = useState(null);

  const [feedbackList, setFeedbackList] = useState([]);
  const [form, setForm] = useState({
    employee_username: "",
    strengths: "",
    improvements: "",
    sentiment: "positive",
    anonymous: false,
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!username) return;
    fetch(`http://localhost:8000/feedback/${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFeedbackList(data);
      })
      .catch(console.error);
  }, [username]);

  useEffect(() => {
    if (!username) return;
    fetch(`http://localhost:8000/dashboard/manager/${username}`)
      .then((res) => res.json())
      .then(setSummary)
      .catch(console.error);
  }, [username]);

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:8000/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        manager_username: username,
        ...form,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setFeedbackList((prev) => [
        ...prev,
        {
          id: data.feedback_id,
          ...form,
          to: form.employee_username,
          acknowledged: false,
          timestamp: new Date().toISOString(),
        },
      ]);
      setForm({
        employee_username: "",
        strengths: "",
        improvements: "",
        sentiment: "positive",
        anonymous: false,
      });
    } else {
      alert(data.detail || "Submission failed");
    }
  };

  const startEditing = (fb) => {
    setEditingId(fb.id);
    setEditForm({
      employee_username: fb.to,
      strengths: fb.strengths,
      improvements: fb.improvements,
      sentiment: fb.sentiment,
      anonymous: fb.anonymous || false,
    });
  };

  const handleUpdate = async (feedbackId) => {
    const res = await fetch(`http://localhost:8000/feedback/${feedbackId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        manager_username: username,
        ...editForm,
      }),
    });

    if (res.ok) {
      setFeedbackList((prev) =>
        prev.map((f) =>
          f.id === feedbackId ? { ...f, to: editForm.employee_username, ...editForm } : f
        )
      );
      setEditingId(null);
    } else {
      alert("Update failed");
    }
  };

  return (
    <>
      <Navbar username={username} role="manager" />
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">Manager Dashboard</h1>

          {summary && (
            <div className="bg-white p-4 mb-6 rounded shadow-md border">
              <h2 className="text-lg font-semibold mb-2 text-blue-700">Team Overview</h2>
              <p className="text-sm"><strong>Total Feedbacks:</strong> {summary.total_feedbacks}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <p className="text-green-600">✅ Positive: {summary.sentiment_counts.positive || 0}</p>
                <p className="text-gray-600">➖ Neutral: {summary.sentiment_counts.neutral || 0}</p>
                <p className="text-red-600">❌ Negative: {summary.sentiment_counts.negative || 0}</p>
              </div>
            </div>
          )}

          {/* Feedback Form */}
          <div className="bg-white rounded-lg shadow-md p-4 max-w-md mx-auto mb-6 border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Submit Feedback</h2>

            <input
              type="text"
              placeholder="Employee Username"
              className="w-full p-2 border rounded mb-2 text-sm"
              value={form.employee_username}
              onChange={(e) => setForm({ ...form, employee_username: e.target.value })}
            />
            <textarea
              placeholder="Strengths"
              className="w-full p-2 border rounded mb-2 text-sm"
              rows={2}
              value={form.strengths}
              onChange={(e) => setForm({ ...form, strengths: e.target.value })}
            />
            <textarea
              placeholder="Improvements"
              className="w-full p-2 border rounded mb-2 text-sm"
              rows={2}
              value={form.improvements}
              onChange={(e) => setForm({ ...form, improvements: e.target.value })}
            />
            <select
              className="w-full p-2 border rounded mb-3 text-sm"
              value={form.sentiment}
              onChange={(e) => setForm({ ...form, sentiment: e.target.value })}
            >
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
            <label className="flex items-center text-sm gap-2 mb-3">
              <input
                type="checkbox"
                checked={form.anonymous}
                onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
              />
              Submit Anonymously
            </label>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded text-sm"
            >
              Submit Feedback
            </button>
          </div>

          {/* Feedback Cards */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">Previous Feedback</h2>
            {feedbackList.length === 0 ? (
              <p className="text-center text-gray-500">No feedback submitted yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {feedbackList.map((fb) => (
                  <div
                    key={fb.id}
                    className={`p-3 rounded shadow-sm bg-white border-l-4 text-sm ${
                      fb.sentiment === "positive"
                        ? "border-green-500"
                        : fb.sentiment === "neutral"
                        ? "border-gray-400"
                        : "border-red-500"
                    }`}
                  >
                    {editingId === fb.id ? (
                      <>
                        <input
                          className="w-full p-1 mb-1 border rounded text-sm"
                          value={editForm.employee_username}
                          onChange={(e) =>
                            setEditForm({ ...editForm, employee_username: e.target.value })
                          }
                        />
                        <textarea
                          className="w-full p-1 mb-1 border rounded text-sm"
                          rows={1}
                          value={editForm.strengths}
                          onChange={(e) =>
                            setEditForm({ ...editForm, strengths: e.target.value })
                          }
                        />
                        <textarea
                          className="w-full p-1 mb-1 border rounded text-sm"
                          rows={1}
                          value={editForm.improvements}
                          onChange={(e) =>
                            setEditForm({ ...editForm, improvements: e.target.value })
                          }
                        />
                        <select
                          className="w-full p-1 mb-2 border rounded text-sm"
                          value={editForm.sentiment}
                          onChange={(e) =>
                            setEditForm({ ...editForm, sentiment: e.target.value })
                          }
                        >
                          <option value="positive">Positive</option>
                          <option value="neutral">Neutral</option>
                          <option value="negative">Negative</option>
                        </select>
                        <label className="flex items-center text-xs gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={editForm.anonymous}
                            onChange={(e) =>
                              setEditForm({ ...editForm, anonymous: e.target.checked })
                            }
                          />
                          Anonymous
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(fb.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p><strong>To:</strong> {fb.to}</p>
                        <p><strong>Strengths:</strong> {fb.strengths}</p>
                        <p><strong>Improvements:</strong> {fb.improvements}</p>
                        <p><strong>Sentiment:</strong> {fb.sentiment}</p>
                        <p><strong>Acknowledged:</strong> {fb.acknowledged ? "✅ Yes" : "❌ No"}</p>
                        <p><strong>Anonymous:</strong> {fb.anonymous ? "🙈 Yes" : "🙉 No"}</p>
                        {fb.employee_comment && (
                          <p>
                            <strong>Comment:</strong>{" "}
                            <span className="italic text-gray-700">{fb.employee_comment}</span>
                          </p>
                        )}


                        <button
                          onClick={() => startEditing(fb)}
                          className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
