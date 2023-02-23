import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

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

// animation
let mixer;
const clock = new THREE.Clock();

// postprocessing
let bloomComposer;


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
  camera.position.set(-25, 0, -50);
  camera.lookAt(0, 25, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  

  // helper functions
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
  const gridHelper = new THREE.GridHelper(25, 25);
  scene.add(gridHelper);

  // add orbit control
  let controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // add ambient light
  const ambientlight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambientlight);

  // load background
  loadCubeMap();

  createMoon();

  // loadOceanModel();
  loadBoatModel();

  // TODO: think about when to put loop so that it is only ran when all models are loaded
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


function loadOceanModel() {
  loader.load(
    "models/ocean.glb",
    function (gltf) {
      ocean = gltf.scene;
      ocean.position.set(0, -10, 0);
      ocean.scale.set(20, 20, 20);
      
      // add material
      let oceanDiffuse = textureLoader.load("textures/ocean/diffuse.png");
      oceanDiffuse.wrapS = THREE.RepeatWrapping;
      oceanDiffuse.wrapT = THREE.RepeatWrapping;
      oceanDiffuse.repeat.set(1, 1);

      let oceanNormal = textureLoader.load("textures/ocean/normal.png");
      oceanNormal.wrapS = THREE.RepeatWrapping;
      oceanNormal.wrapT = THREE.RepeatWrapping;
      oceanNormal.repeat.set(1, 1);

      let oceanMaterial = new THREE.MeshStandardMaterial({
        normalMap: oceanNormal,
        // transparent: true,
        // opacity: 0.5,
        map: oceanDiffuse,
        envMap: textureCube,
        color: 0x000563,
        metalness: 0.9,
        roughness: 0,

      });

      ocean.traverse((o) => {
        if (o.isMesh){
          o.material = oceanMaterial;
        }
      });
      
      scene.add(ocean);

      mixer = new THREE.AnimationMixer(ocean);
      mixer.clipAction(gltf.animations[0]).play();

      // loop();
    },
    undefined,
    function (e) {
      console.error(e);
    }
  );
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
  // animation
  // const delta = clock.getDelta();
  // mixer.update(delta);

  // camera.layers.set(1);
  bloomComposer.render();

  // render the scene
  // renderer.render(scene, camera);

  // rinse and repeat
  window.requestAnimationFrame(loop);
}

init();
