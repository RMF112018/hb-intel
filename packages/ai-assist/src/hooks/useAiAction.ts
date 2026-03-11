/**
 * useAiAction — SF15-T04
 *
 * Invokes a single AI action by key. Manages loading/result/error state
 * and delegates orchestration to AiAssistApi.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { IAiActionResult, IAiActionInvokeContext, ComplexityTier } from '../types/index.js';
import { AiActionRegistry } from '../registry/AiActionRegistry.js';
import { AiAssistApi } from '../api/index.js';

export interface UseAiActionResult {
  readonly invoke: (context: Record<string, unknown>) => Promise<IAiActionResult | null>;
  readonly isLoading: boolean;
  readonly result: IAiActionResult | null;
  readonly error: Error | null;
  readonly cancel: () => void;
}

export function useAiAction(actionKey: string): UseAiActionResult {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IAiActionResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const apiRef = useRef(new AiAssistApi());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const invoke = useCallback(
    async (context: Record<string, unknown>): Promise<IAiActionResult | null> => {
      const action = AiActionRegistry.get(actionKey);
      if (!action) {
        const err = new Error(`[ai-assist] Action not found: "${actionKey}"`);
        if (mountedRef.current) {
          setError(err);
        }
        return null;
      }

      if (mountedRef.current) {
        setIsLoading(true);
        setError(null);
        setResult(null);
      }

      const invokeContext: IAiActionInvokeContext = {
        userId: (context['userId'] as string) ?? '',
        role: (context['role'] as string) ?? '',
        recordType: (context['recordType'] as string) ?? '',
        recordId: (context['recordId'] as string) ?? '',
        complexity: (context['complexity'] as ComplexityTier) ?? 'standard',
      };

      const record = context['record'] ?? context;

      try {
        const actionResult = await apiRef.current.invoke(action, invokeContext, record);
        if (mountedRef.current) {
          setResult(actionResult);
          setIsLoading(false);
        }
        return actionResult;
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
        return null;
      }
    },
    [actionKey],
  );

  const cancel = useCallback(() => {
    apiRef.current.cancel(actionKey);
  }, [actionKey]);

  return { invoke, isLoading, result, error, cancel };
}
