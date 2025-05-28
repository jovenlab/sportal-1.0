"use client";

import React, { useState } from "react";
import { FaCommentDots, FaTimes } from "react-icons/fa";

const FeedbackComponent = () => {
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });
      const data = await res.json();
      console.log("✅ Feedback submitted:", data);
      setFeedback("");
      setOpen(false);
    } catch (err) {
      console.error("❌ Feedback error:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open feedback form"
        className="w-14 h-14 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
      >
        <FaCommentDots size={24} />
      </button>

      {open && (
        <div className="absolute bottom-20 right-0 w-80 bg-white p-4 rounded-xl shadow-lg animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Send Feedback</h2>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close feedback form"
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write your feedback here..."
              required
              className="w-full p-2 border border-gray-300 rounded-md resize-none h-24 text-sm focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={sending}
              className={`w-full py-2 px-4 rounded-md text-white transition ${
                sending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {sending ? "Sending..." : "Send Feedback"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FeedbackComponent;
