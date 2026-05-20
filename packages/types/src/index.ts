// M-SHARED-TYPES — Conduit shared type definitions
// 후속 이슈 sm-shared-types에서 User·Article·Comment·Profile·Tag 타입 본격 채움.
// 본 commit (#2)은 workspace 골격만.

export const SHARED_TYPES_VERSION = '0.1.0' as const;

export type Empty = Record<string, never>;
