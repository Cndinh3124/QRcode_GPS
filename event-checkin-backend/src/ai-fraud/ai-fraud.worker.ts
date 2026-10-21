import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AiFraudService } from './ai-fraud.service';

@Injectable()
export class AiFraudWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiFraudWorker.name);
  private timer: NodeJS.Timeout | undefined;
  private busy = false;

  constructor(private readonly aiFraudService: AiFraudService) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.processNext(), 3000);
    void this.processNext();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async processNext() {
    if (this.busy) return;
    this.busy = true;
    try {
      const assessment = await this.aiFraudService.claimNext();
      if (assessment) await this.aiFraudService.scoreClaimed(assessment);
    } catch (error) {
      this.logger.error(
        'AI fraud assessment worker failed to process a job.',
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.busy = false;
    }
  }
}
