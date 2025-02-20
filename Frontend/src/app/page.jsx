"use client";
import { useState } from "react";
import axios from "axios";

function decodeBase64ToAscii(base64) {
    return atob(base64);
}

export default function Home() {
  const [role, setRole] = useState("Frontend Developer");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [history, setHistory] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);

  // Fetch interview question based on role
  const getQuestion = async () => {
    try {
      const res = await axios.post("/api/groq", { role });
      setQuestion(res.data.question);
      setFeedback("");
      setAnswer("");
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  };

  // Submit answer for evaluation
  const submitAnswer = async () => {
    if (!question || !answer) return;
    try {
      const res = await axios.post("/api/groq", { question, answer });
      setFeedback(res.data.feedback);
      setHistory([...history, { question, answer, feedback: res.data.feedback }]);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  // Upload PDF and generate questions from it
  const handlePdfUpload = async () => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const textData = e.target.result.split(",")[1]; // Extract the Base64 content
      const asciiString = decodeBase64ToAscii(textData);
      try {
        const res = await axios.post("/api/groq", { role, asciiString });
        setQuestion(res.data.question);
      } catch (error) {
        console.error("Error uploading PDF:", error);
      }
    };
    reader.readAsDataURL(pdfFile);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Interview Agent</h1>

      {/* PDF Upload */}
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setPdfFile(e.target.files[0])}
        className="mb-4"
      />
      <button
        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md mb-4"
        onClick={handlePdfUpload}
      >
        Upload PDF
      </button>

      {/* Role Selection */}
      <select className="p-2 border text-gray-900 rounded-md mb-4" value={role} onChange={(e) => setRole(e.target.value)}>
        <option>Frontend Developer</option>
        <option>Backend Developer</option>
        <option>Data Scientist</option>
        <option>DevOps Engineer</option>
        <option>Mobile Developer</option>
        <option>Fullstack Developer</option>
        <option>Software Engineer</option>
        <option>QA Engineer</option>
        <option>UI/UX Designer</option>
        <option>Product Manager</option>
        <option>Technical Support</option>
        <option>Security Engineer</option>
      </select>

      {/* Get Question Button */}
      <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md" onClick={getQuestion}>
        Get Interview Question
      </button>

      {/* Question & Answer Section */}
      {question && (
        <div className="mt-4 p-4 bg-white shadow-md rounded-md w-full max-w-md">
          <p className="text-lg font-semibold text-gray-900">{question}</p>
          <textarea
            className="w-full p-2 border text-gray-900 rounded-md mt-2"
            rows={3}
            placeholder="Your Answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button className="mt-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md" onClick={submitAnswer}>
            Submit Answer
          </button>
          {feedback && <p className="mt-2 text-green-700 font-semibold">{feedback}</p>}
        </div>
      )}

      {/* Interview History */}
      {history.length > 0 && (
        <div className="mt-6 w-full max-w-md bg-white p-4 shadow-md rounded-md">
          <h2 className="text-xl font-semibold text-gray-900">Interview History</h2>
          {history.map((item, index) => (
            <div key={index} className="border-b py-2">
              <p className="font-semibold text-gray-900">{item.question}</p>
              <p className="text-gray-900">{item.answer}</p>
              <p className="text-green-700 font-semibold">{item.feedback}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
