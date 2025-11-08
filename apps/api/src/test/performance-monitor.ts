export class PerformanceMonitor {
  private measurements: Map<string, number[]> = new Map();

  start(name: string) {
    this.measurements.set(name, []);
    const startTime = Date.now();
    return {
      end: () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        this.record(name, duration);
        return duration;
      },
    };
  }

  record(name: string, duration: number) {
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(duration);
  }

  getStats(name: string) {
    const measurements = this.measurements.get(name) || [];
    if (measurements.length === 0) {
      return null;
    }

    const sorted = measurements.slice().sort((a, b) => a - b);
    const sum = measurements.reduce((a, b) => a + b, 0);
    const avg = sum / measurements.length;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return {
      count: measurements.length,
      avg,
      min,
      max,
      p95,
      p99,
      sum,
    };
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    for (const name of this.measurements.keys()) {
      stats[name] = this.getStats(name);
    }
    return stats;
  }

  // Performance assertions
  expectGoodPerformance(name: string, maxMs: number = 1000) {
    const stats = this.getStats(name);
    if (stats) {
      expect(stats.avg).toBeLessThan(maxMs);
    }
  }

  expectConsistentPerformance(name: string, maxVariance: number = 0.5) {
    const stats = this.getStats(name);
    if (stats && stats.count > 1) {
      const variance = stats.p95 / stats.avg - 1;
      expect(variance).toBeLessThan(maxVariance);
    }
  }

  // Memory usage monitoring
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
    };
  }

  expectReasonableMemoryUsage(maxHeapMB: number = 500) {
    const usage = this.getMemoryUsage();
    expect(usage.heapUsed).toBeLessThan(maxHeapMB);
  }

  // Response time monitoring
  async measureApiCall<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    const result = await fn();
    const duration = Date.now() - startTime;
    return { result, duration };
  }

  // Database query performance
  async measureQuery<T>(queryFn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    return this.measureApiCall(queryFn);
  }

  // Cache performance
  async measureCacheOperation<T>(cacheFn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    return this.measureApiCall(cacheFn);
  }

  // Clear measurements
  clear() {
    this.measurements.clear();
  }

  // Generate performance report
  generateReport() {
    const stats = this.getAllStats();
    const memory = this.getMemoryUsage();

    const report = {
      timestamp: new Date().toISOString(),
      memory,
      performance: stats,
    };

    return report;
  }

  // Performance baselines
  setBaseline(name: string, expectedDuration: number) {
    const baseline = this.measurements.get(`baseline:${name}`) || [];
    baseline.push(expectedDuration);
    this.measurements.set(`baseline:${name}`, baseline);
  }

  compareWithBaseline(name: string) {
    const current = this.getStats(name);
    const baselineStats = this.getStats(`baseline:${name}`);

    if (!current || !baselineStats) {
      return null;
    }

    const performanceDelta = (current.avg - baselineStats.avg) / baselineStats.avg;
    return {
      current,
      baseline: baselineStats,
      performanceDelta,
      isImproved: performanceDelta < 0,
      isDegraded: performanceDelta > 0.1, // 10% degradation threshold
    };
  }
}