import { prisma } from '../db/prisma';

/**
 * Récupère une configuration
 */
export async function getConfig(key: string, defaultValue: string = 'true'): Promise<string> {
  try {
    const config = await prisma.gameConfig.findUnique({
      where: { key },
    });
    return config?.value ?? defaultValue;
  } catch (error) {
    console.error('Erreur getConfig:', error);
    return defaultValue;
  }
}

/**
 * Définit une configuration
 */
export async function setConfig(key: string, value: string, description?: string, category: string = 'general'): Promise<void> {
  try {
    await prisma.gameConfig.upsert({
      where: { key },
      update: { value, description, category },
      create: { key, value, description, category },
    });
  } catch (error) {
    console.error('Erreur setConfig:', error);
    throw error;
  }
}

/**
 * Récupère toutes les configurations
 */
export async function getAllConfigs(): Promise<Array<{key: string, value: string, description?: string, category: string}>> {
  try {
    return await prisma.gameConfig.findMany({
      orderBy: { category: 'asc' },
    });
  } catch (error) {
    console.error('Erreur getAllConfigs:', error);
    return [];
  }
}

/**
 * Vérifie si une mécanique est activée
 */
export async function isFeatureEnabled(feature: string): Promise<boolean> {
  const value = await getConfig(`feature_${feature}`, 'true');
  return value.toLowerCase() === 'true';
}

/**
 * Active/désactive une mécanique
 */
export async function setFeatureEnabled(feature: string, enabled: boolean, description?: string): Promise<void> {
  await setConfig(`feature_${feature}`, enabled.toString(), description, 'features');
}