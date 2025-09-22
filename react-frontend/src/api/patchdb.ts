// PatchDB API functions
import type {
  User,
  UserPatchesResponse,
  UploadResult,
  ApiError
} from './types';

// API Configuration
// const API_BASE_URL = `${window.location.origin}/patchdb/api`;
const API_BASE_URL = `http://localhost:5000`;


class PatchDBApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PatchDBApiError';
  }
}

// Authentication functions
export async function loginUser(username: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username })
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new PatchDBApiError(error.error || 'Login failed');
  }

  return await response.json();
}

// Patch API functions
export async function uploadPatch(userId: string, imageFile: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE_URL}/${userId}/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new PatchDBApiError(error.error || 'Upload failed');
  }

  return await response.json();
}

export async function addPatchToGroup(userId: string, patchId: number, groupId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${userId}/group`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      patch_id: patchId,
      group_id: groupId
    })
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new PatchDBApiError(error.error || 'Failed to add patch to group');
  }

  return await response.json();
}

export async function createPatchGroup(userId: string, patchId: number, name: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${userId}/group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      patch_id: patchId,
      name: name
    })
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new PatchDBApiError(error.error || 'Failed to create patch group');
  }

  return await response.json();
}

export async function getUserPatches(userId: string): Promise<UserPatchesResponse> {
  const response = await fetch(`${API_BASE_URL}/${userId}/patches`);

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new PatchDBApiError(error.error || 'Failed to fetch patches');
  }

  return await response.json();
}

export async function deletePatch(userId: string, patchId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${userId}/patch/${patchId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new PatchDBApiError(error.error || 'Failed to delete patch');
  }

  return await response.json();
}

export async function deletePatchGroup(userId: string, groupId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${userId}/group/${groupId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new PatchDBApiError(error.error || 'Failed to delete patch group');
  }

  return await response.json();
}

// Favorite API functions
export async function addGroupToFavorites(userId: string, groupId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${userId}/group/${groupId}/favorite`, {
    method: 'PUT'
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new PatchDBApiError(error.error || 'Failed to add group to favorites');
  }

  return await response.json();
}

export async function removeGroupFromFavorites(userId: string, groupId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${userId}/group/${groupId}/favorite`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new PatchDBApiError(error.error || 'Failed to remove group from favorites');
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
