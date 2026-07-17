export function getArgentCardHtml({
  avatarUrl,
  username,
  gold,
  rank,
  record,
  barPercent
}: {
  avatarUrl: string;
  username: string;
  gold: string;
  rank: string;
  record: string;
  barPercent: number;
}): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap" rel="stylesheet">
  <style>
    /* Reset & Base */
    body {
      margin: 0;
      padding: 0;
      background: #101010 !important;
      font-family: 'Montserrat', sans-serif;
      position: relative;
      width: 100vw;
      height: 100vh;
      box-sizing: border-box;
      color: #E0E0E0;
      overflow: visible; /* Sortie de cadre */
      border: 8px solid #000; /* Cadre Manga */
    }

    /* Screentone (Halftone manga effect) */
    .screentone-bg {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #1a1a1a;
      background-image: radial-gradient(#050505 2px, transparent 2.5px);
      background-size: 8px 8px; /* Trames manga grosses */
      z-index: 0;
    }

    /* Ink Border (Bordure Coup de Pinceau) */
    .ink-box {
      position: absolute;
      top: 40px; left: 40px; right: 80px; bottom: 40px;
      /* Background crasseux */
      background: linear-gradient(135deg, #181818 0%, #0a0a0a 100%);
      border: 8px solid #000;
      border-radius: 255px 15px 225px 15px/15px 225px 15px 255px; /* Irregular brush stroke shape */
      box-shadow: 15px 15px 0px rgba(0,0,0,0.8), inset 0 0 40px #000;
      z-index: 1;
    }
    .ink-box::before {
      content: "";
      position: absolute;
      top: -10px; left: -10px; right: -10px; bottom: -10px;
      border: 4px solid #000;
      border-radius: 15px 225px 15px 255px/255px 15px 225px 15px;
      pointer-events: none;
    }

    /* Conteneur principal */
    .content-wrapper {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      padding: 0;
    }

    /* Sortie de Cadre de l'Avatar */
    .avatar-container {
      position: relative;
      margin-left: -5px; /* L'avatar vient mordre sur la gauche */
      margin-top: -30px; /* Sort d'en haut hors de la planche */
      z-index: 11;
      transform: rotate(-3deg);
    }

    /* "Coup de pinceau" qui encadre la photo */
    .avatar-brush-border {
      position: absolute;
      top: -8px; left: -8px; right: -8px; bottom: -8px;
      background: #000;
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      z-index: -1;
      box-shadow: 12px 12px 0px rgba(139,0,0,0.8);
    }

    .avatar {
      width: 250px;
      height: 250px;
      object-fit: cover;
      border: 4px solid #fff;
      border-radius: 30% 70% 50% 50% / 50% 40% 60% 50%; /* Forme tirée au trait */
      filter: grayscale(20%) contrast(120%); /* Effet dark */
      position: relative;
    }

    .info-container {
      flex: 1;
      margin-left: 50px;
      position: relative;
    }

    /* Contraste - Deep Black Glow */
    .manga-glow {
      color: #B8860B; /* Or Terni */
      text-transform: uppercase;
      font-weight: 900;
      text-shadow: 
        3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, /* Contour de trace pur */
        0 0 10px #000, 0 0 20px #000, 0 0 40px #000, 0 0 60px #000, /* Aura de Ténèbres */
        6px 6px 0px rgba(0,0,0,1); /* Renfort type Manga dur */
      letter-spacing: -2px;
    }

    .username {
      font-size: 3.8em;
      margin-bottom: 5px;
      transform: skewX(-5deg); /* Légèrement agressif */
      line-height: 1;
    }

    /* Overflow : Sortie du montant en Or de la zone */
    .gold-container {
      position: absolute;
      top: -10px;
      right: -30px; /* Dépassement violent de la planche sur la droite */
      z-index: 20;
      transform: rotate(4deg) scale(1.1); /* Effet 3D "Pop-Out" */
    }

    .gold-value {
      font-size: 4.5em;
      display: flex;
      align-items: center;
      color: #FFF; /* Blanc pur */
      text-shadow: 
        0 0 10px #000, 0 0 20px #000, 0 0 30px #8B0000, 
        5px 5px 0 #000, -5px -5px 0 #000, 5px -5px 0 #000, -5px 5px 0 #000,
        10px 10px 0px #8B0000;
    }

    .gold-emoji {
      font-size: 0.8em;
      margin-left: 10px;
      filter: drop-shadow(4px 4px 0px #000);
    }

    /* Jauge d'expérience - Style violent */
    .bar-wrapper {
      position: relative;
      margin-top: 50px;
      width: 85%;
      height: 45px;
      transform: skewX(-15deg); /* Angle d'attaque */
      border: 5px solid #000;
      background: #101010;
      box-shadow: 10px 10px 0px rgba(139,0,0,0.8); /* Reflet Sang Séché */
      overflow: hidden;
      z-index: 10;
    }

    .bar-bg-screentone {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(#333 1.5px, transparent 1.5px); /* Trame interne */
      background-size: 6px 6px;
    }

    .bar-fill {
      position: absolute;
      top: 0; left: 0; height: 100%;
      width: ${barPercent}%;
      background: #8B0000;
      border-right: 6px solid #000;
      box-shadow: inset -5px 0 15px rgba(0,0,0,0.8);
    }

    .bar-text {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%) skewX(15deg); /* Redresser le texte */
      font-size: 1.8em;
      font-weight: 900;
      z-index: 15;
      color: #FFF;
      white-space: nowrap;
      text-shadow: 
        0 0 10px #000, 0 0 20px #000, 0 0 30px #000,
        3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000;
    }

    .footer {
      display: flex;
      justify-content: flex-start;
      gap: 30px;
      margin-top: 20px;
      font-size: 1.5em;
      font-weight: 900;
      transform: skewX(-5deg);
    }
    
    .footer-item {
      background: #000;
      padding: 5px 15px;
      color: #8B0000; 
      box-shadow: 5px 5px 0px rgba(139,0,0,0.8);
      border: 3px solid #E0E0E0;
    }
    
    .footer-item span {
      color: #FFF;
    }

    /* Foreground Splatters: traits d'encre sur le premier plan */
    .foreground-ink-1 {
      position: absolute;
      bottom: -15px; left: 20%;
      width: 40%; height: 25px;
      background: #000;
      transform: rotate(-3deg);
      border-radius: 50% 50% 50% 50% / 60% 40% 60% 40%;
      z-index: 50;
    }
    .foreground-ink-2 {
      position: absolute;
      top: -10px; right: 35%;
      width: 20%; height: 20px;
      background: #000;
      transform: rotate(2deg);
      border-radius: 50%;
      z-index: 50;
    }
  </style>
</head>
<body>

  <!-- Trame de fond Manga -->
  <div class="screentone-bg"></div>
  
  <!-- Encadré Central irrégulier style Encre et Pinceau -->
  <div class="ink-box">
  
     <!-- HIGANBANA en SVG: pur style Plume Noir et Gouttes Sang -->
     <svg style="position:absolute; top:-30px; right:-50px; width:300px; height:300px; z-index: 5; pointer-events: none; transform: rotate(15deg);" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="rough">
        <!-- Générateur d'imperfections type "coupe plume ou pinceau ébouriffé" -->
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      
      <g stroke-linecap="round" fill="none">
        <path d="M100,180 Q105,120 100,90" stroke="#000" stroke-width="12" filter="url(#rough)"/>
        <!-- Tiges noires agressives -->
        <path d="M100,100 C60,110 30,140 10,180 M100,100 C140,110 170,140 190,180 
                 M100,80 C50,60 20,40 10,10 M100,80 C150,60 180,40 190,10
                 M100,90 Q40,90 0,110 M100,90 Q160,90 200,110" 
              stroke="#000" stroke-width="8" filter="url(#rough)"/>
              
        <!-- Filaments rouge sang de l'Higanbana -->
        <path d="M100,100 C70,105 40,130 15,175 M100,100 C130,105 160,130 185,175 
                 M100,85 C60,65 30,45 15,15 M100,85 C140,65 170,45 185,15
                 M100,95 Q45,95 5,115 M100,95 Q155,95 195,115" 
              stroke="#8B0000" stroke-width="4"/>

        <!-- Pistils -->
        <path d="M100,95 L95,80 M100,95 L105,80 M100,95 L80,100 M100,95 L120,100 M100,95 L110,110 M100,95 L90,110" stroke="#8B0000" stroke-width="3"/>
      </g>
      
      <!-- Taches, gouttelettes et Spatters d'Encre et Sang -->
      <circle cx="80" cy="80" r="5" fill="#8B0000" filter="url(#rough)" />
      <circle cx="120" cy="70" r="8" fill="#000" filter="url(#rough)" />
      <circle cx="140" cy="110" r="4" fill="#8B0000" />
      <circle cx="50" cy="130" r="6" fill="#000" />
      <circle cx="150" cy="170" r="3" fill="#8B0000" />
    </svg>
  </div>

  <!-- Contenu Principal -->
  <div class="content-wrapper">
    
    <div class="avatar-container">
      <div class="avatar-brush-border"></div>
      <img class="avatar" src="${avatarUrl}" alt="avatar" crossorigin="anonymous" />
    </div>

    <div class="info-container">
      <div class="username manga-glow">${username}</div>
      
      <!-- SORTIE DE CADRE -->
      <div class="gold-container">
        <div class="gold-value">${gold} <span class="gold-emoji">💰</span></div>
      </div>
      
      <div class="bar-wrapper">
        <div class="bar-bg-screentone"></div>
        <div class="bar-fill"></div>
        <div class="bar-text">${gold} / ${record}</div>
      </div>
      
      <div class="footer">
        <div class="footer-item">RANG : <span>#${rank}</span></div>
        <div class="footer-item">RECORD : <span>${record}</span></div>
      </div>
    </div>

  </div>

  <!-- Taches d'encre supérieures (devant l'avatar) -->
  <div class="foreground-ink-1"></div>
  <div class="foreground-ink-2"></div>

</body>
</html>`;
}
