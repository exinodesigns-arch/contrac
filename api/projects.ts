import { NextApiRequest, NextApiResponse } from 'next';
import { initialProjects } from './data';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(initialProjects);
}
