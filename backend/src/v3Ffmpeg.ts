import VideoQueue from "@server/models/VideoQueue";
import ffmpeg from 'fluent-ffmpeg';
ffmpeg.setFfmpegPath('../ffmpeg/ffmpeg');
import {notifyServer} from "@server/utils";

export const v3Convert = async (video: VideoQueue, res) => new Promise((resolve, reject) => {

  const destination = video.videoLocation.split('/').slice(0, -1).join('/')
  const filename = video.videoLocation.split('/').pop().split('.').shift();

  const supportedRes = {
    '240p': '426:-2',
    '4096p': '3840:-2',
    '2048p': '2048:-2',
    '1080p': '1920:-2',
    '720p': '1280:-2',
    '480p': '854:-2',
    '360p': '640:-2',
  };

  if(supportedRes[res] === undefined){
    console.log('Resolution not supported.', res);
    reject("Resolution not supported.");
    return;
  }

  const command = ffmpeg(video.videoLocation);
  command.addOptions([
    "-vcodec",
    "libx264",
    "-preset slow",
    "-filter:v",
    "scale="+supportedRes[res],
    "-crf",
    "26"
  ]);

  command.on('start', async function(commandLine) {
    console.log(`Transcoding video to ${res}, command: ${commandLine}`);
    video.convertStartTime = Math.floor(Date.now() / 1000);
    const r = res.replace('p', '');
    video[`res${r}`] = 2;
    video.convertStatus = 1;
    await video.save()
  })

  command.on('progress', function(progress) {
    console.log(`Processing: ${res} ${video.chunkId}`, (progress?.percent??0).toFixed(2));
  })

  command.on('end', async function() {
    console.log(`Transcoding finished for -> ${res} -> ` + video.chunkId);
    video.convertStartTime = Math.floor(Date.now() / 1000);
    const r = res.replace('p', '');
    video[`res${r}`] = 3;
    await video.save()
    await notifyServer(video);
    resolve(true);
  })

  command.on('error', async function(err) {
    console.log("Transcoding error for " + video.chunkId);
    console.log('An error occurred: ' + err.message);
    const r = res.replace('p', '');
    video[`res${r}`] = 4;
    await video.save()
    reject(err.message)
  })

  command.save(`${destination}/${filename}_${res}_converted.mp4`);
});

export const v3GenerateThumbnails = async (video: VideoQueue) => new Promise((resolve, reject) => {
  const destination = video.videoLocation.split('/').slice(0, -1).join('/')
  const thumbnails = [];
  const command = ffmpeg(video.videoLocation);

  command.addOptions([
    "-vframes",
    "1",
    "-f",
    "mjpeg"
  ]);

  command.on('start', () => console.log(`Starting to create thumbnails for ${video.chunkId}`));

  command.on('filenames', function(filenames) {
    for (const key in filenames) {
      if (Object.hasOwnProperty.call(filenames, key)) {
        const element = filenames[key];
        thumbnails.push(destination +'/'+ element)
      }
    }
  })

  command.on('error', function(err) {
    console.log(`An error occurred while making thumbnails for ${video.chunkId} ` + err.message);
    reject(err.message)
  })

  command.on('end', async function() {
    console.log('Thumbnails has been created.');
    console.table(thumbnails);
    video.thumbnails = thumbnails;
    await video.save()
    resolve(thumbnails);
  })

  command.screenshots({
    count: 5,
    filename: `%b.video_thumb_%i.jpeg`,
    folder: destination
  });

});
