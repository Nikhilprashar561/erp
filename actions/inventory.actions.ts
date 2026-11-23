'use server';

import { prisma } from '@/lib/prisma';
import { CreateInventoryItemSchema, type CreateInventoryItemInput } from '@/lib/validations/inventory.schema';
import { InventoryStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getInventoryItemsAction() {
  try {
    const [items, categories, purities] = await Promise.all([
      prisma.inventoryItem.findMany({
        include: {
          category: { select: { id: true, code: true, name: true } },
          purity: { select: { id: true, code: true, standard: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.masterCategory.findMany({ select: { id: true, code: true, name: true } }),
      prisma.masterPurity.findMany({ select: { id: true, code: true, standard: true } }),
    ]);

    const formattedItems = items.map((it) => ({
      id: it.id,
      sku: it.sku,
      cat: it.category.name,
      catCode: it.category.code,
      purity: it.purity.standard.split(' ')[0] || it.purity.code,
      pieces: it.pieces,
      gross: Number(it.grossWeight),
      fine: Number(it.fineWeight),
      loc: it.location,
      status: it.status === InventoryStatus.IN_STOCK ? 'in' : it.status === InventoryStatus.LOW ? 'low' : 'reorder',
    }));

    return {
      success: true,
      data: {
        items: formattedItems,
        categories,
        purities,
      },
    };
  } catch (err: unknown) {
    console.error('Error fetching inventory items:', err);
    return { success: false, error: 'Failed to fetch inventory from database' };
  }
}

export async function createInventoryItemAction(input: CreateInventoryItemInput) {
  try {
    const validated = CreateInventoryItemSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Invalid inventory data' };
    }

    const { sku, categoryId, purityId, pieces, grossWeight, fineWeight, location, status } = validated.data;

    // Check duplicate SKU
    const existing = await prisma.inventoryItem.findUnique({ where: { sku } });
    if (existing) {
      return { success: false, error: `SKU ${sku} already exists` };
    }

    const item = await prisma.inventoryItem.create({
      data: {
        sku,
        categoryId,
        purityId,
        pieces,
        grossWeight,
        fineWeight,
        location,
        status: status as InventoryStatus,
      },
      include: {
        category: true,
        purity: true,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        message: `New inventory SKU ${item.sku} added · ${item.pieces} pc · ${Number(item.grossWeight).toFixed(3)} g`,
        timeDisplay: 'Just now',
        tagColor: '#4ADE80',
        referenceNo: item.sku,
      },
    });

    revalidatePath('/inventory');
    revalidatePath('/wheresilver');

    return {
      success: true,
      data: {
        id: item.id,
        sku: item.sku,
        cat: item.category.name,
        purity: item.purity.standard.split(' ')[0] || item.purity.code,
        pieces: item.pieces,
        gross: Number(item.grossWeight),
        fine: Number(item.fineWeight),
        loc: item.location,
        status: item.status === InventoryStatus.IN_STOCK ? 'in' : item.status === InventoryStatus.LOW ? 'low' : 'reorder',
      },
    };
  } catch (err: unknown) {
    console.error('Error creating inventory item:', err);
    return { success: false, error: 'Failed to create inventory SKU' };
  }
}

export async function auditStockAction() {
  try {
    const aggregate = await prisma.inventoryItem.aggregate({
      _sum: {
        grossWeight: true,
        fineWeight: true,
        pieces: true,
      },
      _count: {
        id: true,
      },
    });

    const totalFine = Number(aggregate._sum.fineWeight || 0);

    await prisma.activityLog.create({
      data: {
        message: `Stock audit verified · Total fine silver: ${totalFine.toFixed(3)} g across ${aggregate._count.id} SKUs`,
        timeDisplay: 'Just now',
        tagColor: '#60A5FA',
        referenceNo: 'AUDIT',
      },
    });

    revalidatePath('/inventory');

    return {
      success: true,
      data: {
        totalFine,
        totalGross: Number(aggregate._sum.grossWeight || 0),
        totalPieces: aggregate._sum.pieces || 0,
        skuCount: aggregate._count.id,
      },
    };
  } catch (err: unknown) {
    console.error('Error auditing stock:', err);
    return { success: false, error: 'Failed to audit stock' };
  }
}
