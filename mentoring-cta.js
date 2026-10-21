/* Tarjeta Mentoring SST Plus, Directorio oficial movidasst/geo. */
(() => {
'use strict';
const css="\n#geoMentoringCard{position:relative;overflow:hidden;isolation:isolate;background:linear-gradient(120deg,#00205b 0%,#00466f 57%,#007b85 100%);color:#fff;border:1px solid rgba(12,167,171,.35);border-radius:20px;padding:17px;box-shadow:0 12px 30px rgba(0,32,91,.15);font-family:Outfit,Arial,sans-serif}\n#geoMentoringCard::before{content:\"\";position:absolute;width:190px;height:190px;border:1px solid rgba(255,255,255,.13);border-radius:50%;right:-80px;top:-85px;pointer-events:none;z-index:-1}\n#geoMentoringCard .gm-head{display:flex;align-items:center;gap:12px}\n#geoMentoringCard .gm-head img{width:62px;height:62px;object-fit:contain;flex:0 0 auto;filter:drop-shadow(0 5px 10px rgba(0,0,0,.18))}\n#geoMentoringCard .gm-kicker{font-size:10px;font-weight:900;letter-spacing:.1em;color:#d5fff5;text-transform:uppercase}\n#geoMentoringCard h2{font-size:21px;color:#fff;font-weight:900;line-height:1.13;margin:4px 0 0}\n#geoMentoringCard h2 span{color:#ffcc39}\n#geoMentoringCard .gm-copy{font-size:12.5px;line-height:1.55;color:#e6f5fa;margin:11px 0 10px}\n#geoMentoringCard .gm-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}\n#geoMentoringCard .gm-tags span{border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:5px 9px;font-size:10px;font-weight:800;background:rgba(255,255,255,.1)}\n#geoMentoringCard .gm-link{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:10px 16px;background:#ffbf18;color:#00205b;font-size:12px;font-weight:900;text-decoration:none;border-radius:12px;box-shadow:0 6px 16px rgba(0,0,0,.12);transition:transform .18s,background .18s}\n#geoMentoringCard .gm-link:hover{transform:translateY(-2px);background:#ffce4a}\n#geoMentoringCard .gm-link:focus-visible,#geoMentoringMapTip .gm-tip-link:focus-visible{outline:3px solid #fff;outline-offset:3px}\n#geoMentoringMapTip{position:absolute;bottom:calc(105px + env(safe-area-inset-bottom));left:12px;z-index:460;width:min(270px,calc(100vw - 28px));font:inherit;filter:drop-shadow(0 8px 15px rgba(0,32,91,.15))}\n#geoMentoringMapTip .gm-tip-link{display:flex;align-items:center;gap:10px;min-height:67px;padding:11px 36px 11px 12px;border-radius:17px;border:1px solid #23bbb3;text-decoration:none;background:linear-gradient(115deg,#00205b,#00666f);color:#fff;box-shadow:0 8px 28px rgba(0,32,91,.2)}\n#geoMentoringMapTip .gm-tip-link img{width:38px;height:38px;object-fit:contain;flex:none}\n#geoMentoringMapTip .gm-tip-link strong{display:block;font-size:12px;font-weight:900;line-height:1.25;color:#fff}\n#geoMentoringMapTip .gm-tip-link small{display:block;margin-top:3px;font-size:10px;color:#e3fffc;font-weight:650;line-height:1.3}\n#geoMentoringMapTip .gm-close{position:absolute;right:5px;top:5px;min-width:28px;min-height:28px;display:grid;place-items:center;color:#fff;background:transparent;border:0;border-radius:8px;font-size:17px;cursor:pointer}\n#geoMentoringMapTip .gm-close:focus-visible{outline:2px solid #ffbf18}\n@media(max-width:360px){#geoMentoringMapTip{width:236px}#geoMentoringMapTip .gm-tip-link{padding:8px 35px 8px 9px;min-height:62px}}\n@media(prefers-reduced-motion:reduce){#geoMentoringCard .gm-link{transition:none}}\n";
const cardHtml="<div class=\"gm-head\"><img src=\"/logo-oficial-movida-sst-plus.png\" alt=\"Logo oficial La Movida de SST Plus\" width=\"62\" height=\"62\" loading=\"lazy\" decoding=\"async\"><div><div class=\"gm-kicker\">Desarrollo profesional · Servicio opcional</div><h2>Mentoring SST <span>Plus</span></h2></div></div>\n<p class=\"gm-copy\">Aprende, aplica y avanza con David Linares Brea. Sesiones individuales de <strong>45 minutos</strong> y consultas por WhatsApp para fortalecer tu criterio en Gestión de SST.</p>\n<div class=\"gm-tags\"><span>Desde 10 USD/mes</span><span>Sin cobros automáticos</span><span>Sin permanencia</span></div>\n<a class=\"gm-link\" href=\"https://mentoring.movidasst.com/?vista=planes\" target=\"_blank\" rel=\"noopener noreferrer\">Conocer planes <span aria-hidden=\"true\">↗</span></a>";
const mapHtml="<a class=\"gm-tip-link\" href=\"https://mentoring.movidasst.com/?vista=planes\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Abrir planes de Mentoring SST Plus en pestaña nueva\"><img src=\"/logo-oficial-movida-sst-plus.png\" alt=\"\" width=\"38\" height=\"38\" loading=\"lazy\" decoding=\"async\"><span><strong>Mentoring SST Plus ↗</strong><small>45 min por sesión · Desde 10 USD/mes</small></span></a><button class=\"gm-close\" type=\"button\" aria-label=\"Cerrar anuncio de Mentoring SST Plus\">×</button>";
function install(){
  if(document.getElementById('geoMentoringCard')) return true;
  const info=document.querySelector('#info-view > div');
  const map=document.getElementById('map-view');
  if(!info||!map) return false;
  const style=document.createElement('style');
  style.id='geoMentoringStyles';
  style.textContent=css; document.head.appendChild(style);
  const card=document.createElement('aside');
  card.id='geoMentoringCard';
  card.setAttribute('aria-label','Mentoring SST Plus, acompañamiento opcional');
  card.innerHTML=cardHtml;
  const register=info.querySelector('.registration-entry-hero');
  if(register) register.insertAdjacentElement('afterend',card);
  else info.prepend(card);
  const tip=document.createElement('aside');
  tip.id='geoMentoringMapTip';
  tip.setAttribute('aria-label','Nuevo servicio de mentoría profesional');
  tip.innerHTML=mapHtml;
  tip.querySelector('.gm-close').addEventListener('click',()=>tip.remove());
  map.appendChild(tip);
  return true;
}
function init(){
  if(install())return;
  let tries=0;
  const interval=setInterval(()=>{tries++; if(install()||tries>=24)clearInterval(interval)},120);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
