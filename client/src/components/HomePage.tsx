import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import videojs from "video.js";
import VideoJS from "../videos/Video";
import axios from "axios";

export interface IHomeProps {}

export default function HomePage(props: IHomeProps) {
  const [data, setData] = useState();
  const playerRef = React.useRef(null);

  const { id } = useParams();

  const loadData = async (id: string | undefined) => {
    await axios
      .get(`http://127.0.0.1:5000/playpage/${id}`)
      .then((res) => res.data)
      .then((res) => {
        setData(res.data.videoLocation);
        console.log(res.data);
      });
  };

  useEffect(() => {
    loadData("15");
  }, [id]);

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: data,
        type: "video/mp4",
      },
    ],
  };

  const handlePlayerReady = (player: any) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };

  return (
    <>
      <h1>Home Page</h1>
      <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
      <Link to="/UploadPage">
        <button className="btn btn-view">Upload</button>
      </Link>
    </>
  );
  return <div></div>;
}
