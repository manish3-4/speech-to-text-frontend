import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuth } from './lib/AuthContext';
import { useLoading } from './lib/LoadingContext';

function App() {
  const [audio, setAudio] = useState(null);
  const [transcriptions, setTranscriptions] = useState([]);
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");
  const { loading, setLoading } = useLoading();

  // Fetch transcriptions on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${import.meta.env.VITE_BACKEND_URL}/transcriptions`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then((res) => setTranscriptions(res.data))
        .catch((err) => console.error(err));
    }
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "audio/mpeg" || file.type === "audio/wav")) {
      setAudio(file);
      setFileName(file.name); // Set the file name
      setError(null);
    } else {
      setError("Invalid file type. Please upload an MP3 or WAV file.");
    }
  };

  // Handle file upload
  const handleUpload = async (file) => {
    if (!file) {
      setError("No audio file selected or recorded.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("audio", file);

    const token = localStorage.getItem('token');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
        }
      );
      setTranscriptions([res.data, ...transcriptions]);
      setAudio(null);
      setAudioBlob(null);
    } catch (error) {
      console.error("Upload Error:", error);
      setError("Failed to upload and transcribe the audio.");
    }
    setFileName("");
    setLoading(false);
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        const recordedFile = new File([blob], "recorded_audio.wav", {
          type: "audio/wav",
        });
        setAudioBlob(recordedFile);
        stream.getTracks().forEach((track) => track.stop()); // Stop the microphone stream

        console.log("Recorded file:", recordedFile); // Log the recorded file

        // Automatically upload and transcribe the recorded file
        handleUpload(recordedFile);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError(
        "Failed to access microphone. Please ensure permissions are granted."
      );
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const MainContent = () => (
    <div className="min-h-screen flex flex-col bg-blue-300 p-4 relative">
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 md:absolute bg-red-500 text-white py-2 px-4 md:py-1 md:px-3 rounded text-base md:text-sm hover:bg-gray-600 transition shadow-md z-10"
      >
        Logout
      </button>
      
      <div className="flex-1 flex flex-row space-x-30 items-center justify-center">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-4 text-blue-800">
            Speech-to-Text App
          </h1>
          {fileName ? (
          <p className="mb-2 block w-full border p-2 rounded bg-gray-200">{fileName}</p>
        ) : (
          <input
            type="file"
            onChange={handleFileChange}
            className="mb-2 block w-full border p-2 rounded"
            accept=".mp3,.wav"
          />
        )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-center space-x-6 mt-6">
            <button
              onClick={handleUpload.bind(null, audio)}
              className="rounded-full w-36 justify-center bg-amber-600 text-white py-2 hover:bg-blue-600 transition"
              disabled={loading || (!audio && !audioBlob)}
            >
              {loading ? "Transcribing..." : "Upload"}
            </button>
                <div className=" flex justify-center gap-4">
                  {recording ? (
                    <button
                      onClick={stopRecording}
                      className="bg-red-500 text-white py-2 px-4 rounded-full hover:bg-red-600 transition"
                    >
                      Stop Recording
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-600 transition"
                    >
                      Start Recording
                    </button>
                  )}
                </div>
            </div>
        </div>
        <div className="h-50 overflow-y-scroll border rounded-lg border-none bg-green-200 w-full max-w-md">
          <div className="flex justify-between items-center p-4  container ">
            <h2 className="text-xl font-serif ">Text</h2>
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  await axios.delete(
                    `${import.meta.env.VITE_BACKEND_URL}/transcriptions`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    }
                  );
                  setTranscriptions([]);
                } catch (error) {
                  console.error("Error clearing history:", error);
                  setError("Failed to clear transcription history.");
                }
              }}
              className="bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600 transition"
              disabled={transcriptions.length === 0}
            >
              Clear History
            </button>
          </div>
          <ul className="-mt-4 p-4 space-y-2">
            {transcriptions.map((t, index) => (
              <li key={index} className="bg-white p-3 shadow rounded-lg border">
                {t.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainContent />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
