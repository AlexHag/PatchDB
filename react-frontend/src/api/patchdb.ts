// PatchDB API functions
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiErrorResponse,
  GetUserPatchesResponse,
  PatchUploadResponse,
  UserPatchModel,
  FileUploadUrlResponse,
  UserResponse,
  PublicUserResponse,
  UpdateBioRequest,
  UpdateProfilePictureRequest,
  UpdateUserUniversityInfoRequest,
  UniversityAndProgramModel,
  UniversityModel,
  UploadPatchRequest,
  PatchSubmittionResponse,
  UpdatePatchSubmissionRequest,
  PatchResponse,
  PaginationResponse,
  SearchPatchRequest,
  SearchUserRequest
} from './types';
import { getAuthHeaders } from './auth';

// API Configuration
// const API_BASE_URL = `http://localhost:5001/api`;
const API_BASE_URL = `${window.location.origin}/api`;

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

export async function getUserPatches(): Promise<GetUserPatchesResponse> {
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

// Patch detail function
export async function getPatchDetail(patchNumber: number): Promise<PatchResponse> {
  const response = await fetch(`${API_BASE_URL}/patches/${patchNumber}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

// Admin/Moderator functions
export async function getUnpublishedPatchSubmissions(skip = 0, take = 20): Promise<PaginationResponse<PatchSubmittionResponse>> {
  const response = await fetch(`${API_BASE_URL}/patch-submittion/unpublished?skip=${skip}&take=${take}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

// Browse patches functions
export async function getPatches(skip = 0, take = 20): Promise<PaginationResponse<PatchResponse>> {
  const response = await fetch(`${API_BASE_URL}/patches?skip=${skip}&take=${take}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function searchPatches(request: SearchPatchRequest): Promise<PaginationResponse<PatchResponse>> {
  const response = await fetch(`${API_BASE_URL}/patches/search`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

// Public profile functions
export async function getUserById(userId: string): Promise<PublicUserResponse> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function getUserPatchesById(userId: string): Promise<GetUserPatchesResponse> {
  const response = await fetch(`${API_BASE_URL}/user-patches/${userId}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

// User search function
export async function searchUsers(request: SearchUserRequest): Promise<PublicUserResponse[]> {
  const response = await fetch(`${API_BASE_URL}/user/search`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

// Follow/unfollow functions
export async function followUser(userId: string): Promise<PublicUserResponse> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/follow`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function unfollowUser(userId: string): Promise<PublicUserResponse> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/follow`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

// Followers and Following functions
export async function getUserFollowers(userId: string, skip = 0, take = 20): Promise<PaginationResponse<PublicUserResponse>> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/followers?skip=${skip}&take=${take}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

export async function getUserFollowing(userId: string, skip = 0, take = 20): Promise<PaginationResponse<PublicUserResponse>> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/following?skip=${skip}&take=${take}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}