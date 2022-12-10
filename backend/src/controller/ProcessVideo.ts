import { AppDataSource } from '@config/db';
import { Request, Response } from 'express';
import { logger } from '@config/logger';
import VideoQueue from '@server/models/VideoQueue';
VideoQueue.useDataSource(AppDataSource);
import converter from '@server/ffmepg';
import fs from 'fs';
import { v3Convert } from '@server/v3Ffmpeg';

function get30MinsAgo() {
  return Math.floor(Date.now() / 1000) - 30 * 60;
}

export default class ProcessVideo {
  protected request: Request;
  protected response: Response;
  protected video: VideoQueue;
  protected videoRes: number;
  protected possibleRes: { [key: number]: string | number } = {};

  protected static thumbnails: string[] = [];

  constructor(req: Request, res: Response) {
    logger.info('Queued job processing.');
    this.request = req;
    this.response = res;
    (async () => await this.init())();
    res.send('Processing video, See the console.');
  }

  /**
   * Initiate the convert process
   * @private
   */
  private async init() {
    const processing = await VideoQueue.findOneBy({ convertStatus: 1 });
    if (processing && processing.id) {
      if (processing.convertStatus === null || processing.convertStartTime < get30MinsAgo()) {
        processing.convertStatus = 4;
        await processing.save();
      } else {
        console.log(`${processing.chunkId} is in process.`);
        return;
      }
    }
    this.video = await VideoQueue.createQueryBuilder()
      .where({ convertStatus: 0 })
      .andWhere('tried < :tried', { tried: 3 })
      .orderBy('id', 'ASC')
      .getOne();
    const video = this.video;

    if (this.video) {
      try {
        if (!fs.existsSync(video.videoLocation)) {
          console.error('Video not found');
          video.status = 'done';
          await video.save();
          return;
        }
        console.info('Got video to process. :)', video.chunkId, video.convertStatus);
        console.log(video);
        video.convertStatus = 1;
        await video.save();
        await this.getVideoRes(video);
        await this.getPossibleRes();
        await this.process();
      } catch (e) {
        logger.error('Unable to process the video, Got error:- ', e);
        video.status = 'error';
        video.tried++;
        await video.save();
      }
    } else {
      console.warn('No video in the queue. :) ');
    }
  }

  /**
   * Get the video current resolution
   * @param video
   * @private
   */
  private async getVideoRes(video: VideoQueue) {
    //if (!video.checkRes) return;
    const response = new Promise<number>((resolve, rejects) => {
      converter(video.videoLocation)
        .on('error', (err) => {
          logger.error('Unable to get video res, Got error:- ' + err.message);
          rejects(err.message);
        })
        .ffprobe(async function (err, data) {
          if (err) {
            logger.error('Something went wrong', err);
          } else {
            video.duration = data.streams[0].duration;
            video.size = data.format.size;
            video.checkRes = false;
            await video.save();
            resolve(data.streams[0].height);
          }
        });
    });
    this.videoRes = await response;
  }

  /**
   * Get all the below resolution
   * @private
   */
  private getPossibleRes() {
    const supportedRes = ['240', '360', '480', '720', '1080', '2048', '4096'];
    let count = 0;
    for (const index in supportedRes) {
      if (this.videoRes >= parseInt(supportedRes[index])) {
        this.possibleRes[count] = parseInt(supportedRes[index]);
      }
      count++;
    }
  }

  /**
   * Convert video to different resolution
   * @private
   */
  private async process() {
    const video = this.video;

    const destination = video.videoLocation.split('/').slice(0, -1).join('/');

    const filename = video.videoLocation.split('/').pop().split('.').shift();

    const ffmpeg = converter(video.videoLocation);

    if (Object.keys(this.possibleRes).length > 0) {
      for (const res in Object.keys(this.possibleRes)) {
        console.log('Processing:- ' + this.possibleRes[res], ' ChunkID:- ', video.chunkId, ' ', new Date());
        //await convert(this.possibleRes[res])
        await v3Convert(video, this.possibleRes[res] + 'p');
        console.log('Processing complete:- ' + this.possibleRes[res], ' ChunkID:- ', video.chunkId, ' ', new Date());
      }
    }

    const convertMainVideo = (ffmpeg) =>
      new Promise((resolve, reject) => {
        ffmpeg
          .on('start', async function (commandLine) {
            logger.info(`Starting to process main video`);
            console.info('Command:- ', commandLine);
            video.status = 'processing';
            await video.save();
          })
          .on('end', async function () {
            video.convertStatus = 2;

            await video.save();
            resolve(true);
          })
          .on('error', async function (err) {
            logger.error(`Unable to process main video, Got:- ${err.message}`);
            video.status = 'error';
            video.tried++;
            video.error[`mainVideo`] = true;
            await video.save();
            reject(false);
          })
          .save(destination + `/${filename}.mp4`);
      });

    if (!video.videoLocation.includes('.mp4')) {
      await convertMainVideo(ffmpeg);
    } else {
      video.convertStatus = 2;
      await video.save();
    }
  }
}
