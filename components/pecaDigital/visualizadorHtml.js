export const HTML_VISUALIZADOR = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  html, body { margin: 0; height: 100%; background: #f7f7f7; overflow: hidden; }
  #view { position: relative; width: 100%; height: 100%; touch-action: none; }
  #status {
    position: absolute; left: 8px; right: 8px; top: 8px; z-index: 5;
    text-align: left; white-space: pre-wrap; word-break: break-all;
    background: rgba(255, 255, 255, 0.94); color: #222;
    font: 12px sans-serif; padding: 6px; border-radius: 4px;
  }
</style>
</head>
<body>
<div id="view"><div id="status">1. Pagina do visualizador aberta</div></div>
<script>
window.__fila = [];
window.__receber = null;
window.__threeOk = false;
window.onerror = function (msg, src, line) {
  var el = document.getElementById('status');
  if (el) el.textContent = 'Erro JS: ' + msg + ' (linha ' + line + ')';
  try {
    window.__enviar(JSON.stringify({ type: 'diag', etapa: 'erro js', extra: String(msg) + ' linha ' + line }));
  } catch (e) {}
};
function __aoMensagem(e) {
  var raw = e && e.data ? e.data : e;
  if (typeof raw !== 'string') return;
  if (window.__receber) window.__receber(raw);
  else window.__fila.push(raw);
}
document.addEventListener('message', __aoMensagem);
window.addEventListener('message', __aoMensagem);
window.__enviar = function (data) {
  try {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(data);
      return;
    }
  } catch (err) {}
  if (window.postMessage) window.postMessage(data);
};
</script>
<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.156.1/build/three.module.js"
  }
}
</script>
<script type="module">
import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.156.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.156.1/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'https://unpkg.com/three@0.156.1/examples/jsm/loaders/OBJLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'https://unpkg.com/three@0.156.1/examples/jsm/renderers/CSS2DRenderer.js';

window.__threeOk = true;
var view = document.getElementById('view');
var statusEl = document.getElementById('status');
var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.domElement.style.display = 'block';
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';
view.appendChild(renderer.domElement);

var labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.left = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
view.appendChild(labelRenderer.domElement);

var scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.6));
var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
var luz = new THREE.DirectionalLight(0xffffff, 1.2);
luz.position.set(0, 0, 1);
camera.add(luz);
scene.add(camera);

var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.zoomToCursor = true;

var modelo = null;
var grupoPinos = new THREE.Group();
var pinos = [];
scene.add(grupoPinos);
var carga = 0;
var urlCarregada = '';
var carregando = false;
var raioModelo = 1;
var modoPinos = 'leitura';
var raycaster = new THREE.Raycaster();
var direcao = new THREE.Vector3();
var posicaoPino = new THREE.Vector3();

function tamanho() {
  var largura = view.clientWidth || 300;
  var altura = view.clientHeight || largura;
  camera.aspect = largura / altura;
  camera.updateProjectionMatrix();
  renderer.setSize(largura, altura, false);
  labelRenderer.setSize(largura, altura);
}

function enviar(obj) {
  window.__enviar(JSON.stringify(obj));
}

function diag(etapa, extra) {
  var texto = etapa + (extra ? '\\n' + extra : '');
  statusEl.textContent = texto;
  enviar({ type: 'diag', etapa: etapa, extra: extra || '' });
}

function limparPinos() {
  pinos.forEach(function (pin) {
    if (pin.element && pin.element.parentNode) pin.element.parentNode.removeChild(pin.element);
  });
  scene.remove(grupoPinos);
  grupoPinos = new THREE.Group();
  scene.add(grupoPinos);
  pinos = [];
}

function descartarModelo() {
  if (!modelo) return;
  scene.remove(modelo);
  modelo.traverse(function (child) {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      var materiais = Array.isArray(child.material) ? child.material : [child.material];
      materiais.forEach(function (material) { material.dispose(); });
    }
  });
  modelo = null;
}

function enquadrar(objeto) {
  var esfera = new THREE.Box3().setFromObject(objeto).getBoundingSphere(new THREE.Sphere());
  var raio = esfera.radius > 0 ? esfera.radius : 1;
  raioModelo = raio;
  var centro = esfera.center;
  var fovV = THREE.MathUtils.degToRad(camera.fov);
  var fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect);
  var distancia = (raio / Math.sin(Math.min(fovV, fovH) / 2)) * 1.15;
  camera.near = Math.max(raio / 100, 0.01);
  camera.far = distancia + raio * 100;
  camera.position.copy(centro).add(new THREE.Vector3(0, 0, distancia));
  camera.updateProjectionMatrix();
  controls.target.copy(centro);
  controls.minDistance = raio * 0.25;
  controls.maxDistance = distancia * 6;
  controls.update();
}

function criarPino(ponto, cor, modo, mostrarLabel) {
  var pin = document.createElement('div');
  pin.title = ponto.parteNome || '';
  pin.style.width = '10px';
  pin.style.height = '10px';
  pin.style.boxSizing = 'border-box';
  pin.style.borderRadius = '50%';
  pin.style.background = cor;
  pin.style.border = '2px solid #fff';
  pin.style.boxShadow = '0 0 0 1px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.4)';
  pin.style.pointerEvents = modo === 'selecao' ? 'auto' : 'none';
  pin.style.transition = 'opacity 0.2s';

  var haste = document.createElement('div');
  haste.style.position = 'absolute';
  haste.style.left = '50%';
  haste.style.bottom = '100%';
  haste.style.width = '2px';
  haste.style.height = '12px';
  haste.style.marginLeft = '-1px';
  haste.style.background = '#fff';
  haste.style.boxShadow = '0 0 0 0.5px rgba(0, 0, 0, 0.35)';
  haste.style.pointerEvents = 'none';
  pin.appendChild(haste);

  if (mostrarLabel && ponto.label) {
    var selo = document.createElement('div');
    selo.textContent = String(ponto.label);
    selo.style.position = 'absolute';
    selo.style.left = '50%';
    selo.style.bottom = 'calc(100% + 12px)';
    selo.style.transform = 'translateX(-50%)';
    selo.style.minWidth = '20px';
    selo.style.height = '20px';
    selo.style.padding = '0 6px';
    selo.style.boxSizing = 'border-box';
    selo.style.borderRadius = '10px';
    selo.style.background = cor;
    selo.style.border = '1px solid #fff';
    selo.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.4)';
    selo.style.color = '#fff';
    selo.style.font = '600 12px sans-serif';
    selo.style.lineHeight = '18px';
    selo.style.textAlign = 'center';
    selo.style.whiteSpace = 'nowrap';
    selo.style.pointerEvents = 'none';
    pin.appendChild(selo);
  }

  if (modo === 'selecao') {
    pin.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      enviar({ type: 'select', label: String(ponto.label) });
    });
  }
  return pin;
}

function superficieVisivel(objeto) {
  for (var atual = objeto; atual; atual = atual.parent) {
    if (!atual.visible) return false;
  }
  return true;
}

function primeiraSuperficie(raycasterAlvo, model) {
  if (!model) return null;
  var acertos = raycasterAlvo.intersectObject(model, true);
  for (var i = 0; i < acertos.length; i++) {
    var acerto = acertos[i];
    if (acerto.object.isMesh && acerto.face && superficieVisivel(acerto.object)) {
      return acerto;
    }
  }
  return null;
}

function atualizarOclusao() {
  if (!modelo || pinos.length === 0) return;
  var tolerancia = raioModelo * 0.005;
  for (var i = 0; i < pinos.length; i++) {
    var pin = pinos[i];
    pin.getWorldPosition(posicaoPino);
    direcao.subVectors(posicaoPino, camera.position);
    var distancia = direcao.length();
    if (distancia === 0) continue;
    raycaster.set(camera.position, direcao.normalize());
    raycaster.far = distancia;
    var acerto = primeiraSuperficie(raycaster, modelo);
    var oculto = acerto !== null && acerto.distance < distancia - tolerancia;
    pin.element.style.opacity = oculto ? '0.3' : '1';
    pin.element.style.pointerEvents = (!oculto && modoPinos === 'selecao') ? 'auto' : 'none';
  }
}

function desenharPinos(dados) {
  limparPinos();
  modoPinos = dados.modo || 'leitura';
  var cor = modoPinos === 'leitura' ? '#108ee9' : '#f5222d';
  var mostrarLabel = dados.exibirLabel !== false;
  (dados.pontos || []).forEach(function (ponto) {
    if (ponto == null || ponto.z == null) return;
    var el = criarPino(ponto, cor, modoPinos, mostrarLabel);
    var obj = new CSS2DObject(el);
    obj.position.set(Number(ponto.x), Number(ponto.y), Number(ponto.z));
    grupoPinos.add(obj);
    pinos.push(obj);
  });
  atualizarOclusao();
}

function publicar(objeto, dados) {
  descartarModelo();
  modelo = objeto;
  modelo.traverse(function (child) {
    if (child.isMesh && !child.material) {
      child.material = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.7 });
    }
  });
  scene.add(modelo);
  tamanho();
  enquadrar(modelo);
  desenharPinos(dados);
  statusEl.textContent = '';
  enviar({ type: 'loaded' });
}

function detalheErro(erro) {
  if (!erro) return 'sem detalhe';
  if (erro.message) return String(erro.message);
  if (erro.status) return 'HTTP ' + erro.status + ' ' + (erro.statusText || '');
  if (erro.type) return String(erro.type);
  try { return JSON.stringify(erro); } catch (e) { return String(erro); }
}

function falha(erro, url) {
  var texto = 'Falha ao carregar' + (url ? '\\n' + url : '') + '\\n' + detalheErro(erro);
  statusEl.textContent = texto;
  enviar({ type: 'error', message: texto });
}

function carregar(dados) {
  if (!dados.url) {
    falha({ message: 'URL vazia' }, '');
    return;
  }
  if (dados.url === urlCarregada && modelo) {
    desenharPinos(dados);
    statusEl.textContent = '';
    enviar({ type: 'loaded' });
    return;
  }
  if (dados.url === urlCarregada && carregando) {
    return;
  }
  var id = ++carga;
  urlCarregada = dados.url;
  carregando = true;
  var tipo = dados.fileType || '(sem extensao)';
  diag('3. Baixando modelo', tipo + '\\n' + dados.url);
  var aoPronto = function (objeto) {
    if (id !== carga) return;
    carregando = false;
    publicar(objeto, dados);
  };
  var aoProgresso = function (evento) {
    if (id !== carga || !evento) return;
    var pct = evento.lengthComputable && evento.total
      ? Math.round(evento.loaded / evento.total * 100) + '%'
      : String(evento.loaded || 0) + ' bytes';
    statusEl.textContent = '3. Baixando ' + pct + '\\n' + dados.url;
  };
  var aoErro = function (erro) {
    if (id !== carga) return;
    carregando = false;
    urlCarregada = '';
    falha(erro, dados.url);
  };
  if (tipo === 'obj') {
    new OBJLoader().load(dados.url, aoPronto, aoProgresso, aoErro);
  } else if (tipo === 'glb' || tipo === 'gltf') {
    new GLTFLoader().load(dados.url, function (gltf) { aoPronto(gltf.scene); }, aoProgresso, aoErro);
  } else {
    aoErro({ message: 'Formato nao suportado: ' + tipo });
  }
}

window.__receber = function (bruto) {
  if (!bruto) return;
  var dados;
  try { dados = JSON.parse(bruto); } catch (e) { return; }
  if (dados.type === 'load') carregar(dados);
};

window.__fila.forEach(window.__receber);
window.__fila = [];
diag('2. Three.js pronto', 'aguardando o app enviar a URL');
enviar({ type: 'ready' });

var ultimoOclusao = 0;
function quadro() {
  requestAnimationFrame(quadro);
  controls.update();
  var agora = (window.performance && performance.now) ? performance.now() : Date.now();
  if (agora - ultimoOclusao > 100) {
    ultimoOclusao = agora;
    atualizarOclusao();
  }
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
tamanho();
quadro();
window.addEventListener('resize', tamanho);
</script>
<script>
setTimeout(function () {
  if (!window.__threeOk) {
    var el = document.getElementById('status');
    if (el) el.textContent = 'Three.js nao iniciou.\\nO WebView nao concluiu o import de https://unpkg.com';
    try {
      window.__enviar(JSON.stringify({ type: 'diag', etapa: 'three nao iniciou', extra: 'import unpkg nao concluiu' }));
    } catch (e) {}
  }
}, 8000);
</script>
</body>
</html>`;
