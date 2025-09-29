// API types for PatchDB

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
  userState: number;
  role: number;
  username: string;
  bio?: string;
  profilePictureUrl?: string;
  email?: string;
  phoneNumber?: string;
  created: string;
}

export interface AccessTokenModel {
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  method: number;
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

// Legacy User interface for backwards compatibility
export interface User {
  id: string;
  username: string;
}

export interface PatchImage {
  id: number;
  path: string;
}

export interface PatchGroup {
  id: number;
  name: string;
  images: PatchImage[];
  is_favorite: 0 | 1;
}

export interface UngroupedPatch {
  id: number;
  path: string;
}

export interface UserPatchesResponse {
  patches: PatchGroup[];
  ungrouped_patches: UngroupedPatch[];
}

export interface MatchResult {
  group_id: number;
  group_name: string;
  path: string;
  score: number;
  is_favorite: 0 | 1;
}

export interface UngroupedMatch {
  id: number;
  path: string;
  score: number;
}

export interface UploadResult {
  patch: {
    id: number;
    path: string;
  };
  matches?: MatchResult[];
  ungrouped_matches?: UngroupedMatch[];
}

export interface ApiError {
  error: string;
}
