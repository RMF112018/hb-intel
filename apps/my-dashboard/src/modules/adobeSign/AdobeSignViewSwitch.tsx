import { useRef, useState } from 'react';

export type AdobeSignActiveView = 'action-queue' | 'completed';

interface AdobeSignViewSwitchProps {
  readonly activeView: AdobeSignActiveView;
  readonly onActivate: (view: AdobeSignActiveView) => void;
  readonly className?: string;
  readonly tabClassName?: string;
}

const VIEW_ORDER: readonly AdobeSignActiveView[] = ['action-queue', 'completed'];

export function AdobeSignViewSwitch({
  activeView,
  onActivate,
  className,
  tabClassName,
}: AdobeSignViewSwitchProps) {
  const [focusedView, setFocusedView] = useState<AdobeSignActiveView>(activeView);
  const actionQueueRef = useRef<HTMLButtonElement | null>(null);
  const completedRef = useRef<HTMLButtonElement | null>(null);

  const focusView = (view: AdobeSignActiveView) => {
    setFocusedView(view);
    const target = view === 'action-queue' ? actionQueueRef.current : completedRef.current;
    target?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, current: AdobeSignActiveView) => {
    const idx = VIEW_ORDER.indexOf(current);
    switch (event.key) {
      case 'ArrowRight': {
        event.preventDefault();
        focusView(VIEW_ORDER[(idx + 1) % VIEW_ORDER.length]);
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        focusView(VIEW_ORDER[(idx - 1 + VIEW_ORDER.length) % VIEW_ORDER.length]);
        break;
      }
      case 'Home': {
        event.preventDefault();
        focusView(VIEW_ORDER[0]);
        break;
      }
      case 'End': {
        event.preventDefault();
        focusView(VIEW_ORDER[VIEW_ORDER.length - 1]);
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        onActivate(current);
        break;
      }
      default:
        break;
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Adobe Sign activity views"
      data-adobe-sign-view-switch=""
      data-adobe-sign-card-view-toggle=""
      className={className}
    >
      <button
        ref={actionQueueRef}
        type="button"
        role="tab"
        id="adobe-sign-tab-action-queue"
        aria-controls="adobe-sign-panel-action-queue"
        aria-selected={activeView === 'action-queue'}
        tabIndex={focusedView === 'action-queue' ? 0 : -1}
        className={tabClassName}
        data-adobe-sign-card-view="action-queue"
        data-adobe-sign-card-view-selected={activeView === 'action-queue' ? 'true' : 'false'}
        onClick={() => {
          setFocusedView('action-queue');
          onActivate('action-queue');
        }}
        onFocus={() => setFocusedView('action-queue')}
        onKeyDown={(event) => handleKeyDown(event, 'action-queue')}
      >
        Action Queue
      </button>
      <button
        ref={completedRef}
        type="button"
        role="tab"
        id="adobe-sign-tab-completed"
        aria-controls="adobe-sign-panel-completed"
        aria-selected={activeView === 'completed'}
        tabIndex={focusedView === 'completed' ? 0 : -1}
        className={tabClassName}
        data-adobe-sign-card-view="completed"
        data-adobe-sign-card-view-selected={activeView === 'completed' ? 'true' : 'false'}
        onClick={() => {
          setFocusedView('completed');
          onActivate('completed');
        }}
        onFocus={() => setFocusedView('completed')}
        onKeyDown={(event) => handleKeyDown(event, 'completed')}
      >
        Completed
      </button>
    </div>
  );
}

export default AdobeSignViewSwitch;
