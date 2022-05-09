import { Request, Response } from 'express';
import { prisma } from '../database.js';

async function resetDatabase(req: Request, res: Response) {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;

  res.sendStatus(200);
}

async function seed(req: Request, res: Response) {
  await prisma.recommendation.createMany({
    data: [
      {
        name: 'Cartoon - C U',
        youtubeLink: 'https://www.youtube.com/watch?v=NJNp6DnAAIo',
        score: 4
      },
      {
        name: 'Cartoon - Howling',
        youtubeLink: 'https://www.youtube.com/watch?v=JiF3pbvR5G0',
        score: 6
      },
      {
        name: 'Imagine Dragons x J.I.D - Enemy',
        youtubeLink: 'https://www.youtube.com/watch?v=D9G1VOjN_84',
        score: 1
      },

    ]
  })

  res.sendStatus(200);
}


export const testsController = {
  resetDatabase,
  seed,
};