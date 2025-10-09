// PatchDB API functions
import type {
  UserPatchesResponse,
  UploadResult,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiErrorResponse,
  GetUserPatchesResponse,
  PatchUploadResponse,
  UserPatchModel,
  FileUploadUrlResponse,
  UserResponse,
  UpdateBioRequest,
  UpdateProfilePictureRequest,
  UpdateUserUniversityInfoRequest,
  UniversityAndProgramModel,
  UniversityModel,
  UploadPatchRequest,
  PatchSubmittionResponse,
  UpdatePatchSubmissionRequest
} from './types';
import { getAuthHeaders } from './auth';

// API Configuration
// For development, use the local C# backend
const API_BASE_URL = (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
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

// NEW API FUNCTIONS for updated backend

// File service functions
export async function getFileUploadUrl(): Promise<FileUploadUrlResponse> {
  const response = await fetch(`${API_BASE_URL}/file-service/upload-url`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

// New user patch functions
export async function uploadPatchWithFileId(fileId: string): Promise<PatchUploadResponse> {
  const response = await fetch(`${API_BASE_URL}/user-patches/upload/${fileId}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function confirmPatchMatch(
  userPatchUploadId: string, 
  matchingPatchNumber: number
): Promise<UserPatchModel> {
  const response = await fetch(
    `${API_BASE_URL}/user-patches/${userPatchUploadId}/matching-patch-number/${matchingPatchNumber}`, 
    {
      method: 'PATCH',
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function getNewUserPatches(): Promise<GetUserPatchesResponse> {
  const response = await fetch(`${API_BASE_URL}/user-patches`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

// Profile API functions

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/user`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function updateUserBio(bio: string): Promise<UserResponse> {
  const request: UpdateBioRequest = { bio };
  
  const response = await fetch(`${API_BASE_URL}/user/bio`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function updateUserProfilePicture(fileId: string): Promise<UserResponse> {
  const request: UpdateProfilePictureRequest = { fileId };
  
  const response = await fetch(`${API_BASE_URL}/user/profile-picture`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function removeUserProfilePicture(): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/user/profile-picture`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function updateUserUniversityInfo(universityCode?: string, universityProgram?: string): Promise<UserResponse> {
  const request: UpdateUserUniversityInfoRequest = { 
    universityCode, 
    universityProgram 
  };
  
  const response = await fetch(`${API_BASE_URL}/user/university-information`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function getUniversitiesAndPrograms(): Promise<UniversityAndProgramModel[]> {
  const response = await fetch(`${API_BASE_URL}/universities/programs`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function getUniversities(): Promise<UniversityModel[]> {
  const response = await fetch(`${API_BASE_URL}/universities`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

// Patch submission functions
export async function submitPatch(request: UploadPatchRequest): Promise<PatchSubmittionResponse> {
  const response = await fetch(`${API_BASE_URL}/patch-submittion/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function getPatchSubmission(patchSubmittionId: string): Promise<PatchSubmittionResponse> {
  const response = await fetch(`${API_BASE_URL}/patch-submittion/${patchSubmittionId}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function updatePatchSubmission(request: UpdatePatchSubmissionRequest): Promise<PatchSubmittionResponse> {
  const response = await fetch(`${API_BASE_URL}/patch-submittion/update`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}
