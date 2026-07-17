export function getMangaLayout(innerCss: string, innerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;800;900&family=Cinzel:wght@700;900&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #080808 !important;
      font-family: 'Montserrat', sans-serif;
      position: relative;
      width: 100vw;
      min-height: 100vh;
      height: fit-content;
      box-sizing: border-box;
      color: #E0E0E0;
      overflow: visible;
      border: 8px solid #000;
      display: flex;
      flex-direction: column;
    }
    
    /* Fond en grille d'acier perforée, net et uniforme */
    .darkfantasy-bg {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #0e0e0e;
      background-image: radial-gradient(#2a2a2a 2px, transparent 2px);
      background-size: 10px 10px;
      z-index: 0;
    }
    
    /* Carte d'obsidienne et cuir gaufré */
    .obsidian-card {
      position: absolute;
      top: 40px; left: 60px; right: 60px; bottom: 40px;
      background: linear-gradient(135deg, #18191a 0%, #050505 100%);
      border-radius: 8px;
      box-shadow: 
        15px 15px 25px rgba(0,0,0,0.9), 
        inset 0 0 0 2px #2a2a2a, /* Biseau intérieur */
        inset 0 0 0 6px #080808, /* Structure fer forgé */
        inset 0 0 0 8px #5c0000; /* Laque rouge */
      z-index: 1;
    }
    
    /* Runes ornementales subtiles aux coins */
    .rune-corner {
      position: absolute;
      width: 30px; height: 30px;
      font-family: 'Cinzel', serif;
      font-size: 24px;
      color: #444;
      z-index: 2;
      display: flex; justify-content: center; align-items: center;
      text-shadow: 0 0 5px rgba(0,0,0,1);
    }
    .rune-corner.tl { top: 48px; left: 68px; }
    .rune-corner.tr { top: 48px; right: 68px; }
    .rune-corner.bl { bottom: 48px; left: 68px; }
    .rune-corner.br { bottom: 48px; right: 68px; }
    
    .content-wrapper {
      position: relative;
      flex: 1;
      width: 100%;
      min-height: 100vh;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      box-sizing: border-box;
    }

    /* Typographie Gothique/Médiévale en Or Poli */
    .gold-title {
      font-family: 'Cinzel', serif;
      color: #dfb15b; /* Or terni/poli */
      text-transform: uppercase;
      font-weight: 900;
      letter-spacing: 2px;
      text-shadow: 
        1px 1px 0px #4a3615, 
        2px 2px 5px rgba(0,0,0,0.8),
        0 0 10px rgba(223, 177, 91, 0.2);
    }
    
    /* Plaque de Nom Supérieure */
    .name-plate {
      background: linear-gradient(to bottom, #2b2b2b, #111);
      border: 2px solid #5c0000;
      box-shadow: 0 4px 10px rgba(0,0,0,0.8), inset 0 1px 0 #444;
      padding: 5px 20px;
      display: inline-block;
    }

    /* Rouge net pour statistiques */
    .stat-red {
      color: #cc0000;
      font-family: 'Montserrat', sans-serif;
      font-weight: 900;
      text-shadow: 1px 1px 0 #000, 2px 2px 5px rgba(0,0,0,0.8);
    }
    
    /* Panneau de statistiques refondu */
    .stat-panel-fantasy {
      background: linear-gradient(to bottom, #600000, #300000);
      border: 3px solid #111;
      border-radius: 4px;
      box-shadow: inset 1px 1px 0 #900000, 5px 5px 15px rgba(0,0,0,0.8);
      padding: 10px 20px;
      color: #fff;
      display: flex;
      align-items: center;
    }

    /* Cadre de portrait en fer forgé */
    .avatar-bruh {
      width: 250px;
      height: 250px;
      object-fit: cover;
      border: 4px solid #111; /* Fer forgé sombre */
      border-radius: 8px; /* Plus propre que les ovales informes */
      box-shadow: 0 0 0 3px #5c0000, 10px 10px 20px rgba(0,0,0,0.9);
      filter: contrast(120%) brightness(0.9);
    }
    
    .avatar-brush-border {
      display: none; /* Removed for cleaner fantasy look */
    }

    /* Support components to override manga-glow etc without breaking existing templates */
    .manga-glow {
      color: #dfb15b;
      font-family: 'Cinzel', serif;
      text-shadow: 2px 2px 4px #000, inset 0 0 2px #000;
    }
    .manga-glow-red {
      color: #900000;
      text-shadow: 1px 1px 2px #000;
    }

    ${innerCss}
  </style>
</head>
<body>
  <div class="darkfantasy-bg"></div>
  <div class="obsidian-card"></div>
  <div class="rune-corner tl">ᚲ</div>
  <div class="rune-corner tr">ᚱ</div>
  <div class="rune-corner bl">ᚦ</div>
  <div class="rune-corner br">ᛗ</div>
  
  <div class="content-wrapper">
    ${innerHtml}
  </div>
</body>
</html>`;
}
