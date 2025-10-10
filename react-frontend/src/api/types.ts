// API types for PatchDB - Updated to match new backend schema

// Authentication types from swagger.json
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface UserResponse {
  id: string;
  userState: 'Unknown' | 'Active' | 'Locked' | 'Banned' | 'Deleted';
  role: 'Unknown' | 'User' | 'PatchMaker' | 'Moderator' | 'Admin';
  username: string;
  bio?: string;
  profilePictureUrl?: string;
  email?: string;
  phoneNumber?: string;
  universityName?: string;
  universityLogoUrl?: string;
  universityProgram?: string;
  created: string;
}

export interface AccessTokenModel {
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  method: 'Password';
  expirationTime: string;
  issuedAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  credentials: AccessTokenModel;
}

export interface ApiErrorResponse {
  message: string;
  errorId: string;
}

// File upload types
export interface FileUploadUrlResponse {
  fileId: string;
  url: string;
}

export interface PatchResponse {
  patchNumber: number;
  imageUrl: string;
  name?: string;
  description?: string;
  patchMaker?: string;
  university?: {
    code: string;
    name: string;
    logoUrl: string;
  };
  universitySection?: string;
  releaseDate?: string;
  patchSubmissionId: string;
  created: string;
  updated?: string;
}

export interface UserPatchUploadModel {
  userPatchUploadId: string;
  imageUrl: string;
  created: string;
}

export interface UserPatchModel {
  userPatchId: string;
  matchingPatch: PatchResponse;
  uploads: UserPatchUploadModel[];
  isFavorite: boolean;
  aquiredAt: string;
}

export interface GetUserPatchesResponse {
  patches: UserPatchModel[];
  unmatchesPatches: UserPatchUploadModel[];
}

export interface OwnedMatchingPatchesModel {
  userPatchId: string;
  matchingPatch: PatchResponse;
  uploads: UserPatchUploadModel[];
  isFavorite: boolean;
  aquiredAt: string;
  similarity: number;
}

export interface NewMatchingPatchesModel extends PatchResponse {
  similarity: number;
}

export interface PatchUploadResponse {
  ownedMatchingPatches: OwnedMatchingPatchesModel[];
  newMatchingPatches: NewMatchingPatchesModel[];
  upload: UserPatchUploadModel;
}

// Profile management types
export interface UpdateBioRequest {
  bio: string;
}

export interface UpdateProfilePictureRequest {
  fileId: string;
}

export interface UpdateUserUniversityInfoRequest {
  universityCode?: string;
  universityProgram?: string;
}

// University types
export interface UniversityProgramModel {
  frontendName: string;
  name: string;
}

export interface UniversityModel {
  code: string;
  name: string;
  logoUrl: string;
}

export interface UniversityAndProgramModel extends UniversityModel {
  programs: UniversityProgramModel[];
}

// Patch submission types
export interface UploadPatchRequest {
  fileId: string;
  name?: string;
  description?: string;
  patchMaker?: string;
  universityCode?: string;
  universitySection?: string;
  releaseDate?: string;
}

export interface PatchSubmittionResponse {
  patchSubmittionId: string;
  patchNumber?: number;
  name?: string;
  description?: string;
  patchMaker?: string;
  university?: {
    code: string;
    name: string;
    logoUrl: string;
  };
  universitySection?: string;
  releaseDate?: string;
  imageUrl: string;
  status: string;
  uploadedByUserId: string;
  lastUpdatedByUserId?: string;
  created: string;
  updated?: string;
}

export interface UpdatePatchSubmissionRequest {
  id: string;
  name?: string;
  description?: string;
  patchMaker?: string;
  universityCode?: string;
  universitySection?: string;
  releaseDate?: string;
  status?: string;
}

// Patch submission status enum
export enum PatchSubmissionStatus {
  Unknown = 0,
  Pending = 10,
  Accepted = 20,
  Rejected = 30,
  Duplicate = 40,
  Deleted = 50
}

// Generic pagination response
export interface PaginationResponse<T> {
  count: number;
  items: T[];
}