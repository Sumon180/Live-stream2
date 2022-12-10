import ffmpeg  from "fluent-ffmpeg";
const converter = (inputFile: string) => {
  const command = ffmpeg(inputFile);
  command.setFfmpegPath("/usr/bin/ffmpeg")
  command.setFfprobePath("/usr/bin/ffprobe")
  command.setFlvtoolPath('/usr/local/bin/flvtool2')
  command.renice(-20)
    .on('error', function (error, stdout, stderr) {
      console.error("Got error")
      console.log("\n")
      console.log("Error", error)
      console.log("\n")
      console.log("Stdout", stdout)
      console.log("\n")
      console.log("Stderr", stderr)
    })
  return command;
}

export const thumbnails = (videoLocation: string) => {
  const command = ffmpeg(videoLocation);
  command.setFfmpegPath("/usr/bin/ffmpeg")
  command.renice(-20);
  return command;
}

export const ffprobe = (videoLocation: string) => {
  const command = ffmpeg(videoLocation);
  command.setFfmpegPath("/usr/bin/ffmpeg")
  command.setFfprobePath("/usr/bin/ffprobe")
  command.renice(-20)
    .on('error', function (error) {
      console.error("Got error")
      console.log(error)
    })
  return command;
}

export default converter;
