'use server';

import { prisma } from '@/lib/prisma';
import {
  UpdateCompanyProfileSchema,
  UpdateMcxRateSchema,
  type UpdateCompanyProfileInput,
  type UpdateMcxRateInput,
} from '@/lib/validations/settings.schema';
import { revalidatePath } from 'next/cache';

export async function getCompanyProfileAction() {
  try {
    let profile = await prisma.companyProfile.findFirst();
    if (!profile) {
      profile = await prisma.companyProfile.create({
        data: {
          name: 'Kothari Silver Industries Pvt. Ltd.',
          proprietor: 'Rakesh Kothari',
          location: 'Surat, Gujarat',
          gstNumber: '24AABCK1234F1Z5',
          udyamNumber: 'UDYAM-GJ-12-0012345',
          mcxRateBase: 89000.0,
          autoBills: true,
          twoFactorAuth: false,
        },
      });
    }

    return {
      success: true,
      data: {
        id: profile.id,
        name: profile.name,
        proprietor: profile.proprietor,
        location: profile.location,
        gstNumber: profile.gstNumber,
        udyamNumber: profile.udyamNumber,
        mcxRateBase: Number(profile.mcxRateBase),
        autoBills: profile.autoBills,
        twoFactorAuth: profile.twoFactorAuth,
      },
    };
  } catch (err: unknown) {
    console.error('Error fetching company profile:', err);
    return { success: false, error: 'Failed to fetch company profile' };
  }
}

export async function updateCompanyProfileAction(input: UpdateCompanyProfileInput) {
  try {
    const validated = UpdateCompanyProfileSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Invalid profile settings' };
    }

    const { name, proprietor, location, gstNumber, udyamNumber, mcxRateBase, autoBills, twoFactorAuth } =
      validated.data;

    const existing = await prisma.companyProfile.findFirst();
    if (existing) {
      await prisma.companyProfile.update({
        where: { id: existing.id },
        data: {
          name,
          proprietor,
          location,
          gstNumber,
          udyamNumber,
          mcxRateBase,
          autoBills,
          twoFactorAuth,
        },
      });
    } else {
      await prisma.companyProfile.create({
        data: {
          name,
          proprietor,
          location,
          gstNumber,
          udyamNumber,
          mcxRateBase,
          autoBills,
          twoFactorAuth,
        },
      });
    }

    revalidatePath('/settings');
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    console.error('Error updating company profile:', err);
    return { success: false, error: 'Failed to update company profile' };
  }
}

export async function updateMcxRateAction(input: UpdateMcxRateInput) {
  try {
    const validated = UpdateMcxRateSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Invalid rate' };
    }

    const existing = await prisma.companyProfile.findFirst();
    if (existing) {
      await prisma.companyProfile.update({
        where: { id: existing.id },
        data: { mcxRateBase: validated.data.rate },
      });
    }

    revalidatePath('/settings');
    revalidatePath('/');
    return { success: true, rate: validated.data.rate };
  } catch (err: unknown) {
    console.error('Error updating MCX rate:', err);
    return { success: false, error: 'Failed to update MCX spot rate' };
  }
}
