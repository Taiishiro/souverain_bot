#!/bin/bash

# Script de démarrage du Bot Souverain avec redémarrage automatique

cd /home/taishicorp/souverain_bot

RESTART_COUNT=0
MAX_RESTARTS=10
RESTART_DELAY=3

echo "🚀 Démarrage du Bot Souverain..."
echo "=================================================="

while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
  RESTART_COUNT=$((RESTART_COUNT + 1))
  
  if [ $RESTART_COUNT -gt 1 ]; then
    echo ""
    echo "⚠️  Redémarrage #$RESTART_COUNT du bot..."
    echo "Attente de $RESTART_DELAY secondes avant relance..."
    sleep $RESTART_DELAY
  fi
  
  echo "🔄 Lancement du bot..."
  npm run dev
  
  EXIT_CODE=$?
  
  if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ Le bot s'est arrêté avec le code: $EXIT_CODE"
    
    if [ $RESTART_COUNT -lt $MAX_RESTARTS ]; then
      echo "🔁 Redémarrage automatique..."
    else
      echo "❌ Nombre maximum de redémarrages atteint ($MAX_RESTARTS)"
      echo "⛔ Arrêt définitif"
      exit 1
    fi
  else
    echo ""
    echo "✅ Bot arrêté correctement"
    exit 0
  fi
done
