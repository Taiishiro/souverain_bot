import { getMangaLayout } from './mangaLayout';

export function getDailyCardHtml({
  avatarUrl,
  username,
  receivedAmount,
  newTotal
}: {
  avatarUrl: string;
  username: string;
  receivedAmount: string;
  newTotal: string;
}): string {
  const css = `
    .card {
      width: 100%;
      height: auto;
      display: flex;
      align-items: center;
      position: relative;
      z-index: 3;
    }
    .content {
      flex: 1;
      margin-left: 50px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .title {
      font-size: 2.2em;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 4px;
      margin-bottom: 5px;
      transform: skewX(-5deg);
    }
    .username {
      font-size: 3.8em;
      margin-bottom: 15px;
      transform: skewX(-5deg);
      line-height: 1;
    }
    .gain-box {
      background: #000;
      border: 4px solid #8B0000;
      padding: 10px 30px;
      display: inline-block;
      width: fit-content;
      margin-bottom: 20px;
      transform: skewX(-10deg) scale(1.1);
      box-shadow: 10px 10px 0px rgba(139,0,0,0.8);
      position: relative;
      z-index: 20;
    }
    .gain-text {
      font-size: 3em;
      color: #FFF;
      font-weight: 900;
      display: flex;
      align-items: center;
      gap: 10px;
      text-shadow: 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 0 0 10px rgba(139,0,0,0.8);
    }
    .footer {
      font-size: 1.8em;
      color: #FFF;
      font-weight: 900;
      transform: skewX(-5deg);
      background: #000;
      padding: 5px 15px;
      border: 3px solid #E0E0E0;
      width: fit-content;
      box-shadow: 5px 5px 0px rgba(139,0,0,0.8);
    }
    .footer span {
      color: #B8860B;
    }
  `;

  const html = `
    <div class="card">
      <div class="avatar-container">
        <div class="avatar-brush-border"></div>
        <img class="avatar" src="${avatarUrl}" alt="avatar" crossorigin="anonymous" />
      </div>
      <div class="content">
        <div class="title">Tribut Quotidien Récupéré</div>
        <div class="username manga-glow">${username}</div>
        <div class="gain-box">
          <div class="gain-text">+${receivedAmount} 💰</div>
        </div>
        <div class="footer">
          TRÉSORERIE : <span>${newTotal}</span> 💰
        </div>
      </div>
    </div>
  `;

  return getMangaLayout(css, html);
}
