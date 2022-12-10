import VideoQueue from '@server/models/VideoQueue';
// import axios from "axios";

export const GenerateKey = (length = 20) => {
  let result = '';
  const characters = '1st Comment';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const now = () => {
  return Date.now();
};

export const notifyServer = async (video: VideoQueue) => {
  if (video && video.chunkId && video.userId && video.videoLocation.includes('.mp4')) {
    console.log('Sending request to server with');
    console.log(video.userId, video.chunkId);
  }
};

export const getDurationFromSeconds = (rSeconds) => {
  return parseFloat(rSeconds);
};

export default {
  GenerateKey,
  now,
};
