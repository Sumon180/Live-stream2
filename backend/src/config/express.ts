import express from 'express';
import router from '@server/routes';

const createServer = (): express.Application => {
  const app = express();
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));
  app.use(express.json({ limit: '100mb' }));
  app.use('/', router);
  console.log('CWD', process.cwd());
  app.use(express.static(process.cwd() + '/public'));
  app.use(express.static(__dirname + '../../public'));
  app.use('/uploads', express.static(process.cwd() + '/public/uploads'));

  return app;
};

export { createServer };
