// File validation function
export const validateFile = (file, allowedTypes) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (!file) return { valid: false, message: "No file selected." };
  if (file.size > maxSize)
    return { valid: false, message: "File size exceeds 5MB limit." };
  if (!allowedTypes.includes(file.type))
    return { valid: false, message: "Invalid file type." };
  return { valid: true };
};

// Get presigned URL from server
export const getPresignedUrl = async (file, api) => {
  const URL = api.BASE_URL + api.GET_PRESIGNED_URL;
  const res = await fetch(
    `${URL}?fileName=${file.name}&contentType=${file.type}`
  );
  return res.json();
};

// Upload file to S3 using presigned URL
export const uploadToS3 = (file, url, setProgress, setMessage) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = (event.loaded / event.total) * 100;
        setProgress(percent.toFixed(2));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
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

    xhr.send(file);
  });
};
