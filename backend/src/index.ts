import 'reflect-metadata';
import * as moduleAlias from 'module-alias';

const sourcePath = process.env.NODE_ENV === 'development' ? 'src' : process.cwd() + '/build';
moduleAlias.addAliases({
  '@server': sourcePath,
  '@upload': sourcePath + '../uploads',
  '@config': `${sourcePath}/config`,
  '@util': `${sourcePath}/utils`,
});

import { createServer } from '@config/express';
import { AddressInfo } from 'net';
import http from 'http';
import { logger } from '@config/logger';
import VideoQueue from '@server/models/VideoQueue';

const host = '127.0.0.1';
const port = '5000';
async function startServer() {
  const app = createServer();

  const server = http.createServer(app).listen({ host, port }, () => {
    const addressInfo = server.address() as AddressInfo;
    process.env.NODE_ENV === 'development'
      ? logger.info(`Server ready at http://${addressInfo.address}:${addressInfo.port}`)
      : logger.info(`Server ready at https://${addressInfo.address}:${addressInfo.port}`);
  });

  const signalTraps: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
  signalTraps.forEach((type) => {
    process.once(type, async () => {
      const processing = await VideoQueue.findOneBy({ status: 'processing' });
      if (processing && processing.id) {
        processing.status = 'error';
        await processing.save();
      }
      server.close(() => {
        logger.debug('HTTP server closed');
      });
    });
  });
}

(async () => await startServer())();
