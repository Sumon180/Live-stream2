import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function UploadPage() {
  const [video, setVideo] = useState({ preview: "", data: "" });
  const [state, setState] = useState();
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    let formData = new FormData();
    formData.append("video", video.data);
    formData.append("dzuuid", Math.random() + "");
    await axios.post("http://127.0.0.1:5000/upload", formData).then((res) => {
      // then print response status
      console.log(res.data);
    });

    setTimeout(() => navigate("/"), 500);
  };

  const handleFileChange = (e: any) => {
    const vid = {
      preview: URL.createObjectURL(e.target.files[0]),
      data: e.target.files[0],
    };
    setVideo(vid);
  };
  return (
    <div className="App">
      <h1>Upload to server</h1>
      {video.preview && <img src={video.preview} width="320" height="240" />}
      <hr></hr>
      <form onSubmit={handleSubmit}>
        <input type="file" name="file" onChange={handleFileChange}></input>
        <button type="submit">Upload</button>
      </form>
      {/* {tatus && <h4>{status}</h4>} */}
      <Link to="/">
        <button type="button" value="">
          Go back
        </button>
      </Link>
    </div>
  );
}
