import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

// refresh page when resized
window.onresize = function () {
  location.reload();
}

let scene, camera, renderer;

// loaded models
let ocean, boat;

// animation
let mixer;
const clock = new THREE.Clock();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'jsm/libs/draco/gltf/' );
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(25, 25, 25);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({antialias: true});
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

  // loadOceanModel();
  
  loadBoatModel();


  // TODO: think about when to put loop so that it is only ran when all models are loaded
  loop();
}


function loadOceanModel(){
  
  loader.load('models/ocean.glb', function (gltf){
    ocean = gltf.scene;
    ocean.position.set(0, 0, 0);
    ocean.scale.set(10, 10, 10);
    scene.add(ocean);

    mixer = new THREE.AnimationMixer(ocean);
    mixer.clipAction(gltf.animations[0]).play();

    
  }, undefined, function (e){
    console.error(e);
  });
}

function loadBoatModel(){
  loader.load('models/boat.glb', function (gltf){
    boat = gltf.scene;
    boat.position.set(0, 0, 0);
    boat.scale.set(10, 10, 10);
    scene.add(boat);
    
  }, undefined, function (e){
    console.error(e);
  });
}

function loop(){

  // animation
  // const delta = clock.getDelta();
  // mixer.update(delta);

  // render the scene
  renderer.render(scene, camera);

  // rinse and repeat
  window.requestAnimationFrame(loop);
}

init();
