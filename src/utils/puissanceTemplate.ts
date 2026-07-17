import { getMangaLayout } from './mangaLayout';

export function getPuissanceHtml({
  username,
  avatarUrl,
  dragonsVivants,
  dragonsSquelettes,
  puines,
  totalPower
}: {
  username: string;
  avatarUrl: string;
  dragonsVivants: number;
  dragonsSquelettes: number;
  puines: number;
  totalPower: number | string;
}): string {
  const css = `
    .main-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0;
      box-sizing: border-box;
      gap: 30px;
    }
    
    /* Top Name Plate (Tarnished Gold) */
    .top-nameplate {
      background: linear-gradient(to bottom, #d4af37, #8a7322); /* Or terni */
      border: 3px solid #3c2a05;
      box-shadow: 
        0 8px 15px rgba(0,0,0,0.8),
        inset 0px 2px 5px rgba(255,255,255,0.4),
        inset 0px -4px 10px rgba(0,0,0,0.5);
      border-radius: 4px;
      padding: 10px 40px;
      font-family: 'Cinzel', serif;
      font-size: 2.8em;
      font-weight: 900;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 5px;
      text-shadow: 1px 1px 0px rgba(255,255,255,0.3);
      position: relative;
      z-index: 20;
    }

    /* Red Braided Cords connecting nameplate to portrait */
    .cords-container {
      display: flex;
      justify-content: space-between;
      width: 220px;
      margin-top: -15px;
      margin-bottom: -15px;
      z-index: 15;
    }
    .cord {
      width: 8px;
      height: 40px;
      background: repeating-linear-gradient(45deg, #8B0000, #8B0000 4px, #500000 4px, #500000 8px);
      border-left: 1px solid #222;
      border-right: 1px solid #222;
      box-shadow: 2px 0 5px rgba(0,0,0,0.8);
      position: relative;
    }
    .cord::after {
      /* Aglet en métal sombre */
      content: "";
      position: absolute;
      bottom: -4px; left: -2px; right: -2px;
      height: 10px;
      background: linear-gradient(to right, #444, #111, #444);
      border-radius: 2px;
      border: 1px solid #000;
    }

    /* Inner Card Layout */
    .card-body {
      display: flex;
      flex-direction: row;
      gap: 50px;
      width: 100%;
      align-items: center;
      justify-content: center;
    }

    /* Left: Portrait */
    .portrait-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .avatar-clean {
      width: 280px;
      height: 350px;
      object-fit: cover;
      border: 6px solid #1a1a1a; /* Fer forgé sombre */
      border-radius: 4px;
      box-shadow: 
        0 0 0 4px #5c0000, /* Incrustation laque rouge */
        10px 10px 20px rgba(0,0,0,0.9),
        inset 0 0 20px rgba(0,0,0,0.5);
      filter: contrast(115%) saturate(110%);
    }

    /* Class/Name strip */
    .class-strip {
      background: linear-gradient(to right, #1a1a1a, #2a2a2a, #1a1a1a); /* Métal sombre usé */
      border: 2px solid #111;
      border-top: none;
      box-shadow: 0 5px 10px rgba(0,0,0,0.8);
      padding: 8px 30px;
      margin-top: -10px;
      z-index: 10;
      border-radius: 0 0 4px 4px;
    }
    .class-strip-text {
      font-family: 'Cinzel', serif;
      font-size: 1.2em;
      color: #dfb15b; /* Or propre */
      letter-spacing: 4px;
      font-weight: 700;
      text-transform: uppercase;
      text-shadow: 1px 1px 2px #000;
    }

    /* Right: Stats */
    .stats-panel {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 400px;
    }

    /* Primary Stat (Puissance) */
    .primary-stat-box {
      background: linear-gradient(135deg, #7a0000 0%, #300000 100%);
      border: 4px solid #111; /* Cadre en fer sombre précis */
      border-radius: 6px;
      box-shadow: 
        inset 1px 1px 0px rgba(255,100,100,0.3), /* Biseau structurel */
        inset -2px -2px 5px rgba(0,0,0,0.6),
        8px 8px 15px rgba(0,0,0,0.8);
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 15px 25px;
      position: relative;
      overflow: hidden;
    }
    
    .primary-stat-box::before {
      /* Crossed swords icon watermark / design */
      content: "⚔️";
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 5em;
      opacity: 0.15;
      filter: grayscale(100%);
    }

    .stat-label-large {
      font-family: 'Cinzel', serif;
      font-size: 1.8em;
      font-weight: 900;
      color: #fff;
      letter-spacing: 3px;
      flex: 1;
      text-shadow: 2px 2px 4px #000;
    }

    .stat-value-large {
      font-family: 'Montserrat', sans-serif;
      font-size: 4.5em;
      font-weight: 900;
      color: #ff3333; /* Rouge cristal/néon */
      text-shadow: 
        2px 2px 0 #000, 
        4px 4px 0 #300000,
        0 0 15px rgba(255,0,0,0.6);
      z-index: 1;
    }

    /* Sub stats */
    .sub-stats-container {
      background: rgba(10, 10, 10, 0.8);
      border: 2px solid #222;
      border-radius: 4px;
      padding: 15px;
      box-shadow: inset 0 0 10px #000;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 15px;
      margin-bottom: 8px;
      font-size: 1.3em;
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      color: #ccc;
      background: linear-gradient(90deg, #151515, #111);
      border-left: 4px solid #555;
    }
    .stat-row:last-child { margin-bottom: 0; }
    
    .stat-row.vivant { border-left-color: #dfb15b; }
    .stat-row.puine { border-left-color: #888; }
    .stat-row.squelette { border-left-color: #444; color: #777; }
    
    .stat-val { color: #fff; font-weight: 900; }
  `;

  const html = `
    <div class="main-container">
      
      <div class="top-nameplate">${username}</div>
      <div class="cords-container">
        <div class="cord"></div>
        <div class="cord"></div>
      </div>
      
      <div class="card-body">
        <div class="portrait-panel">
          <img class="avatar-clean" src="${avatarUrl}" alt="avatar" crossorigin="anonymous" />
          <div class="class-strip">
            <span class="class-strip-text">SOUVERAIN / ${username}</span>
          </div>
        </div>
        
        <div class="stats-panel">
          <div class="primary-stat-box">
            <div class="stat-label-large">PUISSANCE</div>
            <div class="stat-value-large">${totalPower}</div>
          </div>
          
          <div class="sub-stats-container">
            <div class="stat-row vivant">
              <span>Dragons Vivants</span>
              <span class="stat-val">${dragonsVivants}</span>
            </div>
            <div class="stat-row puine">
              <span>Puînés (Infanterie)</span>
              <span class="stat-val">${puines}</span>
            </div>
            <div class="stat-row squelette">
              <span>Squelettes</span>
              <span class="stat-val">${dragonsSquelettes}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  return getMangaLayout(css, html);
}
