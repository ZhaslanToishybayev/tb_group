#!/usr/bin/env node

import { watch } from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const SPEC_ROOT = path.join(REPO_ROOT, 'specs');
const SYNC_SCRIPT = path.join(REPO_ROOT, '.specify', 'scripts', 'bash', 'spec-to-taskmaster.sh');

const runCommand = (cmd, args, opts = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...opts });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${cmd} exited with code ${code}`));
      }
    });
  });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompt = (question) =>
  new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim().toLowerCase()));
  });

const syncTasks = async () => {
  console.log('[watcher] Running Spec Kit → Task Master sync...');
  await runCommand('bash', [SYNC_SCRIPT], { cwd: REPO_ROOT });
  console.log('[watcher] Running task-master list to verify...');
  await runCommand('task-master', ['list'], { cwd: REPO_ROOT });
  console.log('[watcher] Sync complete.');
};

const pendingTimers = new Map();
const DEBOUNCE_MS = 1000;

const onTasksChange = async (filePath) => {
  pendingTimers.set(
    filePath,
    setTimeout(async () => {
      try {
        pendingTimers.delete(filePath);
        const relativePath = path.relative(REPO_ROOT, filePath);
        console.log(`\n[watcher] Detected update in ${relativePath}`);
        const answer = await prompt('Trigger sync now? (y/N): ');
        if (answer === 'y' || answer === 'yes') {
          await syncTasks();
        } else {
          console.log('[watcher] Sync skipped by user.');
        }
      } catch (error) {
        console.error('[watcher] Sync failed:', error.message);
      }
    }, DEBOUNCE_MS),
  );
};

const watchTasks = () => {
  console.log(`[watcher] Watching Spec Kit tasks in ${SPEC_ROOT}`);
  const watcher = watch(SPEC_ROOT, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (!filename.endsWith('tasks.md')) return;
    const fullPath = path.join(SPEC_ROOT, filename);
    if (pendingTimers.has(fullPath)) {
      clearTimeout(pendingTimers.get(fullPath));
    }
    onTasksChange(fullPath);
  });

  watcher.on('error', (error) => {
    console.error('[watcher] Error:', error);
  });
};

process.on('SIGINT', () => {
  console.log('\n[watcher] Stopping watcher.');
  rl.close();
  process.exit(0);
});

watchTasks();
