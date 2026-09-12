import { z } from 'zod';
import { Role } from './types';

export const SearchCertificateSchema = z.object({
  code: z
    .string()
    .min(5, 'El código debe tener al menos 5 caracteres')
    .max(50, 'El código no debe exceder 50 caracteres'),
});

export const VerifyTokenSchema = z.object({
  token: z.string().uuid('El token de verificación debe ser un UUID válido'),
});

export const LoginSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  totpCode: z.string().length(6, 'El código TOTP debe tener 6 dígitos').optional(),
});

export const MfaVerifySchema = z.object({
  totpCode: z.string().length(6, 'El código TOTP debe tener 6 dígitos'),
});

export const CreateCourseSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200),
  description: z.string().max(1000).optional(),
  institution: z.string().min(2, 'La institución es requerida').max(150),
  instructor: z.string().min(2, 'El instructor es requerido').max(150),
  date: z.string().or(z.date()),
  imageUrl: z.string().url('Debe ser una URL válida').optional().nullable(),
});

export const CreateParticipantSchema = z.object({
  fullName: z.string().min(3, 'El nombre completo debe tener al menos 3 caracteres').max(150),
  email: z.string().email('Correo inválido').optional().nullable(),
  internalDocument: z.string().max(50).optional().nullable(),
});

export const CreateCertificateSchema = z.object({
  participantName: z.string().min(3, 'El nombre del participante es requerido'),
  participantEmail: z.string().email().optional().nullable(),
  participantDocument: z.string().optional().nullable(),
  courseEventId: z.string().uuid('Debe seleccionar un curso válido'),
  issuedAt: z.string().or(z.date()).optional(),
  expiresAt: z.string().or(z.date()).optional().nullable(),
});

export const RevokeCertificateSchema = z.object({
  reason: z.string().min(5, 'Debe proporcionar un motivo claro de revocación').max(500),
});

export const CreateAdminUserSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  fullName: z.string().min(3, 'El nombre completo es requerido'),
  password: z
    .string()
    .min(10, 'La contraseña debe tener al menos 10 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula')
    .regex(/[0-9]/, 'Debe incluir al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe incluir al menos un caracter especial'),
  role: z.nativeEnum(Role),
});

export const UpdateSiteSettingsSchema = z.object({
  orgName: z.string().min(2, 'El nombre de la organización es requerido'),
  orgLogoUrl: z.string().url().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  socialLinks: z.record(z.string()).optional().nullable(),
});
