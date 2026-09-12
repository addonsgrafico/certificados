export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  AUDITOR = 'AUDITOR',
}

export enum CertificateStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
  ARCHIVED = 'ARCHIVED',
}

export enum SecurityEventType {
  FAILED_LOGIN = 'FAILED_LOGIN',
  SUSPICIOUS_SEARCH = 'SUSPICIOUS_SEARCH',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  PATH_TRAVERSAL_ATTEMPT = 'PATH_TRAVERSAL_ATTEMPT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INVALID_FILE_UPLOAD = 'INVALID_FILE_UPLOAD',
  MFA_FAILURE = 'MFA_FAILURE',
}

export interface AdminUserPublic {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  mfaEnabled: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface CertificatePublicVerification {
  isValid: boolean;
  status: CertificateStatus;
  publicId: string;
  participantName: string;
  courseName: string;
  institution: string;
  instructor: string;
  issuedAt: string;
  expiresAt?: string | null;
  revokedAt?: string | null;
  revocationReason?: string | null;
}

export interface CertificateSearchResult {
  success: boolean;
  certificate?: {
    publicId: string;
    participantName: string;
    courseName: string;
    issuedAt: string;
    expiresAt?: string | null;
    status: CertificateStatus;
    codeLastFour: string;
  };
  downloadTicket?: string; // Ticket temporal de 1-5 mins
  message?: string;
}

export interface SiteSettingsDto {
  orgName: string;
  orgLogoUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  socialLinks?: Record<string, string> | null;
}
