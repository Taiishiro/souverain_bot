export function getMariageHtml({ user1Name, user2Name }: { user1Name: string; user2Name: string; }): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Cinzel:wght@600;800&display=swap" rel="stylesheet">
  <style>

    body {
      margin: 0;
      padding: 0;
      background: #101010 !important;
      font-family: 'Montserrat', Arial, sans-serif;
      position: relative;
      width: 100vw;
      min-height: 100vh; /* Allow stretch */
      border: 4px solid #424242; /* Gris Tombeau */
      box-sizing: border-box;
      color: #E0E0E0; /* Bon contraste de base */
      overflow: hidden;
    }
    .background-stone {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle at center, #1a1a1a 0%, #050505 100%);
      z-index: 0;
    }
    .parchment-bg {
      position: absolute;
      top: 15px; left: 15px; right: 15px; bottom: 15px;
      /* Foncé pour le contraste du texte clair, mais texturé */
      background: linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%);
      border: 2px solid #8B0000; /* Sang Séché */
      box-shadow: inset 0 0 30px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8);
      z-index: 1;
      border-radius: 6px;
    }
    .sakura-border {
      position: absolute;
      top: 0; bottom: 0; right: 0;
      width: 150px;
      z-index: 2;
      pointer-events: none;
      overflow: hidden;
    }
    .petal {
      position: absolute;
      background: #8B0000;
      box-shadow: 0 0 8px #000;
      border-radius: 50% 0 50% 0;
      opacity: 0.8;
      filter: drop-shadow(0 0 2px #000);
    }
    .petal:nth-child(1) { width: 18px; height: 18px; top: 10%; right: 20px; transform: rotate(45deg); opacity: 0.6; }
    .petal:nth-child(2) { width: 14px; height: 14px; top: 25%; right: 45px; transform: rotate(15deg); opacity: 0.9; }
    .petal:nth-child(3) { width: 20px; height: 20px; top: 40%; right: 10px; transform: rotate(70deg); opacity: 0.5; }
    .petal:nth-child(4) { width: 12px; height: 12px; top: 55%; right: 60px; transform: rotate(25deg); opacity: 0.8; }
    .petal:nth-child(5) { width: 16px; height: 16px; top: 75%; right: 30px; transform: rotate(85deg); opacity: 0.7; }
    .petal:nth-child(6) { width: 10px; height: 10px; top: 85%; right: 50px; transform: rotate(105deg); opacity: 0.9; }
    .petal:nth-child(7) { width: 22px; height: 22px; top: 90%; right: 15px; transform: rotate(135deg); opacity: 0.6; }
    
    .content-wrapper-z {
      position: relative;
      z-index: 3;
      width: 100%;
      height: 100%;
      padding: 35px; /* Margin from parchment */
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }


    
    


    
    

    * { box-sizing: border-box; }
    
    .container {
      background: #1e1e1e; border: 4px solid #FFD700; border-radius: 10px; padding: 40px;
      box-shadow: inset 0 0 40px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5); text-align: center;
      position: relative; overflow: hidden;
    }
    .title { font-family: 'Cinzel', serif; font-size: 2.5rem; color: #FFD700; margin-bottom: 20px; text-transform: uppercase; }
    .names { font-size: 2rem; color: #B8860B; font-family: 'Cinzel', serif; font-weight: bold; margin-top: 10px; }
    .icon { font-size: 5rem; margin: 10px 0; }
  </style>
</head>
<body>

  <div class="background-stone"></div>
  <div class="parchment-bg"></div>
  <div class="sakura-border">
    <div class="petal"></div>
    <div class="petal"></div>
    <div class="petal"></div>
    <div class="petal"></div>
    <div class="petal"></div>
    <div class="petal"></div>
    <div class="petal"></div>
  </div>
  <div class="content-wrapper-z">

<div class="container" >
    <div class="title">✨ Union Sacrée Accordée ✨</div>
    <div class="icon">💍</div>
    <div class="names">${user1Name} & ${user2Name}</div>
    <div style="font-size: 1.2rem; color: #ccc; margin-top: 20px;">Vos âmes et vos patrimoines sont désormais fusionnés pour l'éternité.</div>
  </div>
  </div>
</body>
</html>`;
}

export function getDivorceHtml({ user1Name, user2Name, total, destroyed, remaining1, remaining2 }: { user1Name: string; user2Name: string; total: string; destroyed: string; remaining1: string; remaining2: string; }): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Cinzel:wght@600;800&display=swap" rel="stylesheet">
  <style>

    
    


    
    

    * { box-sizing: border-box; }
    
    .container {
      background: #111; border: 4px solid #8B0000; border-radius: 10px; padding: 30px;
      box-shadow: inset 0 0 50px rgba(139,0,0,0.3); text-align: center;
    }
    .title { font-family: 'Cinzel', serif; font-size: 2.5rem; color: #F44336; margin-bottom: 10px; text-transform: uppercase; }
    .sub { font-size: 1.4rem; color: #888; font-family: 'Cinzel', serif; margin-bottom: 30px; }
    .fire { font-size: 4rem; margin: 10px; }
    .stats { display: flex; justify-content: space-around; background: rgba(255,0,0,0.05); padding: 20px; border-radius: 8px; border: 1px solid #440000; }
    .stat { display: flex; flex-direction: column; align-items: center; }
    .stat-val { font-size: 1.5rem; font-family: 'Cinzel', serif; font-weight: bold; margin-top: 10px; }
    .destroyed { color: #F44336; }
    .remaining { color: #B8860B; }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">💔 Mariage Dissous 💔</div>
    <div class="sub">${user1Name} sépare son chemin de ${user2Name}</div>
    <div class="fire">🔥</div>
    <div style="font-size: 1.2rem; color: #ccc; margin-bottom: 20px;">Le pacte est brisé. La moitié de votre fortune commune a été incinérée en guise de châtiment.</div>
    <div class="stats">
      <div class="stat">
        <span style="color: #aaa">Patrimoine Initial</span>
        <span class="stat-val" style="color: #FFD700">${total} $</span>
      </div>
      <div class="stat">
        <span style="color: #aaa">Détruit (50%)</span>
        <span class="stat-val destroyed">-${destroyed} $</span>
      </div>
      <div class="stat">
        <span style="color: #aaa">Distribution Finale</span>
        <span class="stat-val remaining">${remaining1} $<br>${remaining2} $</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function getFamilleHtml({ nom, membres, argent, date }: { nom: string; membres: string[]; argent: string; date: string; }): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Cinzel:wght@600;800&display=swap" rel="stylesheet">
  <style>

    
    


    
    

    * { box-sizing: border-box; }
    
    .container {
      background: #151515; border: 3px solid #B8860B; border-radius: 10px; padding: 30px;
      box-shadow: inset 0 0 30px rgba(0,0,0,0.8); text-align: center;
    }
    .title { font-family: 'Cinzel', serif; font-size: 2rem; color: #B8860B; margin-bottom: 20px; text-transform: uppercase; }
    .v-grid { display: flex; flex-direction: column; gap: 15px; text-align: left; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 8px; }
    .row { display: flex; justify-content: space-between; font-size: 1.2rem; border-bottom: 1px solid #333; padding-bottom: 10px; }
    .val { font-family: 'Cinzel', serif; font-weight: bold; color: #FFD700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">🛡️ ${nom} 🛡️</div>
    <div class="v-grid">
      <div class="row"><span>Membres Unis :</span> <span class="val" style="color: #B8860B">${membres.join(' & ')}</span></div>
      <div class="row"><span>Trésor Commun :</span> <span class="val">${argent} $</span></div>
      <div class="row"><span>Date d'Union :</span> <span class="val" style="color: #aaa">${date}</span></div>
    </div>
  </div>
</body>
</html>`;
}
