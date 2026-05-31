import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { expect, test, describe } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Very lean smoke tests
describe('Frontend PWA config and setup smoke tests', () => {

  test('offline.html exists in public directory', () => {
    const offlinePath = path.resolve(__dirname, '../../public/offline.html');
    const exists = fs.existsSync(offlinePath);
    expect(exists).toBe(true);
  });

  test('vite.config.js has Workbox configurations', () => {
    const configPath = path.resolve(__dirname, '../../vite.config.js');
    const content = fs.readFileSync(configPath, 'utf8');

    // Checks that we added navigateFallback for PWA requirement
    expect(content).toContain("navigateFallback: '/offline.html'");
    // Checks that we added icons array mapping
    expect(content).toContain("icons/icon-192x192-maskable.png");
  });

  test('App.jsx contains InstallPrompt and UpdateBanner', () => {
    const appPath = path.resolve(__dirname, '../App.jsx');
    const content = fs.readFileSync(appPath, 'utf8');

    expect(content).toContain('<InstallPrompt />');
    expect(content).toContain('<UpdateBanner />');
  });

  test('AuthContext, Subscribe, and GuideDetail files exist to verify architectural intent', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../context/AuthContext.jsx'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../pages/Subscribe.jsx'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../pages/GuideDetail.jsx'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../pages/Forbidden.jsx'))).toBe(true);
  });
});
