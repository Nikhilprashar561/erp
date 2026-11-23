'use server';

import { prisma } from '@/lib/prisma';
import {
  CreateMasterCategorySchema,
  CreateMakingChargeSchema,
  type CreateMasterCategoryInput,
  type CreateMakingChargeInput,
} from '@/lib/validations/master.schema';
import { revalidatePath } from 'next/cache';

export async function getMasterDataAction() {
  try {
    const [categories, purities, makingCharges, jobTypes] = await Promise.all([
      prisma.masterCategory.findMany({ orderBy: { code: 'asc' } }),
      prisma.masterPurity.findMany({ orderBy: { code: 'desc' } }),
      prisma.masterMakingCharge.findMany({ include: { category: true } }),
      prisma.masterJobType.findMany({ orderBy: { jobType: 'asc' } }),
    ]);

    return {
      success: true,
      data: {
        categories: categories.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          desc: c.description || '—',
        })),
        purity: purities.map((p) => ({
          id: p.id,
          code: p.code,
          std: p.standard,
          use: p.useCase,
          pct: Number(p.purityPct),
        })),
        making: makingCharges.map((m) => ({
          id: m.id,
          cat: m.categoryTitle,
          rate: `₹ ${Number(m.ratePerGram).toLocaleString('en-IN')} / g`,
          min: `₹ ${Number(m.minimumCharge).toLocaleString('en-IN')}`,
          wastage: `${Number(m.standardWastage).toFixed(1)}%`,
        })),
        jobtypes: jobTypes.map((j) => ({
          id: j.id,
          type: j.jobType,
          desc: j.description,
        })),
        units: [
          { name: 'Gram', code: 'g', basis: 'Weight' },
          { name: 'Kilogram', code: 'kg', basis: 'Weight' },
          { name: 'Piece', code: 'pc', basis: 'Count' },
          { name: 'Set', code: 'set', basis: 'Count' },
        ],
      },
    };
  } catch (err: unknown) {
    console.error('Error fetching master data:', err);
    return { success: false, error: 'Failed to fetch master configuration' };
  }
}

export async function createMasterCategoryAction(input: CreateMasterCategoryInput) {
  try {
    const validated = CreateMasterCategorySchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Invalid category data' };
    }

    const { code, name, description } = validated.data;
    const existing = await prisma.masterCategory.findUnique({ where: { code } });
    if (existing) {
      return { success: false, error: `Category code ${code} already exists` };
    }

    const category = await prisma.masterCategory.create({
      data: {
        code,
        name,
        description: description || null,
      },
    });

    revalidatePath('/master');
    return { success: true, data: category };
  } catch (err: unknown) {
    console.error('Error creating category:', err);
    return { success: false, error: 'Failed to create category' };
  }
}

export async function createMakingChargeAction(input: CreateMakingChargeInput) {
  try {
    const validated = CreateMakingChargeSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Invalid making charge data' };
    }

    const { categoryId, categoryTitle, ratePerGram, minimumCharge, standardWastage } = validated.data;

    const charge = await prisma.masterMakingCharge.create({
      data: {
        categoryId,
        categoryTitle,
        ratePerGram,
        minimumCharge,
        standardWastage,
      },
    });

    revalidatePath('/master');
    return { success: true, data: charge };
  } catch (err: unknown) {
    console.error('Error creating making charge:', err);
    return { success: false, error: 'Failed to create making charge rule' };
  }
}
