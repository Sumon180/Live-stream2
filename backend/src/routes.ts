import express, { Router, Request, Response } from 'express';
import FileUploader from '@server/controller/FileUploader';
import multer from 'multer';
import User from '../src/models/VideoQueue';
// import fs from 'fs';
// import path from 'path';
import ProcessVideo from '@server/controller/ProcessVideo';
import cors from 'cors';

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
  exposedHeaders: ['Access-Control-Allow-Origin'],
};

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, 'public/uploads');
  },
  filename(_req, file, cb) {
    let fName = file.originalname;
    fName = fName.replace(' ', '-').replace('_', '-');

    cb(null, `${fName}`);
    // if (!fs.existsSync('public/uploads')) {
    //   fs.mkdir(process.cwd() + '/public/uploads', (res) => console.log('Upload dir has been created', res));
    // }
    // if (req.body.dzchunkindex) {
    //   const chunkID = req.body.dzuuid;
    //   const uploadDir = process.cwd() + '/public/uploads/';
    //   const chunkDir = uploadDir + '/' + chunkID;
    //   if (!fs.existsSync(chunkDir)) {
    //     fs.mkdir(chunkDir, (res) => console.log('Upload dir has been created', res));
    //   }

    //   cb(null, `${chunkID}/${req.body.dzchunkindex}${path.extname(file.originalname)}.ain`);
    // } else {
    //   let fName = file.originalname;
    //   fName = fName.replace(' ', '-');
    //   cb(null, `${fName}`);
    // }
  },
});

const upload = multer({ storage });

const router: Router = express.Router();

router.use(cors(corsOptions));

router.get('/', async (_req, res) => {
  res.json({
    status: 'success',
    traceId: Date.now(),
    sis: '4th Comment',
  });
});
router.get('/playpage/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = await User.findOneBy({
    id: id,
  });
  user.videoLocation.replace('./', '/');
  res.json(user);
});

router.options('/upload', (_req, res) => {
  res.json({
    status: 'success',
    traceId: Date.now(),
  });
});

router.post('/upload', upload.array('video'), FileUploader.uploadChunk);
router.get('/process', (req, res) => new ProcessVideo(req, res));
router.options('/cancel/', (_req, req) => req.json({ status: 'success' }));
router.post('/cancel/', FileUploader.cancelUpload);

export default router;
