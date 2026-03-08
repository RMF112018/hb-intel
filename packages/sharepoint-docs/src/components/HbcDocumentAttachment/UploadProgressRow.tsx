import React from 'react';

interface UploadProgressRowProps {
  fileName: string;
  progress: number;
  error: string | null;
  onRetry: () => void;
}

export const UploadProgressRow: React.FC<UploadProgressRowProps> = ({
  fileName,
  progress,
  error,
  onRetry,
}) => {
  return (
    <div
      className={`hbc-upload-progress-row${error ? ' hbc-upload-progress-row--error' : ''}`}
      aria-live="polite"
    >
      <span className="hbc-upload-progress-row__filename">{fileName}</span>
      {error ? (
        <div className="hbc-upload-progress-row__error">
          <span role="alert">{error}</span>
          <button
            type="button"
            className="hbc-btn hbc-btn--ghost hbc-btn--small"
            onClick={onRetry}
            aria-label={`Retry uploading ${fileName}`}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="hbc-upload-progress-row__bar">
          <div
            className="hbc-upload-progress-row__fill"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Uploading ${fileName}: ${progress}%`}
          />
        </div>
      )}
    </div>
  );
};
