import {pieceArt} from './piece-art.js';

function mounted(id, x, y, scale, pivotX, pivotY, motion=''){
  return `<g transform="translate(${x} ${y})"><g data-machine="${id}" class="machine-part"><g class="${motion}"><g transform="scale(${scale}) translate(${-pivotX} ${-pivotY})">${pieceArt(id,true)}</g></g></g></g>`;
}

export function mechanism(){
  const screws = [[98,144],[462,144],[98,241],[462,241]].map(([x,y]) =>
    `<g transform="translate(${x} ${y})"><circle r="4" fill="#aa884b" stroke="#695634"/><path d="M-2 1.5l4-3" stroke="#564427"/></g>`).join('');
  return `<svg class="machine-svg" viewBox="0 0 560 310" role="img" aria-label="Estojo de nogueira aberto, com mecanismo sobre uma placa de latão">
  <defs><linearGradient id="walnut" x2=".3" y2="1"><stop stop-color="#aa754d"/><stop offset=".43" stop-color="#784b32"/><stop offset="1" stop-color="#503727"/></linearGradient><linearGradient id="plate" x2=".7" y2="1"><stop stop-color="#f0dca1"/><stop offset=".45" stop-color="#ccae73"/><stop offset="1" stop-color="#e9d59f"/></linearGradient></defs>
  <ellipse cx="278" cy="271" rx="203" ry="9" fill="#3d30251c"/>
  <path d="M82 131l16-83q1-7 10-7h345q8 0 9 7l17 83Z" fill="url(#walnut)" stroke="#503d2b" stroke-width="3"/>
  <path d="M100 118l12-65h335l13 65Z" fill="#29483e" stroke="#c49a61" stroke-width="2"/>
  <path d="M113 109l8-47h318l9 47Z" fill="none" stroke="#b1a376" opacity=".55"/>
  <text x="280" y="82" text-anchor="middle" font-family="Georgia,serif" font-size="15" letter-spacing="3" fill="#e5d29e">BELLAMY</text>
  <text x="280" y="99" text-anchor="middle" font-family="monospace" font-size="7" letter-spacing="2" fill="#c7c4a1">ENCOMENDA Nº 002</text>
  <rect x="76" y="126" width="408" height="137" rx="9" fill="url(#walnut)" stroke="#493d2b" stroke-width="3"/>
  <rect x="88" y="135" width="384" height="115" rx="7" fill="url(#plate)" stroke="#624c33" stroke-width="2"/>
  <rect x="103" y="147" width="354" height="91" rx="5" fill="none" stroke="#9a835b" opacity=".6"/>
  <path d="M131 126h42m215 0h43" stroke="#73572d" stroke-width="10"/><path d="M131 124h42m215 0h43" stroke="#d3b477" stroke-width="5"/>
  ${screws}
  <path d="M75 197H51m0-10v20m0-11c-32-31-32 16 0 0-29 28-29-13 0 0" fill="none" stroke="#70603e" stroke-width="4"/>
  <g id="fitted-train">
  ${mounted('spring',162,195,.63,105,70)}
  ${mounted('gear',247,195,.65,105,67,'machine-wheel')}
  ${mounted('turbo',294,182,.57,86,75)}
  <g data-machine="gear" class="machine-part">
    <g class="brass-tapper">
      <path d="M265 211c12 5 20 6 33-1l11-6 2 4-12 7c-12 7-24 8-35 1Z" fill="#b59153" stroke="#665742" stroke-width="1.3"/>
      <rect x="305" y="198" width="12" height="13" rx="4" transform="rotate(-19 311 205)" fill="#6a6051" stroke="#4b453a"/>
      <path d="M307 201l6-2" stroke="#d3c7a9" stroke-linecap="round"/>
      <circle cx="266" cy="213" r="4" fill="#e3c983" stroke="#72603b"/><path d="M264 214l4-2" stroke="#76613b"/>
    </g>
  </g>
  ${mounted('bell',344,165,.63,107,20,'machine-bell')}
  <g transform="translate(395 217)"><g data-machine="hammer" class="machine-part">
    <rect x="-11" y="-3" width="22" height="10" rx="4" fill="#a3814c" stroke="#695631"/>
    <g class="hinged-hammer"><g transform="scale(-.44 .44) translate(-69 -105)">${pieceArt('hammer',true)}</g></g>
    <circle r="4.2" fill="#e3c982" stroke="#6e5935"/><path d="m-2 1 4-2" stroke="#796645"/>
  </g></g></g>
  ${mounted('feather',421,99,.42,66,108)}
  <path d="M95 257h135m100 0h130" stroke="#c49971" opacity=".6"/>
  <rect x="256" y="248" width="48" height="16" rx="4" fill="#bc9a5d" stroke="#715632"/><path d="M271 256h18" stroke="#79623d"/>
  <text x="280" y="294" text-anchor="middle" fill="#756e54" font-size="9" letter-spacing="1" font-family="monospace">FIG. 02 · ESTUDO DO MECANISMO</text></svg>`;
}

export function soundTest(context, result, turbo){
  const ring = result.ok || result.state==='busy';
  const times = result.state==='busy' && turbo ? [0,.28,.56] : result.state==='busy' ? [0,.38] : [0];
  const partials = ring ? [[784,.15,1.35],[1569,.045,.68],[2180,.018,.32],[3232,.008,.13]] : [[result.state==='quiet'?240:155,.045,.09]];
  for(const offset of times) for(const [hz,peak,decay] of partials){
    const start=context.currentTime+.05+offset, osc=context.createOscillator(), gain=context.createGain();
    osc.frequency.value=hz; osc.connect(gain); gain.connect(context.destination);
    gain.gain.setValueAtTime(.00001,start);
    gain.gain.exponentialRampToValueAtTime(peak,start+.006);
    gain.gain.exponentialRampToValueAtTime(.00001,start+decay);
    osc.start(start); osc.stop(start+decay+.01);
    osc.onended=()=>{osc.disconnect();gain.disconnect()};
  }
}

export function centerTrain(root, selected){
  const spans = {spring:[120,202],gear:[218,319],turbo:[272,337],bell:[317,371],hammer:[353,406]};
  const occupied = [...selected].map(id=>spans[id]).filter(Boolean);
  const left = Math.min(...occupied.map(span=>span[0]));
  const right = Math.max(...occupied.map(span=>span[1]));
  const offset = occupied.length ? 280-(left+right)/2 : 0;
  root.querySelector('#fitted-train').setAttribute('transform', 'translate('+offset+' 0)');
}
