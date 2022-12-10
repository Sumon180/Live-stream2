import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import VideoQueue from '@server/models/VideoQueue';
import { ffprobe } from '@server/ffmepg';
import { logger } from '@config/logger';
import { v3GenerateThumbnails } from '@server/v3Ffmpeg';

import { AppDataSource } from '@config/db';
VideoQueue.useDataSource(AppDataSource);
const fsPromise = fs.promises;

interface File {
  destination: string;
  encoding: string;
  fieldname: string;
  filename: string;
  mimetype: string;
  originalname: string;
  path: string;
  size: number;
}
interface FileType extends Request {
  files?: File[];
}

export const mergeChunk = async (req: FileType) => {
  const { body, files } = req;
  const userId = body.userId;
  const videoQ = new VideoQueue();
  if (!userId || files.length < 1) {
    throw new Error('UserID or file is missing');
  }
  console.log('Starting to merge the file, UserID:- ', userId);
  const dir = `./public/uploads/${body.dzuuid}`;
  const originalName = files[0].originalname;
  const clientFileName = originalName.split('.').shift();
  const extension = originalName.split('.').pop();
  const fullPaths = [];
  const fullFileName = `${body.dzuuid}_${userId}_${uuidv4()}_video.${extension}`;

  await (async () => {
    const files = (await fsPromise.readdir(dir)).filter((a) => a.endsWith('.ain')).sort();
    const serialFiles = [];
    for (const file in files) {
      const index = parseInt(files[file].split('.').shift());
      serialFiles[index] = files[file];
    }
    const parts = [];
    for (const file of serialFiles) {
      const _file = dir + '/' + file;
      parts.push(await fsPromise.readFile(_file));
      fullPaths.push(_file);
    }
    await fsPromise.writeFile(dir + `/${fullFileName}`, Buffer.concat(parts));
  })()
    .then(async () => {
      videoQ.userId = parseInt(userId);
      videoQ.chunkId = body.dzuuid;
      videoQ.videoLocation = dir + `/${fullFileName}`;
      videoQ.fileName = clientFileName;
      videoQ.sessionId = body.sessionId;
      await videoQ.save();
    })
    .then(async () => {
      ffprobe(videoQ.videoLocation)
        .on('error', (err) => {
          logger.error('Unable to get video res, Got error:- ' + err.message);
        })
        .ffprobe(async function (err, data) {
          if (err) {
            logger.error('Something went wrong', err);
          } else {
            videoQ.duration = data.streams[0].duration ?? '0';
            videoQ.size = data.format.size;
            videoQ.checkRes = false;
            await videoQ.save();
          }
        });
    })
    .then(() => {
      v3GenerateThumbnails(videoQ);
    })
    .then(() => {
      try {
        if (fullPaths.length > 0) {
          for (const index in fullPaths) {
            fs.unlinkSync(fullPaths[index]);
          }
          console.log('Chunk deleted.');
        }
      } catch (err) {
        console.error('Unable to delete chunk:- ', err);
      }
    });
};

export const uploadChunk = async (req: Request, res: Response) => {
  const chunkIndex = parseInt(req.body.dzchunkindex) + 1;
  const totalChunk = parseInt(req.body.dztotalchunkcount);
  if (chunkIndex === totalChunk) {
    try {
      return mergeChunk(req)
        .then(() => {
          res.json({
            status: 'success',
            traceId: uuidv4(),
            message: 'Your video has been uploaded and being processed.',
          });
        })
        .catch((e) => {
          console.log('Unable to merge file, Got error', e);
        });
    } catch (e) {
      res.json({
        status: 'error',
        traceId: uuidv4(),
        message: e.toString(),
      });
      return;
    }
  } else {
    res.json({
      status: 'success',
      traceId: uuidv4(),
      message: 'Chunk has been uploaded.',
    });
  }
};
