import { setFeatureEnabled } from '../utils/gameConfig';

/**
 * Initialise les configurations par défaut du jeu
 */
export async function initializeGameConfig() {
  try {
    // Configurations des mécaniques principales
    await setFeatureEnabled('boutique', true, 'Système de boutique pour acheter des items');
    await setFeatureEnabled('dragons', true, 'Système de dragons et créatures');
    await setFeatureEnabled('royaumes', true, 'Système de royaumes et territoires');
    await setFeatureEnabled('familles', true, 'Système de familles et alliances');
    await setFeatureEnabled('combat', true, 'Système de combat PvP');
    await setFeatureEnabled('diplomatie', true, 'Système de diplomatie entre royaumes');
    await setFeatureEnabled('economy', true, 'Système économique général');
    await setFeatureEnabled('daily', true, 'Récompenses quotidiennes');
    await setFeatureEnabled('payments', true, 'Système de paiements entre joueurs');
    await setFeatureEnabled('marriage', true, 'Système de mariage');

    console.log('✅ Configurations du jeu initialisées');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des configurations:', error);
  }
}