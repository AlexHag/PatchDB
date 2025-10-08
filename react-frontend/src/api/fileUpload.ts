// File upload service for S3 pre-signed URLs
import type { FileUploadUrlResponse } from './types';
import { getAuthHeaders } from './auth';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? `${window.location.origin}/api` 
  : `http://localhost:5064`;

export class FileUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileUploadError';
  }
}

/**
 * Get a pre-signed URL for uploading a file to S3
 * @returns Promise containing fileId and upload URL
 */
export async function getUploadUrl(): Promise<FileUploadUrlResponse> {
  const response = await fetch(`${API_BASE_URL}/file-service/upload-url`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new FileUploadError(`Failed to get upload URL: ${errorText}`);
  }

  return await response.json();
}

/**
 * Upload a file to S3 using the pre-signed URL
 * @param file - The file to upload
 * @param uploadUrl - The pre-signed S3 URL
 * @returns Promise that resolves when upload is complete
 */
export async function uploadFileToS3(file: File, uploadUrl: string): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new FileUploadError(`Failed to upload file to S3: ${errorText}`);
  }
}

/**
 * Complete file upload workflow: get pre-signed URL and upload file
 * @param file - The file to upload
 * @returns Promise containing the fileId for backend operations
 */
export async function uploadFile(file: File): Promise<string> {
  try {
    // Step 1: Get pre-signed URL and fileId
    const { fileId, url } = await getUploadUrl();

    // Step 2: Upload file to S3
    await uploadFileToS3(file, url);

    // Return the fileId for backend operations
    return fileId;
  } catch (error) {
    if (error instanceof FileUploadError) {
      throw error;
    }
    throw new FileUploadError(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate file before upload
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in megabytes (default: 10MB)
 * @param allowedTypes - Array of allowed MIME types (default: all images)
 */
export function validateFile(
  file: File, 
  maxSizeMB: number = 10,
  allowedTypes: string[] = ['image/']
): void {
  // Check file type
  const isValidType = allowedTypes.some(type => 
    type.endsWith('/') ? file.type.startsWith(type) : file.type === type
  );
  
  if (!isValidType) {
    throw new FileUploadError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new FileUploadError(`File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
  }
}

/**
 * Complete file upload with validation
 * @param file - The file to upload
 * @param options - Upload options
 * @returns Promise containing the fileId
 */
export async function uploadFileWithValidation(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): Promise<string> {
  // Validate file first
  validateFile(file, options.maxSizeMB, options.allowedTypes);

  // Upload file
  return await uploadFile(file);
}
