export const HTML_VISUALIZADOR = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  html, body { margin: 0; height: 100%; background: #f7f7f7; overflow: hidden; }
  #view { position: relative; width: 100%; height: 100%; touch-action: none; }
  #status {
    position: absolute; left: 8px; right: 8px; top: 50%;
    transform: translateY(-50%); text-align: center;
    color: rgba(0, 0, 0, 0.45); font: 14px sans-serif;
  }
</style>
</head>
<body>
<div id="view"><div id="status">Carregando modelo 3D...</div></div>
<script>
window.__fila = [];
window.__receber = null;
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
<script type="module">
import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.156.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.156.1/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'https://unpkg.com/three@0.156.1/examples/jsm/loaders/OBJLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'https://unpkg.com/three@0.156.1/examples/jsm/renderers/CSS2DRenderer.js';

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

function desenharPinos(dados) {
  limparPinos();
  var modo = dados.modo || 'leitura';
  var cor = modo === 'leitura' ? '#108ee9' : '#f5222d';
  (dados.pontos || []).forEach(function (ponto) {
    if (ponto == null || ponto.z == null) return;
    var el = document.createElement('div');
    el.textContent = dados.exibirLabel === false ? '' : String(ponto.label);
    el.title = ponto.parteNome || '';
    el.style.minWidth = '22px';
    el.style.height = '22px';
    el.style.padding = '0 6px';
    el.style.boxSizing = 'border-box';
    el.style.borderRadius = '11px';
    el.style.background = cor;
    el.style.color = '#fff';
    el.style.font = '600 12px sans-serif';
    el.style.lineHeight = '22px';
    el.style.textAlign = 'center';
    el.style.border = '2px solid #fff';
    el.style.pointerEvents = 'auto';
    if (modo === 'selecao') {
      el.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        enviar({ type: 'select', label: String(ponto.label) });
      });
    }
    var obj = new CSS2DObject(el);
    obj.position.set(Number(ponto.x), Number(ponto.y), Number(ponto.z));
    grupoPinos.add(obj);
    pinos.push(obj);
  });
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

function falha() {
  statusEl.textContent = 'Não foi possível carregar o modelo 3D.';
  enviar({ type: 'error', message: 'Não foi possível carregar o modelo 3D.' });
}

function carregar(dados) {
  if (!dados.url) {
    falha();
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
  statusEl.textContent = 'Carregando modelo 3D...';
  var tipo = dados.fileType || '';
  var aoPronto = function (objeto) {
    if (id !== carga) return;
    carregando = false;
    publicar(objeto, dados);
  };
  var aoErro = function () {
    if (id !== carga) return;
    carregando = false;
    urlCarregada = '';
    falha();
  };
  if (tipo === 'obj') {
    new OBJLoader().load(dados.url, aoPronto, undefined, aoErro);
  } else if (tipo === 'glb' || tipo === 'gltf') {
    new GLTFLoader().load(dados.url, function (gltf) { aoPronto(gltf.scene); }, undefined, aoErro);
  } else {
    aoErro();
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
enviar({ type: 'ready' });

function quadro() {
  requestAnimationFrame(quadro);
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
tamanho();
quadro();
window.addEventListener('resize', tamanho);
</script>
</body>
</html>`;
