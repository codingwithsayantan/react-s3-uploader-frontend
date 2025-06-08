import { useState } from "react";
import "./App.css";
import API from "../src/config/consts";
import { validateFile, getPresignedUrl, uploadToS3 } from "./utils/fileUpload";

function App() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(true);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setProgress(0);
    setMessage("");
    setStatus(true);
  };

  const handleUpload = async () => {
    setProgress(0);
    setMessage("");
    setStatus(true);

    const validation = validateFile(file, API.ALLOWED_TYPES);
    if (!validation.valid) {
      setStatus(false);
      setMessage(validation.message);
      return;
    }

    try {
      const {
        status: apiStatus,
        message: apiMessage,
        dataset,
      } = await getPresignedUrl(file, API);
      setStatus(apiStatus);

      if (apiStatus) {
        await uploadToS3(file, dataset.url, setProgress, setMessage);
      } else {
        setMessage(`Error: ${apiMessage}`);
      }
    } catch {
      setStatus(false);
      setMessage("An error occurred during upload.");
    }
  };

  return (
    <div className="app-container">
      <h2 className="app-title">Upload File to S3</h2>
      <input type="file" onChange={handleFileChange} className="file-input" />
      <br />
      <button onClick={handleUpload} className="upload-btn">
        Upload
      </button>
      <br />
      {progress > 0 && <p className="progress-text">Progress: {progress}%</p>}
      {message && (
        <p className={status ? "message-success" : "message-error"}>
          {message}
        </p>
      )}
      <footer className="app-footer">
        <br />
        For feedback or suggestions, contact:
        <a
          href="mailto:codingwithsayantan@gmail.com"
          style={{ color: "#007bff", textDecoration: "none" }}
        >
          &nbsp;codingwithsayantan@gmail.com
        </a>
      </footer>
    </div>
  );
}

export default App;
