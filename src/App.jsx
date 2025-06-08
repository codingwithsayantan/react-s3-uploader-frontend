import { useState } from "react";
import "./App.css";

import API from "./const/API";

function App() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(true);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    // Reset progress and message
    if (!file) return;

    // Construct the URL for the presigned request
    const URL = API.BASE_URL + API.GET_PRESIGNED_URL;

    // Make a GET request to the server to get the presigned URL
    const res = await fetch(
      `${URL}?fileName=${file.name}&contentType=${file.type}`
    );

    // {
    // "status": true,
    // "message": "Filename and ContentType are required",
    // "dataset": {
    //     "url": "",
    //     "key": ""
    //   }
    // }
    const { status, message, dataset } = await res.json();

    // Update the status
    setStatus(status);

    if (status) {
      // If the request was successful, proceed with the upload
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", dataset.url, true);
      xhr.setRequestHeader("Content-Type", file.type);

      // Set up progress event listener
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setProgress(percent.toFixed(2));
        }
      };

      // Set up the onload and onerror event listeners
      xhr.onload = () => {
        if (xhr.status === 200) {
          setMessage("Upload successful!");
        } else {
          setMessage("Upload failed.");
        }
      };

      // Set up error handling
      xhr.onerror = () => setMessage("Upload failed.");

      // Send the file to the presigned URL
      xhr.send(file);
    } else {
      setMessage(`Error: ${message}`);
    }
  };

  return (
    <div className="app-container">
      <h2 className="app-title">Upload File to S3</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="file-input"
      />
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
    </div>
  );
}

export default App;
