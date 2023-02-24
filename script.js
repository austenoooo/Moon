import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

import { Water } from "three/addons/objects/Water.js";

// refresh page when resized
window.onresize = function () {
  location.reload();
};

let scene, camera, renderer;

// loaded models
let ocean, boat; 
// texture
let textureCube;
// material
let moonMaterial;
// mesh
let moon;
let water;
let moonLight = new THREE.Vector3();

// animation
let mixer;
const clock = new THREE.Clock();

// postprocessing
let bloomComposer;

// audio
let audioListener;
let audioSource;



let controls;


// loaders
let textureLoader = new THREE.TextureLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("jsm/libs/draco/gltf/");
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(-25, 22, -50);
  camera.lookAt(0, 25, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  

  // helper functions
  const axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);
  const gridHelper = new THREE.GridHelper(25, 25);
  // scene.add(gridHelper);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;


  // add ambient light
  const ambientlight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambientlight);

  // load background
  loadCubeMap();

  createMoon();

  addSpatialSound();

  createOcean();
  // loadBoatModel();

  loop();
}

function loadCubeMap() {
  const imgArray = ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"];
  // load cubemap
  var cubeLoader = new THREE.CubeTextureLoader();
  cubeLoader.setPath("./textures/night_sky/");
  textureCube = cubeLoader.load(imgArray);
  scene.background = textureCube;
}


function addSpatialSound(){
  audioListener = new THREE.AudioListener();
  audioListener.position.set(0, 20, 0);
  scene.add(audioListener);
  
  const audioLoader = new THREE.AudioLoader();

  audioSource = new THREE.PositionalAudio(audioListener);

  audioLoader.load("audio/bgm.m4a", function (buffer){
    audioSource.setBuffer(buffer);
    audioSource.setDistanceModel("exponential");
    audioSource.setRefDistance(50);
    audioSource.setRolloffFactor(3);
    audioSource.setLoop(true);
    audioSource.play();
  });

  scene.add(audioSource);
  audioSource.position.set(
    Math.round(controls.object.position.x), 
    Math.round(controls.object.position.y), 
    Math.round(controls.object.position.z)
  );
  
}


// create the water surface
function createOcean(){
  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: textureLoader.load('textures/waternormals.jpg', function (texture){
       texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xfff7b3,
      waterColor: 0x06041f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined // what does this line of code mean?
    }
  );

  water.rotation.x = -Math.PI / 2;
  scene.add(water);
  water.position.set(0, 0, 25);
}

function createMoon(){
  //bloom renderer
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = 0;
  bloomPass.strength = 1; //intensity of glow
  bloomPass.radius = 0;
  bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = true;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);

  let moonTexture = textureLoader.load("textures/moon.jpeg");
  moonTexture.wrapS = THREE.RepeatWrapping;
  moonTexture.wrapT = THREE.RepeatWrapping;
  moonTexture.repeat.set(1, 1);
  
  moonMaterial = new THREE.MeshBasicMaterial({color: 0xfff7b3, map: moonTexture});
  moon = new THREE.Mesh(new THREE.SphereGeometry(20 * 5, 64, 32), moonMaterial);
  moon.position.set(50 * 5, 50 * 5, 100 * 5);
  // moon.layers.set(1);
  scene.add(moon);
}




function loadBoatModel() {
  loader.load(
    "models/boat.glb",
    function (gltf) {
      boat = gltf.scene;
      boat.position.set(0, 0, 0);
      // boat.scale.set(0.25, 0.25, 0.25);
      boat.scale.set(0.1, 0.1, 0.1);
      boat.rotation.set(0, -Math.PI/4, 0)
      scene.add(boat);
    },
    undefined,
    function (e) {
      console.error(e);
    }
  );
}



function loop() {

  water.material.uniforms['time'].value += 1.0 / 60.0;

  // camera.layers.set(1);
  bloomComposer.render();

  // make the audio listener follow the orbit control
  audioListener.position.set(Math.round(controls.object.position.x), Math.round(controls.object.position.y), Math.round(controls.object.position.z));

  // render the scene
  // renderer.render(scene, camera);

  // rinse and repeat
  window.requestAnimationFrame(loop);
}

init();
















