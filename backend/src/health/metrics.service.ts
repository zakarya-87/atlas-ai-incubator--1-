import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private cacheHits = 0;
  private cacheMisses = 0;

  recordCacheHit() {
    this.cacheHits++;
  }

  recordCacheMiss() {
    this.cacheMisses++;
  }

  async getMetrics() {
    return {
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
    };
  }
}
