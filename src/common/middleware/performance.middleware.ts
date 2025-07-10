import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Performance');
  private readonly slowRequestThreshold = 1000; // 1 second
  private readonly verySlowRequestThreshold = 3000; // 3 seconds

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const startCpuUsage = process.cpuUsage();
    const startMemory = process.memoryUsage();

    // Add request ID for tracking
    const requestId = this.generateRequestId();
    req['requestId'] = requestId;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const endCpuUsage = process.cpuUsage(startCpuUsage);
      const endMemory = process.memoryUsage();

      const performanceData = {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        cpuUsage: {
          user: endCpuUsage.user / 1000, // Convert to milliseconds
          system: endCpuUsage.system / 1000,
        },
        memoryDelta: {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        },
        timestamp: new Date().toISOString(),
      };

      // Log based on severity
      if (duration > this.verySlowRequestThreshold) {
        this.logger.error(`Very slow request detected`, performanceData);
      } else if (duration > this.slowRequestThreshold) {
        this.logger.warn(`Slow request detected`, performanceData);
      } else {
        this.logger.debug(`Request completed`, performanceData);
      }

      // Send metrics to monitoring service (if available)
      this.sendMetrics(performanceData);
    });

    next();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sendMetrics(data: any): void {
    // TODO: Implement integration with monitoring service
    // Examples: Prometheus, DataDog, New Relic, etc.
    // For now, we'll just store critical metrics
    if (data.duration > this.slowRequestThreshold) {
      // Could push to a metrics queue or external service
      process.emit('performance-metric', data);
    }
  }
}