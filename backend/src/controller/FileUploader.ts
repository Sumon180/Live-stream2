import { Request, Response } from 'express';
//import { logger } from '@config/logger';
import { AppDataSource } from '@config/db';
//import { GenerateKey } from '@server/utils';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import VideoQueue from '@server/models/VideoQueue';
// import sha1 from 'sha1';
// import { ffprobe, thumbnails } from '@server/ffmepg';
// import axios from 'axios';

// const fsPromise = fs.promises;

VideoQueue.useDataSource(AppDataSource);

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

export default class FileUploader {
  static generateFileName(req: FileType) {
    const { body, files } = req;
    const userId = body.userId;
    const originalName = files[0].originalname;
    const extension = originalName.split('.').pop();
    return body.dzuuid + '_' + userId + `_video.${extension}`;
  }

  /**
   * Merge uploaded chunk file
   * @param req
   */
  // static async mergeChunk(req: FileType) {
  //   const { body, files } = req;
  //   const userId = body.userId;
  //   logger.info('Merge Video');
  //   if (files.length < 1) {
  //     throw new Error('File not found.');
  //   }
  //   const dir = `./public/uploads/${body.dzuuid}`;
  //   const originalName = files[0].originalname;
  //   const clientFileName = originalName.split('.').shift();
  //   const fullPaths = [];
  //   const fullFilename = FileUploader.generateFileName(req);

  //   (async () => {
  //     const files = (await fsPromise.readdir(dir)).filter((a) => a.endsWith('.ain')).sort();
  //     const serialFiles = [];
  //     for (const file in files) {
  //       const index = parseInt(files[file].split('.').shift());
  //       serialFiles[index] = files[file];
  //     }
  //     const parts = [];
  //     for (const file of serialFiles) {
  //       const _file = dir + '/' + file;
  //       parts.push(await fsPromise.readFile(_file));
  //       fullPaths.push(_file);
  //     }
  //     await fsPromise.writeFile(dir + `/${fullFilename}`, Buffer.concat(parts));

  //     const videoQ = new VideoQueue();
  //     videoQ.userId = parseInt(userId);

  //     videoQ.chunkId = body.dzuuid;
  //     videoQ.videoLocation = dir + `/${fullFilename}`;
  //     videoQ.fileName = clientFileName;
  //     videoQ.sessionId = body.sessionId;
  //     await videoQ.save();

  //     await (async () => {
  //       ffprobe(videoQ.videoLocation)
  //         .on('error', (err) => {
  //           logger.error('Unable to get video res, Got error:- ' + err.message);
  //         })
  //         .ffprobe(async function (err, data) {
  //           if (err) {
  //             logger.error('Something went wrong', err);
  //           } else {
  //             videoQ.duration = FileUploader.getDurationFromSeconds(data.streams[0].duration ?? '0');
  //             videoQ.size = data.format.size;
  //             videoQ.checkRes = false;
  //             await videoQ.save();
  //           }
  //         });
  //     })().then(async () => {
  //       await FileUploader.generateThumbnails(videoQ).then(async () => {
  //         await FileUploader.notifyServerToDownload(videoQ);
  //       });
  //     });
  //   })()
  //     .catch((err) => {
  //       console.log('Unable to merge files: ', err);
  //       throw new Error(err.message);
  //     })
  //     .then(() => {
  //       try {
  //         if (fullPaths.length > 0) {
  //           for (const index in fullPaths) {
  //             fs.unlinkSync(fullPaths[index]);
  //           }
  //           console.log('Chunk deleted.');
  //         }
  //       } catch (err) {
  //         console.error('Unable to delete chunk:- ', err);
  //       }
  //       FileUploader.generateFileName(req);
  //     });
  // }

  /**
   * Upload files with chunking
   * @param req
   * @param res
   */
  static async uploadChunk(_req: Request, res: Response) {
    // console.log(_req['files']);
    const dir = `./public/uploads`;

    res.json({
      status: 'success',
      traceId: uuidv4(),
      message: 'Chunk has been uploaded.',
    });
    const videoQ = new VideoQueue();
    videoQ.userId = parseInt('545');

    videoQ.chunkId = '3rdcomment';
    videoQ.videoLocation = dir + `/` + _req['files'][0].filename;
    videoQ.fileName = '1stcomment';
    videoQ.sessionId = 'body.sessionId;';
    await videoQ.save();
  }

  /**
   * Create 12 different thumbnails from the video
   * @private
   */

  static async cancelUpload(req: Request, res: Response) {
    const { uuid, sessionId } = req.body;
    const uploadDir = process.cwd() + '/public/uploads/' + uuid;
    res.json({
      status: 'success',
      message: 'Upload has been canceled.',
      sessionId,
    });
    await fs.rmSync(uploadDir, { force: true, recursive: true });
  }
}
