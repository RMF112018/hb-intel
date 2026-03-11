/**
 * @hbc/ai-assist — ReferenceExecutor (SF15-T07)
 *
 * Reference IAiActionExecutor implementation that returns deterministic
 * responses based on prompt keyword matching, with configurable delay.
 */

import type { IAiPromptPayload } from '../types/index.js';
import type { IAiActionExecutor } from '../api/index.js';

export class ReferenceExecutor implements IAiActionExecutor {
  constructor(private readonly delayMs = 50) {}

  async execute(payload: IAiPromptPayload, signal: AbortSignal): Promise<string> {
    await this.delay(signal);
    return JSON.stringify(this.buildResponse(payload));
  }

  private delay(signal: AbortSignal): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (signal.aborted) {
        reject(new DOMException('The operation was aborted.', 'AbortError'));
        return;
      }

      const timer = setTimeout(() => {
        signal.removeEventListener('abort', onAbort);
        resolve();
      }, this.delayMs);

      function onAbort(): void {
        clearTimeout(timer);
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      }

      signal.addEventListener('abort', onAbort, { once: true });
    });
  }

  private buildResponse(payload: IAiPromptPayload): Record<string, unknown> {
    const prompt = payload.userPrompt.toLowerCase();

    if (prompt.includes('summarize') || prompt.includes('scorecard')) {
      return {
        outputType: 'text',
        text: 'This scorecard demonstrates strong performance across key metrics with an overall score of 87/100. Key strengths include cost management and timeline adherence.',
        confidence: 0.85,
      };
    }

    if (prompt.includes('risk')) {
      return {
        outputType: 'bullet-list',
        items: [
          'Risk 1: Supply chain volatility may impact material costs by 8-12%',
          'Risk 2: Labor market tightness in the target region',
          'Risk 3: Permitting timeline uncertainty due to regulatory changes',
        ],
        confidence: 0.85,
      };
    }

    if (prompt.includes('learning') || prompt.includes('loop')) {
      return {
        outputType: 'text',
        text: 'Key learning: Early stakeholder alignment reduced change orders by 35%. Recommendation: Implement structured pre-bid reviews for similar future projects.',
        confidence: 0.85,
      };
    }

    if (prompt.includes('constraint')) {
      return {
        outputType: 'bullet-list',
        items: [
          'Constraint 1: Site access limited to weekday business hours',
          'Constraint 2: Budget ceiling fixed at proposal amount with no contingency',
          'Constraint 3: Environmental compliance requires LEED Silver minimum',
        ],
        confidence: 0.85,
      };
    }

    if (prompt.includes('context') || prompt.includes('notes')) {
      return {
        outputType: 'text',
        text: 'Context handoff: Project is in pre-construction phase. Key contacts: Owner rep (J. Smith), Architect (K. Lee). Critical path items: foundation permit and steel procurement.',
        confidence: 0.85,
      };
    }

    if (prompt.includes('intelligence') || prompt.includes('contribution')) {
      return {
        outputType: 'structured-object',
        data: {
          marketSize: '$2.4B regional commercial construction',
          competitors: ['Competitor A', 'Competitor B', 'Competitor C'],
          trendIndicators: { demandGrowth: '6.2%', laborCostTrend: 'increasing' },
        },
        confidence: 0.85,
      };
    }

    return {
      outputType: 'text',
      text: 'Reference executor default response',
      confidence: 0.85,
    };
  }
}

/** Factory function for creating a ReferenceExecutor instance. */
export function createReferenceExecutor(delayMs?: number): ReferenceExecutor {
  return new ReferenceExecutor(delayMs);
}
