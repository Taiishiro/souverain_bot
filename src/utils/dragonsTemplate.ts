import { getMangaLayout } from './mangaLayout';

export function getDragonsHtml({
  username,
  avatarUrl,
  dragons,
}: {
  username: string;
  avatarUrl: string;
  dragons: {
    nom: string;
    tiers: string;
    niveau: number;
    puissance: number;
    etat: string;
    faim: number;
    energie: number;
    age: number;
  }[];
}): string {
  
  const dragonCards = dragons.map(d => {
    const isSkeleton = d.etat === 'Squelette';
    const bgColor = isSkeleton ? 'rgba(50,50,50,0.8)' : 'rgba(0,0,0,0.9)';
    const borderColor = isSkeleton ? '#555' : '#8B0000';
    const nameColor = isSkeleton ? '#888' : '#FFF';
    
    const getBarColor = (val: number, type: 'faim' | 'energie') => {
      if (val > 50) return type === 'faim' ? '#B8860B' : '#E0E0E0';
      if (val > 20) return '#8B0000';
      return '#FF0000';
    };

    const faimColor = isSkeleton ? '#555' : getBarColor(d.faim, 'faim');
    const energieColor = isSkeleton ? '#555' : getBarColor(d.energie, 'energie');

    return `
      <div class="dragon-card" style="background: ${bgColor}; border-top: 5px solid ${borderColor};">
        <div class="dragon-name" style="color: ${nameColor};">
          ${isSkeleton ? '🦴' : '🐉'} ${d.nom} 
          <span class="tiers">T${d.tiers.replace('T', '')} | NV.${d.niveau}</span>
        </div>
        
        <div class="stats-row">
          <div class="stat-item">⚔️ ${d.puissance}</div>
          <div class="stat-item">⏳ ${d.age}j</div>
          <div class="stat-item" style="color: ${isSkeleton ? '#aaa' : '#B8860B'}">${d.etat}</div>
        </div>

        <div class="bars">
          <div class="bar-row">
            <span>Faim : ${d.faim}</span>
            <div class="bar-bg"><div class="bar-fill" style="width: ${d.faim}%; background: ${faimColor};"></div></div>
          </div>
          <div class="bar-row">
            <span>Éner : ${d.energie}</span>
            <div class="bar-bg"><div class="bar-fill" style="width: ${d.energie}%; background: ${energieColor};"></div></div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const css = `
    .main-container {
      width: 100%;
      height: auto;
      display: flex;
      flex-direction: column;
      padding: 30px 40px;
      box-sizing: border-box;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 30px;
      margin-bottom: 20px;
      background: rgba(10,10,10,0.9);
      padding: 20px;
      border: 4px solid #000;
      box-shadow: 10px 10px 0px rgba(139,0,0,0.8);
      transform: skewX(-2deg);
      z-index: 10;
    }
    .avatar-bruh {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 20%;
      border: 4px solid #fff;
    }
    .title-box {
      display: flex;
      flex-direction: column;
    }
    .main-title {
      font-size: 2.5em;
      line-height: 1;
      margin: 0;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 1.2em;
      color: #999;
      font-weight: 900;
      margin-top: 5px;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      flex: 1;
      align-content: start;
    }
    
    .dragon-card {
      padding: 15px;
      border: 4px solid #000;
      box-shadow: 6px 6px 0px #050505;
      transform: skewX(-3deg);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .dragon-name {
      font-size: 1.4em;
      font-weight: 900;
      text-transform: uppercase;
      border-bottom: 2px dashed #555;
      padding-bottom: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tiers {
      background: #8B0000;
      color: #FFF;
      padding: 2px 8px;
      font-size: 0.6em;
      border-radius: 4px;
    }
    .stats-row {
      display: flex;
      justify-content: space-between;
      font-weight: 900;
      font-size: 1em;
      color: #ccc;
    }
    .bars {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .bar-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9em;
      font-weight: bold;
    }
    .bar-row span {
      width: 80px;
    }
    .bar-bg {
      flex: 1;
      height: 15px;
      background: #222;
      border: 2px solid #000;
      position: relative;
    }
    .bar-fill {
      height: 100%;
    }
    .empty-message {
      text-align: center;
      font-size: 2em;
      font-weight: 900;
      color: #888;
      margin-top: 50px;
      transform: skewX(-5deg);
    }
  `;

  const html = `
    <div class="main-container">
      <div class="header">
        <img src="${avatarUrl}" alt="Avatar" class="avatar-bruh" crossorigin="anonymous" />
        <div class="title-box">
          <h1 class="main-title manga-glow">Antres de ${username}</h1>
          <div class="subtitle">MAÎTRE DE ${dragons.length} CRÉATURE(S)</div>
        </div>
      </div>

      ${dragons.length > 0 ? `<div class="grid">${dragonCards}</div>` : `<div class="empty-message">🦴 L'Antre est vide.</div>`}
    </div>
  `;

  return getMangaLayout(css, html);
}
