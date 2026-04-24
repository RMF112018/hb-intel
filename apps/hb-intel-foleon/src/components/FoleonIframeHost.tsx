import { useEffect, useRef, useState } from 'react';
import type { FoleonOriginPolicy } from '../services/FoleonOriginPolicy.js';

interface FoleonIframeHostProps {
  readonly src: string;
  readonly title: string;
  readonly policy: FoleonOriginPolicy;
  /**
   * Called when an allowed iframe `load` event fires. Useful for the
   * parent to stop the skeleton and log "Reader Open".
   */
  readonly onLoaded?: () => void;
  /** Called when an `error` event fires. Logs "Embed Error". */
  readonly onError?: () => void;
}

const MIN_HEIGHT_PX = 600;
const MAX_HEIGHT_PX = 50000;

export function FoleonIframeHost(props: FoleonIframeHostProps): React.ReactNode {
  const { src, title, policy, onLoaded, onError } = props;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState<number>(MIN_HEIGHT_PX);

  useEffect(() => {
    const expectedOrigin = (() => {
      try {
        return new URL(src).origin;
      } catch {
        return null;
      }
    })();
    if (!expectedOrigin) return;
    if (!policy.allowedOrigins.includes(expectedOrigin)) return;

    const handleMessage = (event: MessageEvent): void => {
      if (event.origin !== expectedOrigin) return;
      if (!event.data || typeof event.data !== 'object') return;
      const data = event.data as { type?: unknown; height?: unknown };
      if (data.type === 'set-height' && typeof data.height === 'number') {
        if (data.height > MIN_HEIGHT_PX && data.height < MAX_HEIGHT_PX) {
          setHeight(Math.floor(data.height));
        }
        return;
      }
      if (data.type === 'page-change') {
        iframeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [src, policy]);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      allowFullScreen
      onLoad={onLoaded}
      onError={onError}
      style={{
        width: '100%',
        height: `${height}px`,
        border: 'none',
        display: 'block',
      }}
    />
  );
}
