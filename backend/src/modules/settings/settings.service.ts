import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.siteSetting.findUnique({ where: { id: '1' } });
    if (!settings) {
      settings = await this.prisma.siteSetting.create({
        data: {
          id: '1',
          orgName: 'CONSULTANCY ORGANIZATIONAL LLC',
          orgLogoUrl: '/consultancy-logo.png',
          coachName: 'Deisy Barrera',
          coachTitle: 'Executive Coach & Mentora Organizacional',
          coachBio: 'Especialista en desarrollo institucional, liderazgo ejecutivo e inteligencia comunicacional con trayectoria acompañando a profesionales e instituciones.',
          coachAvatarUrl: '/deisy-barrera.jpg',
          contactEmail: 'contacto@consultancyorganizational.com',
          contactPhone: '+1 (555) 019-2834',
          whatsapp: '+1 (555) 019-2834',
          address: 'Av. Principal #100, Centro Corporativo',
          socialLinks: {
            facebook: 'https://facebook.com',
            linkedin: 'https://linkedin.com',
            twitter: 'https://twitter.com',
            instagram: 'https://instagram.com',
          },
        },
      });
    }
    return settings;
  }

  async updateSettings(data: {
    orgName?: string;
    orgLogoUrl?: string | null;
    coachName?: string | null;
    coachTitle?: string | null;
    coachBio?: string | null;
    coachAvatarUrl?: string | null;
    coachSpecialties?: any;
    contactEmail?: string | null;
    contactPhone?: string | null;
    whatsapp?: string | null;
    address?: string | null;
    socialLinks?: any;
  }) {
    await this.getSettings(); // asegura inicialización

    return this.prisma.siteSetting.update({
      where: { id: '1' },
      data: {
        ...(data.orgName ? { orgName: data.orgName.trim() } : {}),
        ...(data.orgLogoUrl !== undefined ? { orgLogoUrl: data.orgLogoUrl } : {}),
        ...(data.coachName !== undefined ? { coachName: data.coachName?.trim() } : {}),
        ...(data.coachTitle !== undefined ? { coachTitle: data.coachTitle?.trim() } : {}),
        ...(data.coachBio !== undefined ? { coachBio: data.coachBio?.trim() } : {}),
        ...(data.coachAvatarUrl !== undefined ? { coachAvatarUrl: data.coachAvatarUrl } : {}),
        ...(data.coachSpecialties !== undefined ? { coachSpecialties: data.coachSpecialties } : {}),
        ...(data.contactEmail !== undefined ? { contactEmail: data.contactEmail?.trim() } : {}),
        ...(data.contactPhone !== undefined ? { contactPhone: data.contactPhone?.trim() } : {}),
        ...(data.whatsapp !== undefined ? { whatsapp: data.whatsapp?.trim() } : {}),
        ...(data.address !== undefined ? { address: data.address?.trim() } : {}),
        ...(data.socialLinks !== undefined ? { socialLinks: data.socialLinks } : {}),
      },
    });
  }
}
