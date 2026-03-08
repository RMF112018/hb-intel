import React, { useRef, useState, useCallback } from 'react';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  disabled: boolean;
  complexityMode: 'essential' | 'standard' | 'expert';
}

export const DropZone: React.FC<DropZoneProps> = ({ onFiles, disabled, complexityMode }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  }, [onFiles, disabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFiles(files);
    // Reset input so same file can be re-selected after an error
    if (inputRef.current) inputRef.current.value = '';
  }, [onFiles]);

  return (
    <div
      className={`hbc-drop-zone${isDragOver ? ' hbc-drop-zone--active' : ''}${disabled ? ' hbc-drop-zone--disabled' : ''}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Drop files here or click to browse"
      aria-disabled={disabled}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={e => e.key === 'Enter' && !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hbc-drop-zone__input"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleChange}
      />
      <div className="hbc-drop-zone__label">
        {complexityMode === 'essential'
          ? <span>Tap to attach a file</span>
          : (
            <>
              <span>Drop files here</span>
              <span className="hbc-drop-zone__hint">or <button type="button" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>browse</button></span>
              {complexityMode === 'expert' && (
                <span className="hbc-drop-zone__limits">Max 250 MB per file · Files 250 MB–1 GB require confirmation · 1 GB hard limit</span>
              )}
            </>
          )
        }
      </div>
    </div>
  );
};
