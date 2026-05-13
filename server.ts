import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'data', 'magazines.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure directories exist
fs.ensureDirSync(path.join(process.cwd(), 'data'));
fs.ensureDirSync(UPLOADS_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

async function startServer() {
  const app = express();
  app.use(express.json());

  // API: Get magazines
  app.get('/api/magazines', async (req, res) => {
    try {
      const data = await fs.readJson(DATA_FILE);
      res.json(data);
    } catch (error) {
      res.json([]);
    }
  });

  // API: Create magazine (upload)
  app.post('/api/magazines', upload.array('pages'), async (req, res) => {
    try {
      const { title, category, description } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
      }

      const pageUrls = files.map(file => `/uploads/${file.filename}`);
      const newMag = {
        id: `custom-${Date.now()}`,
        title,
        category: category || 'User Upload',
        coverUrl: pageUrls[0],
        pages: pageUrls,
        description: description || 'No description provided.',
        createdAt: new Date().toISOString()
      };

      const magazines = await fs.readJson(DATA_FILE).catch(() => []);
      magazines.unshift(newMag);
      await fs.writeJson(DATA_FILE, magazines, { spaces: 2 });

      res.status(201).json(newMag);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to save magazine' });
    }
  });

  // API: Delete magazine
  app.delete('/api/magazines/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const magazines = await fs.readJson(DATA_FILE);
      const magToDelete = magazines.find((m: any) => m.id === id);
      
      if (magToDelete) {
        // Delete associated files
        for (const pageUrl of magToDelete.pages) {
          const fileName = pageUrl.split('/').pop();
          if (fileName) {
            await fs.remove(path.join(UPLOADS_DIR, fileName)).catch(() => {});
          }
        }
      }

      const updated = magazines.filter((m: any) => m.id !== id);
      await fs.writeJson(DATA_FILE, updated, { spaces: 2 });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete magazine' });
    }
  });

  // Serve uploads
  app.use('/uploads', express.static(UPLOADS_DIR));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
