import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar";

export default function EmployeeDashboard() {
  const { state } = useLocation();
  const username = state?.username;

  const [feedbackList, setFeedbackList] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [commentMap, setCommentMap] = useState({}); 

  useEffect(() => {
    if (!username) return;

    fetch(`http://localhost:8000/feedback/${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setFeedbackList(sorted);
        }
      })
      .catch(console.error);
  }, [username]);

  const acknowledgeFeedback = async (feedback_id) => {
    try {
      const res = await fetch(`http://localhost:8000/feedback/${feedback_id}/acknowledge`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error("Failed to acknowledge");

      setFeedbackList((prev) =>
        prev.map((f) =>
          f.id === feedback_id ? { ...f, acknowledged: true } : f
        )
      );
    } catch (err) {
      console.error(err);
      alert("Could not acknowledge feedback");
    }
  };

  const submitComment = async (feedback_id) => {
  const comment = commentMap[feedback_id];
  if (!comment) return;

  try {
    const res = await fetch(`http://localhost:8000/feedback/${feedback_id}/comment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });

    if (!res.ok) throw new Error("Failed to submit comment");

    setFeedbackList((prev) =>
      prev.map((fb) =>
        fb.id === feedback_id ? { ...fb, comment } : fb
      )
    );

    alert("Comment submitted!");
    setCommentMap((prev) => ({ ...prev, [feedback_id]: "" }));
  } catch (err) {
    console.error(err);
    alert("Could not submit comment");
  }
};


  const filteredFeedbacks = feedbackList.filter((fb) => {
    const matchesFilter =
      filter === "read"
        ? fb.acknowledged
        : filter === "unread"
        ? !fb.acknowledged
        : true;

    const matchesSearch = (fb.from || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <Navbar username={username} />
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-blue-600 text-center">
          Employee Dashboard - {username}
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-between mb-6 max-w-5xl mx-auto gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 font-semibold">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border rounded text-sm"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Search by manager name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded w-full md:w-64"
          />
        </div>

        {filteredFeedbacks.length === 0 ? (
          <p className="text-gray-600 text-center">No feedbacks match this filter.</p>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
  {filteredFeedbacks.map((fb) => (
    <div key={fb.id} className="relative pl-6 border-l-4 border-gray-300">
      <div className="absolute -left-2 top-2 w-4 h-4 rounded-full"
           style={{ backgroundColor: fb.sentiment === "positive" ? "green" : fb.sentiment === "neutral" ? "gray" : "red" }}>
      </div>
      <div className="bg-white p-4 rounded shadow-md">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 font-semibold">
            {new Date(fb.timestamp).toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {fb.acknowledged ? "✅ Read" : "❌ Unread"}
          </span>
        </div>

        <p className="mt-2 text-sm"><strong>From:</strong> {fb.from || "Anonymous"}</p>
        <p className="text-sm"><strong>Strengths:</strong> {fb.strengths}</p>
        <p className="text-sm"><strong>Improvements:</strong> {fb.improvements}</p>
        <p className="text-sm"><strong>Sentiment:</strong> {fb.sentiment}</p>
        {fb.comment && (
  <p className="text-sm mt-2 text-gray-700">
    <strong>Your Comment:</strong> {fb.comment}
  </p>
)}


        {!fb.acknowledged ? (
          <button
            className="mt-3 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
            onClick={() => acknowledgeFeedback(fb.id)}
          >
            Mark as Read
          </button>
        ) : (
          <>
            <textarea
              className="w-full p-2 mt-3 border rounded text-sm"
              placeholder="Add your comment..."
              rows={2}
              value={commentMap[fb.id] || ""}
              onChange={(e) =>
                setCommentMap((prev) => ({ ...prev, [fb.id]: e.target.value }))
              }
            />
            <button
              onClick={() => submitComment(fb.id)}
              className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 text-sm"
            >
              Submit Comment
            </button>
          </>
        )}
      </div>
    </div>
  ))}
</div>

        )}
      </div>
    </>
  );
}
