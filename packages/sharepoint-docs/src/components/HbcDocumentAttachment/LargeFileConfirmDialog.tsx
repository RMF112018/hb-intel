import React from 'react';

interface LargeFileConfirmDialogProps {
  file: File;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LargeFileConfirmDialog: React.FC<LargeFileConfirmDialogProps> = ({
  file, onConfirm, onCancel
}) => {
  const sizeMB = (file.size / 1024 / 1024).toFixed(1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="large-file-dialog-title"
      aria-describedby="large-file-dialog-desc"
      className="hbc-large-file-dialog"
    >
      <h2 id="large-file-dialog-title">Large file — confirm upload</h2>
      <p id="large-file-dialog-desc">
        <strong>{file.name}</strong> is {sizeMB} MB. Files this large may take several minutes
        to upload and cannot be queued for offline retry. Make sure you have a stable connection
        before continuing.
      </p>
      <p>
        This file will be uploaded with progress reporting. Do not close this tab until the upload completes.
      </p>
      <div className="hbc-large-file-dialog__actions">
        <button type="button" onClick={onCancel} className="hbc-btn hbc-btn--secondary">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className="hbc-btn hbc-btn--primary">
          Upload anyway
        </button>
      </div>
    </div>
  );
};
