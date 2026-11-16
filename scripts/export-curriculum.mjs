#!/usr/bin/env node
/**
 * scripts/export-curriculum.mjs
 * Zero-dependency curriculum exporter using Vite's native ssrLoadModule.
 * Compiles src/data/index.ts into macos/Sources/LinguaVerve/Resources/curriculum.json
 * so the native SwiftUI macOS app and web SPA share one single source of truth.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const outPath = path.join(
  repoRoot,
  'macos',
  'Sources',
  'LinguaVerveCore',
  'Resources',
  'curriculum.json'
);

async function exportCurriculum() {
  const vite = await createServer({
    root: repoRoot,
    logLevel: 'silent',
    server: { middlewareMode: true },
    appType: 'custom',
  });

  try {
    const dataModule = await vite.ssrLoadModule('/src/data/index.ts');
    const payload = {
      generatedAt: '2026-11-16T00:00:00Z',
      version: '1.0.0',
      languages: dataModule.LANGUAGES,
      levels: dataModule.CEFR_LEVELS,
      tips: dataModule.ALL_TIPS,
      falseFriends: dataModule.FALSE_FRIENDS,
      diagnosticQuestions: dataModule.DIAGNOSTIC_QUESTIONS,
    };

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
    console.log(
      `[macos:sync] Exported ${payload.languages.length} languages, ${payload.levels.length} CEFR levels, ${payload.tips.length} tips, ${payload.falseFriends.length} false friends, and ${payload.diagnosticQuestions.length} diagnostic questions -> ${path.relative(repoRoot, outPath)}`
    );
  } finally {
    await vite.close();
  }
}

exportCurriculum().catch((err) => {
  console.error('[macos:sync] Failed to export curriculum:', err);
  process.exit(1);
});
