import { getMangaLayout } from './mangaLayout';

export function getTopArgentHtml(players: any[], families: any[]): string {
    const renderPlayer = (p: any, i: number) => `
        <div class="row">
            <div class="rank manga-glow">#${i + 1}</div>
            <div class="name">${p.name}</div>
            <div class="gold">${p.gold.toLocaleString('fr-FR')} 💰</div>
        </div>
    `;

    const renderFamily = (f: any, i: number) => `
        <div class="row">
            <div class="rank manga-glow">#${i + 1}</div>
            <div class="name">${f.name}</div>
            <div class="gold">${f.gold.toLocaleString('fr-FR')} 💰</div>
        </div>
    `;

  const css = `
    .container {
      width: 100%;
      height: auto;
      padding: 60px 80px 60px 60px;
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      gap: 30px;
    }
    .column {
        flex: 1;
        background: #000;
        border: 4px solid #8B0000;
        padding: 20px;
        box-shadow: 10px 10px 0 #050505;
        transform: skewX(-3deg);
        position: relative;
        z-index: 20;
    }
    .title {
        font-size: 2em;
        font-weight: 900;
        text-align: center;
        margin-bottom: 20px;
        border-bottom: 4px solid #fff;
        padding-bottom: 10px;
        transform: skewX(-5deg);
    }
    .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        margin-bottom: 8px;
        background: #111;
        border-left: 5px solid #E0E0E0;
        color: #FFF;
        font-weight: bold;
        transform: skewX(3deg);
    }
    .rank {
        width: 50px;
        font-size: 1.2em;
    }
    .name {
        flex: 1;
        font-size: 1.2em;
        white-space: nowrap;
        overflow: visible;
        text-overflow: ellipsis;
        padding: 0 15px;
        text-transform: uppercase;
    }
    .gold {
        color: #FFF;
        font-size: 1.2em;
        text-shadow: 2px 2px 0 #000;
    }
  `;

  const html = `
    <div class="container">
      <div class="column">
        <div class="title manga-glow-red">👥 Top Familles</div>
        ${families.map(renderFamily).join('')}
      </div>
      <div class="column">
        <div class="title manga-glow-red">👤 Top Joueurs</div>
        ${players.map(renderPlayer).join('')}
      </div>
    </div>
  `;

  return getMangaLayout(css, html);
}
