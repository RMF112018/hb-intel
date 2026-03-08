import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IDocumentContextConfig, IUploadedDocument } from '../types/index.js';
import type { UploadRequest, UploadValidationError } from '../services/UploadService.js';
import { useSharePointDocsServices } from './internal/useSharePointDocsServices.js';
import { useOfflineQueue } from './useOfflineQueue.js';
import { SIZE_OFFLINE_MAX } from '../constants/fileSizeLimits.js';
import { useNetworkStatus } from './internal/useNetworkStatus.js';

export interface UseDocumentUploadOptions {
  contextConfig: IDocumentContextConfig;
  subFolder?: string;
  onUploadComplete?: (document: IUploadedDocument) => void;
}

export interface UploadState {
  /** Start an upload. If offline and file ≤50MB, queues it. If offline and >50MB, throws. */
  upload: (file: File, options?: { largeFileConfirmed?: boolean }) => Promise<IUploadedDocument | 'queued'>;
  /** Validate a file without uploading. Returns null if valid. */
  validate: (file: File) => UploadValidationError | null;
  isUploading: boolean;
  /** Map of fileName → upload progress (0–100). */
  progress: Map<string, number>;
  error: Error | null;
}

export function useDocumentUpload(options: UseDocumentUploadOptions): UploadState {
  const { uploadService } = useSharePointDocsServices();
  const { addToQueue } = useOfflineQueue();
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const progressMap = new Map<string, number>();

  const mutation = useMutation({
    mutationFn: async ({
      file,
      largeFileConfirmed,
    }: { file: File; largeFileConfirmed?: boolean }) => {
      const request: UploadRequest = {
        file,
        contextConfig: options.contextConfig,
        subFolder: options.subFolder,
        largeFileConfirmed,
        onProgress: ({ fileName, percentComplete }) => {
          progressMap.set(fileName, percentComplete);
        },
      };
      return uploadService.upload(request);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['sharepoint-docs', 'documents', options.contextConfig.contextId],
      });
      options.onUploadComplete?.(result.document);
    },
  });

  const upload = async (
    file: File,
    uploadOptions?: { largeFileConfirmed?: boolean }
  ): Promise<IUploadedDocument | 'queued'> => {
    if (!isOnline) {
      if (file.size > SIZE_OFFLINE_MAX) {
        throw new Error(
          `This file is too large to queue offline (${(file.size / 1024 / 1024).toFixed(1)} MB). ` +
          `Files over 50 MB must be uploaded while connected.`
        );
      }
      await addToQueue({
        file,
        contextId: options.contextConfig.contextId,
        contextType: options.contextConfig.contextType,
        subFolder: options.subFolder,
      });
      return 'queued';
    }

    const result = await mutation.mutateAsync({ file, largeFileConfirmed: uploadOptions?.largeFileConfirmed });
    return result.document;
  };

  return {
    upload,
    validate: (file: File) => uploadService.validate(file),
    isUploading: mutation.isPending,
    progress: progressMap,
    error: mutation.error,
  };
}
