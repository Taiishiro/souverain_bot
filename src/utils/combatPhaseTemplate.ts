import { getMangaLayout } from './mangaLayout';

export function getCombatPhaseHtml({
  percentage,
  title,
  description,
  attackerName,
  defenderName,
  attackerPower,
  defenderPower,
  diffText,
}: {
  percentage: number;
  title: string;
  description: string;
  attackerName: string;
  defenderName: string;
  attackerPower?: number;
  defenderPower?: number;
  diffText?: string;
}): string {
  const css = `
    .phase-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 30px;
      padding: 0 40px;
    }
    .phase-header {
      font-size: 32px;
      color: #777;
      text-transform: uppercase;
      letter-spacing: 5px;
    }
    .phase-title {
      font-size: 48px;
    }
    .phase-desc {
      font-size: 24px;
      color: #ccc;
      line-height: 1.5;
      font-style: italic;
      max-width: 800px;
      margin: 20px 0;
    }

    .combatants-row {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 50px;
      width: 100%;
      margin: 20px 0;
    }
    .combatant {
      background: rgba(0,0,0,0.6);
      border: 2px solid #333;
      padding: 20px;
      width: 350px;
      border-radius: 4px;
    }
    .combatant-name {
      font-family: 'Cinzel', serif;
      font-size: 28px;
      color: #dfb15b;
      margin-bottom: 15px;
    }
    .combatant-power {
      font-size: 24px;
      font-weight: bold;
    }
    
    .versus {
      font-family: 'Cinzel', serif;
      font-size: 48px;
      color: #5c0000;
      text-shadow: 2px 2px 0 #000;
    }

    .diff-badge {
      background: #5c0000;
      color: white;
      padding: 10px 30px;
      font-family: 'Cinzel', serif;
      font-size: 20px;
      border: 2px solid #111;
      border-radius: 4px;
      letter-spacing: 2px;
    }

    .progress-wrapper {
      width: 80%;
      height: 20px;
      background: #111;
      border: 2px solid #444;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 40px;
      position: relative;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #5c0000, #cc0000);
      width: ${percentage}%;
      transition: width 0.5s;
    }
    .progress-text {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      font-size: 14px;
      font-weight: 900;
      color: #fff;
      text-shadow: 1px 1px 2px #000;
    }
  `;

  let extraHtml = '';
  if (attackerPower !== undefined && defenderPower !== undefined) {
    extraHtml = `
      <div class="combatants-row">
        <div class="combatant">
          <div class="combatant-name">🗡️ ${attackerName}</div>
          <div class="combatant-power stat-red">${attackerPower} pts</div>
        </div>
        <div class="versus">VS</div>
        <div class="combatant">
          <div class="combatant-name">🛡️ ${defenderName}</div>
          <div class="combatant-power stat-red">${defenderPower} pts</div>
        </div>
      </div>
      ${diffText ? `<div class="diff-badge">${diffText}</div>` : ''}
    `;
  }

  const html = `
    <div class="phase-container">
      <div class="phase-header">LES TAMBOURS DE GUERRE RÉSONNENT...</div>
      <div class="phase-title gold-title">${title}</div>
      ${extraHtml}
      <div class="phase-desc">"${description}"</div>
      
      <div class="progress-wrapper">
        <div class="progress-fill"></div>
        <div class="progress-text">${percentage}%</div>
      </div>
    </div>
  `;

  return getMangaLayout(css, html);
}
