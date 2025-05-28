"use client";

import React, { useEffect, useState } from "react";
import { FaCommentDots, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

const LIMIT = 3;
const RESET_TIME_MS = 8 * 60 * 60 * 1000; // 8 hours

const FeedbackComponent = () => {
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  // Check and reset submission limit on mount
  useEffect(() => {
    const storedCount = parseInt(
      localStorage.getItem("feedbackCount") || "0",
      10
    );
    const lastSubmitTime = parseInt(
      localStorage.getItem("feedbackTimestamp") || "0",
      10
    );
    const now = Date.now();

    if (now - lastSubmitTime > RESET_TIME_MS) {
      localStorage.setItem("feedbackCount", "0");
      localStorage.setItem("feedbackTimestamp", now.toString());
      setSubmissionCount(0);
      setHasReachedLimit(false);
    } else {
      setSubmissionCount(storedCount);
      setHasReachedLimit(storedCount >= LIMIT);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback.trim()) {
      toast.error("Please enter feedback before submitting.");
      return;
    }

    if (submissionCount >= LIMIT) {
      toast.error(
        "You’ve reached the maximum number of feedback submissions (3 in 8 hours)."
      );
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("❌ Feedback failed:", text);
        toast.error("Failed to send feedback. Please try again.");
        return;
      }

      const data = JSON.parse(text);
      console.log("✅ Feedback submitted:", data);
      toast.success("Thanks for your feedback!");

      const newCount = submissionCount + 1;
      localStorage.setItem("feedbackCount", newCount.toString());
      localStorage.setItem("feedbackTimestamp", Date.now().toString());
      setSubmissionCount(newCount);
      setHasReachedLimit(newCount >= LIMIT);
      setFeedback("");
      setOpen(false);
    } catch (err) {
      console.error("❌ Feedback exception:", err);
      toast.error("Something went wrong. Please try again.");
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
              disabled={sending || hasReachedLimit}
              className={`w-full py-2 px-4 rounded-md text-white transition ${
                sending || hasReachedLimit
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {hasReachedLimit
                ? "Limit Reached"
                : sending
                ? "Sending..."
                : "Send Feedback"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FeedbackComponent;
