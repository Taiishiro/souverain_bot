import { getMangaLayout } from './mangaLayout';

/**
 * Génère le HTML complet pour le profil joueur (Dark Manga/Seinen style).
 */
export function getProfileHtml({
  username,
  family,
  gold,
  dragons,
  rank,
  avatarUrl,
  dragonIconUrl
}: {
  username: string;
  family: string;
  gold: string;
  dragons: string;
  rank: string;
  avatarUrl: string;
  dragonIconUrl: string;
}): string {
  const innerCss = `
    .profile-container {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 90%;
      height: 80%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10;
    }
    
    .profile-title {
      font-family: 'Cinzel', serif;
      font-size: 40px;
      font-weight: 900;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 12px;
      margin-bottom: 20px;
      -webkit-text-stroke: 1px #800000;
      text-shadow: 4px 4px 0 #000, -2px -2px 0 #800000;
      transform: skewX(-5deg);
    }

    .profile-box {
      width: 100%;
      display: flex;
      flex-direction: row;
      background: #000;
      border: 3px solid #fff;
      position: relative;
    }

    .profile-box::after {
      content: "";
      position: absolute;
      top: 6px;
      left: 6px;
      right: -10px;
      bottom: -10px;
      border: 2px solid #800000;
      z-index: -1;
    }

    .avatar-section {
      padding: 20px;
      border-right: 3px solid #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: repeating-linear-gradient(
        45deg,
        #000,
        #000 5px,
        #111 5px,
        #111 10px
      );
    }

    .avatar-img {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border: 3px solid #fff;
      filter: grayscale(100%) contrast(150%);
      box-shadow: 6px 6px 0 #800000;
      margin-bottom: 15px;
    }

    .username-tag {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      font-weight: 900;
      color: #fff;
      text-align: center;
      background: #800000;
      padding: 5px 15px;
      border: 2px solid #fff;
      text-transform: uppercase;
      letter-spacing: 2px;
      transform: skewX(-10deg);
      box-shadow: 4px 4px 0 #000;
    }

    .info-section {
      flex: 1;
      padding: 20px 30px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: #050505;
      position: relative;
      overflow: hidden;
    }
    
    .info-section::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(#333 1px, transparent 1px);
      background-size: 4px 4px;
      opacity: 0.3;
      z-index: 0;
    }

    .stat-row {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      position: relative;
      z-index: 1;
    }

    .stat-row:last-child {
      margin-bottom: 0;
    }

    .stat-label {
      font-family: 'Montserrat', sans-serif;
      font-size: 16px;
      font-weight: 800;
      color: #aaa;
      width: 120px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .stat-value {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      font-weight: 900;
      color: #fff;
      background: #000;
      border-bottom: 2px solid #800000;
      padding: 0 10px;
      letter-spacing: 2px;
      box-shadow: 3px 3px 0 rgba(128,0,0,0.3);
    }
    
    .gold-value { color: #ffd700; text-shadow: 2px 2px 0 #000; }
    .dragon-value { color: #ff4444; }

    .dragon-icon-box {
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: #000;
      border: 2px solid #fff;
      box-shadow: 4px 4px 0 #800000;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2;
      transform: rotate(-5deg);
    }

    .dragon-icon-box img {
      width: 45px;
      height: 45px;
      object-fit: contain;
      filter: grayscale(100%) contrast(150%);
    }

    .panel-corner {
      position: absolute;
      width: 15px;
      height: 15px;
      background: #fff;
      z-index: 5;
    }
    .panel-corner.tl { top: -3px; left: -3px; }
    .panel-corner.tr { top: -3px; right: -3px; }
    .panel-corner.bl { bottom: -3px; left: -3px; }
    .panel-corner.br { bottom: -3px; right: -3px; }
  `;

  const innerHtml = `
    <div class="profile-container">
      <div class="profile-title">PROFIL</div>
      
      <div class="profile-box">
        <div class="panel-corner tl"></div>
        <div class="panel-corner tr"></div>
        <div class="panel-corner bl"></div>
        <div class="panel-corner br"></div>

        <div class="avatar-section">
          <img class="avatar-img" src="\${avatarUrl}" alt="Avatar">
          <div class="username-tag">\${username}</div>
        </div>

        <div class="info-section">
          <div class="stat-row">
            <span class="stat-label">Famille</span>
            <span class="stat-value">\${family}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Or</span>
            <span class="stat-value gold-value">\${gold}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Dragons</span>
            <span class="stat-value dragon-value">\${dragons}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Classement</span>
            <span class="stat-value">\${rank}</span>
          </div>
          
          <div class="dragon-icon-box">
            <img src="\${dragonIconUrl}" alt="Dragon">
          </div>
        </div>
      </div>
    </div>
  `;

  return getMangaLayout(innerCss, innerHtml);
}
