import { getMangaLayout } from './mangaLayout';

export function getActionResultHtml(params: {
    title: string;
    description: string;
    icon: string;
    colorHex: string;
}): string {
  const css = `
    .center-content {
      width: 100%;
      height: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    
    .action-box {
      background: #000;
      border: 5px solid ${params.colorHex};
      box-shadow: 15px 15px 0px rgba(10,10,10,0.9);
      padding: 40px;
      transform: skewX(-3deg);
      position: relative;
      max-width: 80%;
      text-align: center;
    }
    .action-box::before {
      content: "${params.icon}";
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%) rotate(-10deg);
      font-size: 5em;
      filter: drop-shadow(5px 5px 0px #111);
      z-index: 10;
    }
    .title {
      font-size: 2.5em;
      font-weight: 900;
      color: ${params.colorHex};
      margin-bottom: 20px;
      margin-top: 10px;
      text-transform: uppercase;
      text-shadow: 2px 2px 0 #000, 4px 4px 0 #111;
    }
    .description {
      font-size: 1.5em;
      color: #E0E0E0;
      font-weight: bold;
      line-height: 1.4;
    }
    .description strong {
      color: #FFF;
      background: rgba(255,255,255,0.1);
      padding: 0 5px;
    }
  `;

  const html = `
    <div class="center-content">
      <div class="action-box">
        <div class="title">${params.title}</div>
        <div class="description">${params.description}</div>
      </div>
    </div>
  `;

  return getMangaLayout(css, html);
}
