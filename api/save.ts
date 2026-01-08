import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const projects = req.body;
    const filePath = path.join(process.cwd(), 'api', 'data.ts');
    const fileContent = `import { Project, WorkCategory, WorkStatus, UnitType } from '../types';\n\nexport const initialProjects: Project[] = ${JSON.stringify(projects, null, 2)};\n`;

    try {
      fs.writeFileSync(filePath, fileContent);
      res.status(200).json({ message: 'Projects saved successfully' });
    } catch (error) {
      console.error('Error saving projects:', error);
      res.status(500).json({ message: 'Failed to save projects' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
