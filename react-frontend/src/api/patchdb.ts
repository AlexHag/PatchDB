// PatchDB API functions
import type {
  User,
  UserPatchesResponse,
  UploadResult,
  ApiError,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiErrorResponse
} from './types';
import { getAuthHeaders } from './auth';

// API Configuration
// For development, use the local C# backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? `${window.location.origin}/api` 
  : `http://localhost:5064`; // Default HTTPS port for .NET development


export class PatchDBApiError extends Error {
  constructor(errorId: string, message: string) {
    super(message);
    this.name = errorId;
  }
}

// Helper function to handle API errors
async function handleApiError(response: Response): Promise<never> {
  const error: ApiErrorResponse = await response.json();
  throw new PatchDBApiError(error.errorId, error.message ?? "Oops, something went wrong...");
}

// Authentication functions
export async function loginUser(username: string, password: string): Promise<AuthResponse> {
  const loginData: LoginRequest = { username, password };
  
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(loginData)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function registerUser(username: string, password: string): Promise<AuthResponse> {
  const registerData: RegisterRequest = { username, password };
  
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(registerData)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

// Patch API functions
export async function uploadPatch(userId: string, imageFile: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('image', imageFile);

  // For FormData, we need to get auth headers but exclude Content-Type
  const authHeaders = getAuthHeaders();
  delete authHeaders['Content-Type']; // Let the browser set the content-type with boundary

  const response = await fetch(`${API_BASE_URL}/${userId}/upload`, {
    method: 'POST',
    headers: authHeaders,
    body: formData
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function addPatchToGroup(userId: string, patchId: number, groupId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${userId}/group`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      patch_id: patchId,
      group_id: groupId
    })
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function createPatchGroup(userId: string, patchId: number, name: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${userId}/group`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      patch_id: patchId,
      name: name
    })
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function getUserPatches(userId: string): Promise<UserPatchesResponse> {
  const response = await fetch(`${API_BASE_URL}/${userId}/patches`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function deletePatch(userId: string, patchId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${userId}/patch/${patchId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function deletePatchGroup(userId: string, groupId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${userId}/group/${groupId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

// Favorite API functions
export async function addGroupToFavorites(userId: string, groupId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${userId}/group/${groupId}/favorite`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function removeGroupFromFavorites(userId: string, groupId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${userId}/group/${groupId}/favorite`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

// Format utilities
export function formatImagePath(path: string): string {
  // Convert relative path to absolute URL
  if (path.startsWith('./images/')) {
    return `${API_BASE_URL}/${path.substring(2)}`;
  }
  return `${API_BASE_URL}/images/${path}`;
}
