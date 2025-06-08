import API from "../config/consts";

// File validation function
export const validateFile = (file, allowedTypes) => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (!file) return { valid: false, message: "No file selected." };
  if (file.size > maxSize)
    return { valid: false, message: "File size exceeds 5MB limit." };
  if (!allowedTypes.includes(file.type))
    return { valid: false, message: "Invalid file type." };
  return { valid: true };
};

// Get presigned URL from server
export const getPresignedUrl = async (file) => {
  const URL = API.BASE_URL + API.GET_PRESIGNED_URL;
  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
    }),
  });
  return res.json();
};

// Upload file to S3 using presigned URL
export const uploadToS3 = (file, dataset, setProgress, setMessage) => {
  return new Promise((resolve, reject) => {
    const { url, fields } = dataset;

    const formData = new FormData();
    // Add all fields required by S3
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    // Append the actual file
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = (event.loaded / event.total) * 100;
        setProgress(percent.toFixed(2));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 204 || xhr.status === 200) {
        setMessage("Upload successful!");
        resolve();
      } else {
        setMessage("Upload failed.");
        reject();
      }
    };

    xhr.onerror = () => {
      setMessage("Upload failed.");
      reject();
    };

    xhr.send(formData);
  });
};
