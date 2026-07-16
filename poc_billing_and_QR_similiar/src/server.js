import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(currentDirectory, '..');
process.chdir(projectDirectory);

const port = Number(process.env.PORT ?? 3000);
const { app } = await createApp({
  databasePath: process.env.DATABASE_PATH ?? '.data/rosihome-billing-poc-v2',
  storagePath: process.env.STORAGE_PATH ?? 'storage',
  jwtSecret: process.env.JWT_SECRET,
});

app.listen(port, () => {
  console.log(`RosiHome synchronized billing PoC is running at http://localhost:${port}`);
});
