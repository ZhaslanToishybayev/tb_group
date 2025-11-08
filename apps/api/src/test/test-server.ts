import { spawn } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';

export class TestServer {
  private serverProcess: any = null;
  private port: number = 4001; // Use different port for tests
  private baseUrl: string = `http://localhost:${this.port}`;

  async start() {
    if (this.serverProcess) {
      return;
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = join(__filename, '../..');
    const serverPath = join(__dirname, 'server');

    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('npm', ['run', 'dev:test'], {
        cwd: __dirname,
        env: {
          ...process.env,
          NODE_ENV: 'test',
          PORT: this.port.toString(),
          DATABASE_URL: process.env.TEST_DATABASE_URL,
          REDIS_URL: process.env.TEST_REDIS_URL,
        },
        stdio: 'pipe',
      });

      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Server running') || output.includes('listening')) {
          resolve(this);
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error('Test server error:', data.toString());
      });

      this.serverProcess.on('error', (error) => {
        reject(error);
      });

      // Timeout if server doesn't start
      setTimeout(() => {
        if (!this.serverProcess) {
          reject(new Error('Test server failed to start'));
        }
      }, 30000);
    });
  }

  async stop() {
    if (this.serverProcess) {
      this.serverProcess.kill('SIGTERM');
      this.serverProcess = null;
    }
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  getPort() {
    return this.port;
  }
}