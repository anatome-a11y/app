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
window.__inicial = null;
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
var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setClearColor(0x000000, 0);
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
controls.enableDamping = false;
controls.zoomToCursor = false;

function avisarGesto(ativo) {
  enviar({ type: 'gesture', active: ativo });
}
view.addEventListener('touchstart', function () { avisarGesto(true); }, true);
view.addEventListener('touchend', function (e) { avisarGesto(e.touches && e.touches.length > 0); }, true);
view.addEventListener('touchcancel', function (e) { avisarGesto(e.touches && e.touches.length > 0); }, true);

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
    if (child.userData && child.userData.materialOriginal) {
      var clone = child.material;
      child.material = child.userData.materialOriginal;
      var clones = Array.isArray(clone) ? clone : [clone];
      clones.forEach(function (material) {
        if (material && material.dispose) material.dispose();
      });
    }
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
      enviar({ type: 'select', label: String(ponto.label), parteId: ponto.parteId || '', parteNome: ponto.parteNome || '' });
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

// Mesma chave e a mesma paleta de site/src/ObjectViewer/destaqueMalha.js.
var CORES_PARTE = ['#f5222d', '#1890ff', '#52c41a', '#fa8c16', '#722ed1', '#13c2c2', '#eb2f96', '#faad14', '#2f54eb', '#a0d911'];

function corDaParte(label) {
  var numero = parseInt(label, 10);
  var indice = isNaN(numero) ? 0 : Math.abs(numero) % CORES_PARTE.length;
  return CORES_PARTE[indice];
}

function chaveMalha(mesh) {
  var partes = [];
  var atual = mesh;
  while (atual) {
    var nome = (atual.name || '').trim() || 'malha';
    if (!atual.parent || atual.parent.isScene) {
      partes.unshift(nome + '#raiz');
      break;
    }
    var indice = atual.parent.children.indexOf(atual);
    partes.unshift(nome + '#' + indice);
    atual = atual.parent;
  }
  return partes.join('/');
}

function descartarMaterial(material) {
  if (!material) return;
  var lista = Array.isArray(material) ? material : [material];
  lista.forEach(function (item) {
    if (item && item.dispose) item.dispose();
  });
}

function limparDestaques() {
  if (!modelo) return;
  var overlays = [];
  modelo.traverse(function (child) {
    if (child.userData && child.userData.destaqueParte) overlays.push(child);
  });
  overlays.forEach(function (overlay) {
    if (overlay.parent) overlay.parent.remove(overlay);
    if (overlay.geometry) overlay.geometry.dispose();
    descartarMaterial(overlay.material);
  });
  modelo.traverse(function (child) {
    if (!child.isMesh || !child.userData || !child.userData.materialOriginal) return;
    var clone = child.material;
    child.material = child.userData.materialOriginal;
    delete child.userData.materialOriginal;
    delete child.userData.marcacao;
    descartarMaterial(clone);
  });
}

function pintarMalhaInteira(mesh, cor) {
  if (!mesh.userData.materialOriginal) mesh.userData.materialOriginal = mesh.material;
  var origem = mesh.userData.materialOriginal;
  var lista = Array.isArray(origem) ? origem : [origem];
  var clones = lista.map(function (material) {
    var clone = material.clone();
    if (clone.color) clone.color.set(cor);
    if (clone.emissive && clone.emissive.isColor) {
      clone.emissive.set(cor);
      clone.emissiveIntensity = 0.45;
    }
    if (clone.emissiveMap) clone.emissiveMap = null;
    if (typeof clone.metalness === 'number') clone.metalness = Math.min(clone.metalness, 0.2);
    clone.needsUpdate = true;
    return clone;
  });
  mesh.material = Array.isArray(origem) ? clones : clones[0];
}

function criarOverlay(mesh, faces, cor) {
  var geometry = mesh.geometry;
  var position = geometry.attributes.position;
  var index = geometry.index;
  var coords = new Float32Array(faces.length * 9);
  var offset = 0;
  faces.forEach(function (face) {
    for (var vertice = 0; vertice < 3; vertice++) {
      var indice = index ? index.getX(face * 3 + vertice) : face * 3 + vertice;
      coords[offset++] = position.getX(indice);
      coords[offset++] = position.getY(indice);
      coords[offset++] = position.getZ(indice);
    }
  });
  var overlayGeometry = new THREE.BufferGeometry();
  overlayGeometry.setAttribute('position', new THREE.BufferAttribute(coords, 3));
  var material = new THREE.MeshBasicMaterial({
    color: cor,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });
  var overlay = new THREE.Mesh(overlayGeometry, material);
  overlay.userData.destaqueParte = true;
  overlay.renderOrder = 2;
  return overlay;
}

function pontosMundo(pontos) {
  var lista = [];
  for (var i = 0; i < pontos.length; i++) {
    var item = pontos[i];
    if (!item) continue;
    var ponto = new THREE.Vector3(Number(item.x), Number(item.y), Number(item.z));
    if (isNaN(ponto.x) || isNaN(ponto.y) || isNaN(ponto.z)) continue;
    lista.push(ponto);
  }
  return lista;
}

function criarRecorte(parent, pontos, cor, marcacao) {
  var lista = pontosMundo(pontos);
  if (!parent || lista.length < 3) return;
  parent.updateWorldMatrix(true, false);
  var coords = new Float32Array(lista.length * 3);
  for (var i = 0; i < lista.length; i++) {
    var local = parent.worldToLocal(lista[i].clone());
    coords[i * 3] = local.x;
    coords[i * 3 + 1] = local.y;
    coords[i * 3 + 2] = local.z;
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(coords, 3));
  var mat = new THREE.MeshBasicMaterial({
    color: cor,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.userData.destaqueParte = true;
  mesh.userData.marcacao = marcacao;
  mesh.renderOrder = 2;
  parent.add(mesh);
}

function desenharTraco(parent, pontos, cor, marcacao) {
  var lista = pontosMundo(pontos || []);
  if (!parent || lista.length < 2) return;
  parent.updateWorldMatrix(true, false);
  var locais = lista.map(function (ponto) { return parent.worldToLocal(ponto.clone()); });
  var caminho = new THREE.CurvePath();
  for (var i = 1; i < locais.length; i++) {
    if (locais[i].distanceToSquared(locais[i - 1]) < 1e-12) continue;
    caminho.add(new THREE.LineCurve3(locais[i - 1], locais[i]));
  }
  if (!caminho.curves.length) return;
  var escala = new THREE.Vector3();
  parent.getWorldScale(escala);
  var maior = Math.max(Math.abs(escala.x), Math.abs(escala.y), Math.abs(escala.z), 1e-6);
  var espessura = Math.max((raioModelo * 0.0016) / maior, 1e-4);
  var percurso = 0;
  for (var j = 1; j < locais.length; j++) percurso += locais[j].distanceTo(locais[j - 1]);
  if (locais.length > 2 && locais[0].distanceTo(locais[locais.length - 1]) <= Math.max(espessura * 6, percurso * 0.04)) {
    caminho.add(new THREE.LineCurve3(locais[locais.length - 1], locais[0]));
  }
  var geo = new THREE.TubeGeometry(caminho, Math.min(Math.max(caminho.curves.length, 2), 400), espessura, 3, false);
  var mat = new THREE.MeshBasicMaterial({ color: cor, depthWrite: false, transparent: true, opacity: 0.95 });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.userData.destaqueParte = true;
  mesh.userData.marcacao = marcacao;
  mesh.renderOrder = 3;
  parent.add(mesh);
}

function destacar(pontos) {
  limparDestaques();
  if (!modelo) return;
  var malhas = {};
  modelo.traverse(function (child) {
    if (child.isMesh && !(child.userData && child.userData.destaqueParte)) {
      malhas[chaveMalha(child)] = child;
    }
  });
  (pontos || []).forEach(function (ponto) {
    if (!ponto) return;
    var cor = corDaParte(ponto.label);
    var marcacao = {
      label: ponto.label == null ? '' : String(ponto.label),
      parteId: ponto.parteId || '',
      parteNome: ponto.parteNome || ''
    };
    var mesh = ponto.malha && malhas[ponto.malha];
    if (ponto.recorte && ponto.recorte.length >= 3) {
      criarRecorte(modelo, ponto.recorte, cor, marcacao);
    } else if (mesh && ponto.faces && ponto.faces.length) {
      var overlay = criarOverlay(mesh, ponto.faces, cor);
      overlay.userData.marcacao = marcacao;
      mesh.add(overlay);
    }
    if (ponto.traco && ponto.traco.length > 1) {
      desenharTraco(modelo, ponto.traco, cor, marcacao);
    }
  });
}

function marcacaoNoRaio(raycasterAlvo) {
  if (!modelo) return null;
  var anterior = raycasterAlvo.far;
  raycasterAlvo.far = Infinity;
  var acertos = raycasterAlvo.intersectObject(modelo, true);
  raycasterAlvo.far = anterior;
  for (var i = 0; i < acertos.length; i++) {
    var obj = acertos[i].object;
    if (obj.userData && obj.userData.marcacao) return obj.userData.marcacao;
  }
  return null;
}

function desenharPinos(dados) {
  limparPinos();
  modoPinos = dados.modo || 'leitura';
  var corPadrao = modoPinos === 'leitura' ? '#108ee9' : '#f5222d';
  var mostrarLabel = dados.exibirLabel !== false;
  (dados.pontos || []).forEach(function (ponto) {
    if (ponto == null || ponto.z == null) return;
    var cor = (ponto.malha || (ponto.traco && ponto.traco.length > 1)) ? corDaParte(ponto.label) : corPadrao;
    var el = criarPino(ponto, cor, modoPinos, mostrarLabel);
    var obj = new CSS2DObject(el);
    obj.position.set(Number(ponto.x), Number(ponto.y), Number(ponto.z));
    grupoPinos.add(obj);
    pinos.push(obj);
  });
  destacar(dados.pontos || []);
  oclusaoPendente = true;
  precisaDesenhar = true;
  quadrosExtras = 8;
}

function contarTriangulos(objeto) {
  var total = 0;
  objeto.traverse(function (child) {
    if (!child.isMesh || !child.geometry) return;
    var geo = child.geometry;
    if (geo.index) total += geo.index.count / 3;
    else if (geo.attributes && geo.attributes.position) total += geo.attributes.position.count / 3;
  });
  return total;
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
  pesado = contarTriangulos(modelo) > 40000;
  tamanho();
  enquadrar(modelo);
  desenharPinos(dados);
  statusEl.textContent = '';
  precisaDesenhar = true;
  quadrosExtras = 8;
  enviar({ type: 'loaded' });
}

function aplicarFundo(cor) {
  if (!cor) return;
  document.documentElement.style.background = cor;
  document.body.style.background = cor;
  var painel = document.getElementById('view');
  if (painel) painel.style.background = cor;
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
    precisaDesenhar = true;
    quadrosExtras = 8;
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
  if (dados.type === 'background') {
    aplicarFundo(dados.color);
    return;
  }
  if (dados.type === 'load') {
    if (dados.background) aplicarFundo(dados.background);
    carregar(dados);
  }
};

window.__fila.forEach(window.__receber);
window.__fila = [];
if (window.__inicial && window.__inicial.background) aplicarFundo(window.__inicial.background);
if (window.__inicial && window.__inicial.url) {
  carregar(window.__inicial);
} else {
  diag('2. Three.js pronto', 'aguardando o app enviar a URL');
}
enviar({ type: 'ready' });

var selecaoInicio = null;
var selecaoCancelada = false;
renderer.domElement.addEventListener('pointerdown', function (event) {
  if (event.button !== 0) return;
  selecaoInicio = { x: event.clientX, y: event.clientY };
  selecaoCancelada = false;
});
renderer.domElement.addEventListener('pointermove', function (event) {
  if (!selecaoInicio || selecaoCancelada) return;
  var dx = event.clientX - selecaoInicio.x;
  var dy = event.clientY - selecaoInicio.y;
  if (dx * dx + dy * dy > 25) selecaoCancelada = true;
});
renderer.domElement.addEventListener('pointerup', function (event) {
  var inicio = selecaoInicio;
  var clique = inicio && !selecaoCancelada && event.button === 0;
  selecaoInicio = null;
  selecaoCancelada = false;
  if (!clique || modoPinos !== 'selecao' || !modelo) return;
  var rect = renderer.domElement.getBoundingClientRect();
  var largura = rect.width || 1;
  var altura = rect.height || 1;
  var ndc = new THREE.Vector2(
    ((inicio.x - rect.left) / largura) * 2 - 1,
    -((inicio.y - rect.top) / altura) * 2 + 1
  );
  raycaster.setFromCamera(ndc, camera);
  var marca = marcacaoNoRaio(raycaster);
  if (!marca) return;
  enviar({ type: 'select', label: String(marca.label), parteId: marca.parteId || '', parteNome: marca.parteNome || '' });
});

var precisaDesenhar = true;
var quadrosExtras = 2;
var oclusaoPendente = true;
var pesado = false;
var arrastando = false;
var ultimoRender = 0;
controls.addEventListener('change', function () { precisaDesenhar = true; });
controls.addEventListener('start', function () { arrastando = true; });
controls.addEventListener('end', function () {
  arrastando = false;
  oclusaoPendente = true;
  precisaDesenhar = true;
  quadrosExtras = 2;
});
function quadro(agora) {
  requestAnimationFrame(quadro);
  if (controls.update()) precisaDesenhar = true;
  if (quadrosExtras > 0) {
    quadrosExtras--;
    precisaDesenhar = true;
  }
  if (!precisaDesenhar) return;
  if (pesado && arrastando && agora - ultimoRender < 48) return;
  ultimoRender = agora;
  if (oclusaoPendente && !arrastando && !pesado) {
    atualizarOclusao();
    oclusaoPendente = false;
  }
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  precisaDesenhar = false;
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

export function htmlVisualizador(inicial) {
    const json = JSON.stringify(inicial || null).replace(/</g, '\\u003c');
    return HTML_VISUALIZADOR.replace('window.__inicial = null;', 'window.__inicial = ' + json + ';');
}
