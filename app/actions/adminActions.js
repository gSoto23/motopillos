"use server";
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAdminConfig() {
  try {
    let config = await prisma.appConfiguration.findFirst({
      where: { key: 'GLOBAL_CONFIG' }
    });
    
    // Seed default config if empty
    if (!config) {
      config = await prisma.appConfiguration.create({
        data: {
          key: 'GLOBAL_CONFIG',
          marginMultiplier: 1.25,
          baseShippingCost: 15.00,
          exchangeRate: 515.0,
          sinpePhone: '8888-8888',
          sinpeName: 'Motopillos',
          transferAccount: 'CR12015201001234567890',
          transferName: 'Motopillos S.A.'
        }
      });
    }
    return config;
  } catch (error) {
    console.error("Prisma error getting config:", error);
    return { marginMultiplier: 1.25, baseShippingCost: 15.0 };
  }
}

export async function saveAdminConfig(marginMultiplier, baseShippingCost, exchangeRate, sinpePhone, sinpeName, transferAccount, transferName) {
  try {
    await prisma.appConfiguration.upsert({
      where: { key: 'GLOBAL_CONFIG' },
      update: {
        marginMultiplier,
        baseShippingCost,
        exchangeRate,
        sinpePhone,
        sinpeName,
        transferAccount,
        transferName
      },
      create: {
        key: 'GLOBAL_CONFIG',
        marginMultiplier,
        baseShippingCost,
        exchangeRate,
        sinpePhone,
        sinpeName,
        transferAccount,
        transferName
      }
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Prisma error saving config:", error);
    return { success: false, error: error.message };
  }
}
// Cache bust triggered to fix Next.js lazy compile bug
