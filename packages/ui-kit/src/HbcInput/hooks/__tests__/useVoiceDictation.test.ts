import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceDictation } from '../useVoiceDictation.js';

describe('useVoiceDictation', () => {
  it('returns isSupported=false when SpeechRecognition not available', () => {
    const { result } = renderHook(() => useVoiceDictation());
    expect(result.current.isSupported).toBe(false);
    expect(result.current.isListening).toBe(false);
  });

  it('startListening is no-op when not supported', () => {
    const { result } = renderHook(() => useVoiceDictation());
    act(() => { result.current.startListening(); });
    expect(result.current.isListening).toBe(false);
  });

  describe('with mock SpeechRecognition', () => {
    let mockInstance: Record<string, unknown>;

    beforeEach(() => {
      mockInstance = {
        continuous: false,
        interimResults: false,
        lang: '',
        onresult: null,
        onerror: null,
        onend: null,
        start: vi.fn(),
        stop: vi.fn(),
      };
      (window as unknown as Record<string, unknown>).SpeechRecognition = vi.fn(() => mockInstance);
    });

    afterEach(() => {
      delete (window as unknown as Record<string, unknown>).SpeechRecognition;
    });

    it('returns isSupported=true with SpeechRecognition', () => {
      const { result } = renderHook(() => useVoiceDictation());
      expect(result.current.isSupported).toBe(true);
    });

    it('starts and stops listening', () => {
      const { result } = renderHook(() => useVoiceDictation());
      act(() => { result.current.startListening(); });
      expect(result.current.isListening).toBe(true);
      expect(mockInstance.start).toHaveBeenCalled();

      act(() => { result.current.stopListening(); });
      expect(result.current.isListening).toBe(false);
      expect(mockInstance.stop).toHaveBeenCalled();
    });

    it('handles not-allowed error with friendly message', () => {
      const { result } = renderHook(() => useVoiceDictation());
      act(() => { result.current.startListening(); });

      // Simulate error
      act(() => {
        (mockInstance.onerror as Function)({ error: 'not-allowed', message: '' });
      });
      expect(result.current.error).toBe('Microphone access denied. Check browser permissions.');
      expect(result.current.isListening).toBe(false);
    });
  });
});
