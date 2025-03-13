import './style.css'

import * as THREE from 'https://cdn.skypack.dev/three';

import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';

import { generateMagicSquareNoise, OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { config } from './config.js';

import { updateValues } from './config.js';

import { loadBirdModel, loadSounds, listener, musicBackground, jumpSFX, bird, correctSFX } from './loader.js';

import { equationGenerator, wrongAnswer } from './utils.js';

const startScreen = document.getElementById('startScreen')
const resetBestButton = document.getElementById('resetBest')
const deathScreen = document.getElementById('deathScreen');
const restartButton = document.getElementById('restartButton');


//html elems
let equationDisplay = document.getElementById('equation');





var font; // Global font variable
const fontloader = new FontLoader();
fontloader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(loadedFont) {
  font = loadedFont; // Assign the loaded font to the global variable
});


//set scene stuff
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio( window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight);
camera.position.set(0,16,-20);
camera.lookAt(0,0,0)

renderer.render(scene, camera);

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});





// Existing configuration
const groundLength = config.groundLength; // e.g., 10000
const groundWidth = config.groundWidth;   // e.g., 24
// Define tile size (size of each individual checkerboard tile)
const tileSize = 50; // Adjust this size for how large each checkerboard square should be
// Create the checkerboard texture using a canvas
const textureCanvas = document.createElement('canvas');
const ctx = textureCanvas.getContext('2d');
// Calculate how many tiles we need to cover the ground
const numTilesX = Math.ceil(groundWidth / tileSize);  // Tiles along the width
const numTilesY = Math.ceil(groundLength / tileSize); // Tiles along the length
// Set the canvas size based on the number of tiles and tile size
textureCanvas.width = numTilesX * tileSize;
textureCanvas.height = numTilesY * tileSize;
// Draw the checkerboard pattern on the canvas
function drawCheckerboard() {
  for (let i = 0; i < numTilesX; i++) {
    for (let j = 0; j < numTilesY; j++) {
      const color = (i + j) % 2 === 0 ? '#006400' : '#005200'; // Dark and light green
      ctx.fillStyle = color;
      ctx.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
    }
  }
}
drawCheckerboard();
// Create the texture from the canvas
const texture = new THREE.CanvasTexture(textureCanvas);
// Set texture repeat to match the ground size
texture.repeat.set(groundWidth / textureCanvas.width, groundLength / textureCanvas.height);
// Disable mipmap filtering and set filtering modes to prevent blurriness
texture.minFilter = THREE.LinearFilter;  // Prevents mipmaps from being used (sharp edges)
texture.magFilter = THREE.NearestFilter; // Prevents blurring when magnifying (sharp edges)
// Create the ground plane geometry
const groundShape = new THREE.PlaneGeometry(groundWidth, groundLength);
// Manually set UVs for the ground to make the texture repeat correctly
const uvs = groundShape.attributes.uv.array;
for (let i = 0; i < uvs.length; i += 2) {
  uvs[i] = uvs[i] * (groundWidth / textureCanvas.width);   // Scale the x-coordinates (horizontal)
  uvs[i + 1] = uvs[i + 1] * (groundLength / textureCanvas.height); // Scale the y-coordinates (vertical)
}
groundShape.attributes.uv.needsUpdate = true;
// Use MeshToonMaterial with the checkerboard texture
const groundMesh = new THREE.MeshToonMaterial({
  map: texture, // Applying the checkerboard texture
  side: THREE.DoubleSide, // Ensuring the checkerboard appears on both sides
});
// Create the ground mesh
const ground = new THREE.Mesh(groundShape, groundMesh);
ground.rotation.x = Math.PI / 2; // Rotate to make it horizontal
ground.position.set(0, 0, groundLength / 2 - 20); // Position the ground in the scene
// Add the ground to the scene
scene.add(ground);



//add light, scene
const pointLight = new THREE.PointLight(0xffffff, 3, 30, 0)
pointLight.castShadow = true
scene.add(pointLight)
const headLight = new THREE.PointLight(0xaaaaaa, 20, 10, 0.5)
scene.add(headLight)
const ambientLight = new THREE.AmbientLight(0xaaaaaa, 3)
scene.add(ambientLight)

// const gridHelper = new THREE.GridHelper(200, 25);
// const lighthelper = new THREE.PointLightHelper(pointLight);

const backgroundText = new THREE.TextureLoader().load('sky.jpg');
scene.background = backgroundText;

//add bird
// var bird = new THREE.Object3D;
// const glftLoader = new GLTFLoader();
// glftLoader.load('./models/mallard/scene.gltf', function ( gltf ) {
//     bird = gltf.scene;
//    bird.scale.set(6,6,6);
//   scene.add(bird);
//   bird.position.set(0,0,0);
// });
//zspeed is forward
//yspeed is height

let zspeed = 0;
let acceleration = config.birdAcceleration;
var charSpeed = config.birdSpeed;
function zspeedhelper(){zspeed=charSpeed;gameState=1}
let xspeed = 0;
let yspeed = 0;
let jump = 0 ;

//game state 0 = dead / not started 1 = going 2 = pause 4=not started
let gameState = 4
let airborne = 0; //0 = ground 1 = air

//connect screens
var numADig = config.digitsA;
var numBDig = config.digitsB;
var operator = config.operator;

//adds all spikes
const spikesList = []
let spikeDistance =  config.spikeDistance
let spikeOffset = config.spikeOffset
let spikeMaxAmount = config.spikeMaxAmount
let spikeNumber = spikeMaxAmount //inital amount loaded in


const spikeShape = new THREE.ConeGeometry(4, 8, 6);
spikeShape.scale(0.625,0.625,0.625);
  const spikeMaterial = new THREE.MeshToonMaterial({color: 0x333333});
  const ogspike = new THREE.Mesh(spikeShape, spikeMaterial);

function initialSpikes() {
  spikeNumber = spikeMaxAmount;
  for(let i = 0; i<spikesList.length; i++){scene.remove(spikesList[i])} //clear existing
spikesList.length=0;
//make new
if(spikeDistance==0){return;}
  for(let i = 0; i<spikeNumber; i++){
    const rng = Math.random()
    const spike = ogspike.clone()
    let xPos = (rng*groundWidth)-(groundWidth/2)
    if((xPos+2)>(groundWidth/2)){xPos-=2}
    if((xPos-2)<(-1*groundWidth/2)){xPos+=2}
    // console.log(xPos)
    spike.position.set(xPos,2.5,spikeDistance*i+spikeOffset)
    spikesList.push(spike)
    scene.add(spike)
  }}

  function generateNextSpike(index) {
    const rng = Math.random();
    const spike = ogspike.clone()
    let xPos = (rng*groundWidth)-(groundWidth/2)
    if((xPos+2)>(groundWidth/2)){xPos-=2}
    if((xPos-2)<(-1*groundWidth/2)){xPos+=2}
    // console.log(xPos)
    spike.position.set(xPos,2.5,spikeDistance*spikeNumber+spikeOffset)
    spikeNumber++;
    spikesList.splice(index, 0, spike)
    scene.add(spike)
    zspeed+=acceleration/2
  }

//adds all counters
const counterList = [];
const numberList = [];
const ansList = [];
const eqList = [];
let counterDistance = config.counterDistance;
let counterOffset = config.counterOffset;
let counterMaxAmount = config.counterNumber;
let counterNumber = counterMaxAmount;
  const counterShape1 = new THREE.PlaneGeometry(12,12);
  const counterShape2 = new THREE.PlaneGeometry(12,12);
  const counterMaterialRed = new THREE.MeshBasicMaterial({color:0xff2222, side: THREE.DoubleSide, transparent:true, opacity:0.8})
  const counterMaterialBlue = new THREE.MeshBasicMaterial({color:0x33aaaa, side: THREE.DoubleSide, transparent:true, opacity:0.8})
  const ogcounterRed = new THREE.Mesh(counterShape1, counterMaterialRed)
  const ogcounterBlue = new THREE.Mesh(counterShape2, counterMaterialBlue)


function initialCounters() {
  counterNumber = counterMaxAmount;
  for(let i = 0; i<counterList.length; i++){
    scene.remove(counterList[i])
    scene.remove(numberList[i])
  } //clear existing
  counterList.length=0;
  eqList.length=0;
  numberList.length=0;
  ansList.length=0;

  for(let j = 0; j<counterNumber; j++){
    const redCounter = ogcounterRed.clone()
    const blueCounter = ogcounterBlue.clone()
    redCounter.position.set(-6, 3, counterDistance*j+counterOffset)
    blueCounter.position.set(6, 3, counterDistance*j+counterOffset)
    counterList.push(redCounter)
    counterList.push(blueCounter)
    scene.add(redCounter)   
    scene.add(blueCounter)

    let equation = equationGenerator(numADig, numBDig, operator);
    let num1, num2;
  
    if(Math.random()<0.5){
   num1 = eval(equation);
   num2 = wrongAnswer(num1);
    }
    else
    {
      num2 = eval(equation);
   num1 = wrongAnswer(num2);
    }



    let randomNumber = num1
    const words = new TextGeometry(randomNumber.toString(), {
      font: font,
      size: 3,
      depth: 0
    } );
    const textMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
    words.computeBoundingBox();
    const textWidth = words.boundingBox.max.x - words.boundingBox.min.x;
    const textTest = new THREE.Mesh(words, textMaterial);
    textTest.scale.x = -1
    textTest.position.set(-6+(textWidth/2),4,counterDistance*j+counterOffset-1/128)
    scene.add(textTest);


    
    let randomNumber2 = num2
    const words2 = new TextGeometry(randomNumber2.toString(), {
      font: font,
      size: 3,
      depth: 0
    } );
    const textMaterial2 = new THREE.MeshBasicMaterial({color: 0x000000});
    words2.computeBoundingBox();
    const textWidth2 = words2.boundingBox.max.x - words2.boundingBox.min.x;

    const textTest2 = new THREE.Mesh(words2, textMaterial2);
    textTest2.scale.x = -1
    textTest2.position.set(6+(textWidth2/2),4,counterDistance*j+counterOffset-1/128)
    scene.add(textTest2);
    ansList.push(num1, num2)
    numberList.push(textTest, textTest2)
    eqList.push(equation, equation)
  }
}

function generateNextCounter(index){
  const redCounter = ogcounterRed.clone();
  const blueCounter = ogcounterBlue.clone();
  redCounter.position.set(-6, 3, counterDistance*counterNumber+counterOffset);
  blueCounter.position.set(6, 3, counterDistance*counterNumber+counterOffset);
  counterList.splice(index, 0, redCounter, blueCounter);
  scene.add(redCounter, blueCounter);

  let equation = equationGenerator(numADig, numBDig, operator);
  let num1, num2;

  if(Math.random()<0.5){
 num1 = eval(equation);
 num2 = wrongAnswer(num1);
  }
  else
  {
    num2 = eval(equation);
 num1 = wrongAnswer(num2);
  }


  let randomNumber = num1
  const words = new TextGeometry(randomNumber.toString(), {
    font: font,
    size: 3,
    depth: 0
  } );
  const textMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
  words.computeBoundingBox();
  const textWidth = words.boundingBox.max.x - words.boundingBox.min.x;
  const textTest = new THREE.Mesh(words, textMaterial);
  textTest.scale.x = -1
  textTest.position.set(-6+(textWidth/2),4,counterDistance*counterNumber+counterOffset-1/128)


  let randomNumber2 = num2
  const words2 = new TextGeometry(randomNumber2.toString(), {
    font: font,
    size: 3,
    depth: 0
  } );
  const textMaterial2 = new THREE.MeshBasicMaterial({color: 0x000000});
  words2.computeBoundingBox();
  const textWidth2 = words2.boundingBox.max.x - words2.boundingBox.min.x;

  const textTest2 = new THREE.Mesh(words2, textMaterial2);
  textTest2.scale.x = -1
  textTest2.position.set(6+(textWidth2/2),4,counterDistance*counterNumber+counterOffset-1/128) 
  
  scene.add(textTest);
  scene.add(textTest2);
  numberList.splice(index, 0, textTest, textTest2); 
  ansList.splice(index, 0, num1, num2)
  eqList.splice(index, 0, equation, equation)
  
  counterNumber++;
  zspeed+=acceleration*2

}




//INPUts
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;
  // if(keyCode==65){if(gameState==1){xspeed = 1}} //left a
  // if(keyCode==68){if(gameState==1){xspeed = -1}} //right d
  if(keyCode==82){if(gameState!=0){zspeed = 0; bird.position.set(0,0,0); gameState = 2; setTimeout(zspeedhelper,1000)}} //reset r
  if(keyCode==27){if(gameState==1){zspeed = 0; gameState = 2; musicBackground.pause()}else if(gameState==2){zspeed=charSpeed; musicBackground.play(); gameState=1}} //pause esc
  if(keyCode==32){if(gameState==1 && bird.position.y == 0){yspeed=config.jumpSpeed; jumpSFX.play()}} //jump space
  if(keyCode==77){musicBackground.pause()} //pause song m
}

let gravity=config.gravityAsc


let mouseX = 0; // Mouse's x position in normalized device coordinates (-1 to 1)

// Add an event listener to track the mouse position
window.addEventListener('mousemove', (event) => {
    // Get mouse position in screen coordinates (relative to the canvas)
    let mouseXRelative = (event.clientX / window.innerWidth) * 2 - 1; // Normalized to range [-1, 1]
    mouseX = mouseXRelative; // Update the global mouseX
});

let nearestSpikeIndex=0,nearestcounterIndex=0,nextCounterIndex =0

//animate
function updateGame() {


  if(gameState==0){
    let deathAnimation=0.1
// bird.rotateX((Math.random()-0.5)/25)
bird.rotateY(0.1)
// bird.rotateZ((Math.random()-0.5)/25)

bird.position.y+=deathAnimation
}


  
  if(gameState==1){
    //gravity

if(bird.position.y>0){
  if(yspeed>gravity){yspeed=yspeed-gravity}
    else{yspeed=yspeed-gravity/4}}
bird.position.y=bird.position.y+yspeed;
if(bird.position.y<0){bird.position.y=0};


//position upadte
   bird.position.x = mouseX * config.mouseScale

  bird.position.z += zspeed
  if(bird.position.x>groundWidth/2-1){bird.position.x=groundWidth/2-1}
  if(bird.position.x<-groundWidth/2+1){bird.position.x=-groundWidth/2+1}
  }


  //lights camera action
  camera.position.set(0, config.camHeight, bird.position.z-config.camBackDist)
  pointLight.position.set(0, 16, bird.position.z)
  headLight.position.set(bird.position.x, 8, bird.position.z)

  //Check Death, unload
  if(gameState==1){
    let prevNextCounterIndex = nextCounterIndex;
     nearestSpikeIndex = Math.round((bird.position.z-spikeOffset)/spikeDistance)%spikeMaxAmount;
     nearestcounterIndex = (Math.round((bird.position.z-counterOffset)/counterDistance)%counterMaxAmount)*2;
     nextCounterIndex = (Math.ceil((bird.position.z-counterOffset)/counterDistance)%counterMaxAmount)*2;
    
    if(nearestcounterIndex<0){nearestcounterIndex=0};
    if(nearestSpikeIndex<0){nearestSpikeIndex=0};
    if(nextCounterIndex<0){nextCounterIndex=0};



    // console.log(nearestcounterIndex)
    // console.log(ansList[nearestcounterIndex])
    // console.log(ansList[nearestcounterIndex+1])


    if(nearestSpikeIndex>=0&&nearestSpikeIndex<=spikeMaxAmount){
    if(bird.position.y < 0.5 && Math.abs(bird.position.z-spikesList[nearestSpikeIndex].position.z)
      +Math.abs(bird.position.x-spikesList[nearestSpikeIndex].position.x)<2){
    playerDied()
      }
    }

    // console.log(Math.abs(bird.position.z-counterList[nearestcounterIndex].position.z))
    if(prevNextCounterIndex!=nextCounterIndex){
      if(eval(eqList[nearestcounterIndex])==ansList[nearestcounterIndex]){
        if(bird.position.x>=0){
          playerDied();
        }
      } 
      else{
        if(bird.position.x<=0){
          playerDied();
        }
      }
      if(gameState==1){
      let j = prevNextCounterIndex;
      scene.remove(counterList[j], counterList[j+1]);
      counterList.splice(j, 2);
      scene.remove(numberList[j], numberList[j+1]);
      numberList.splice(j,2);
      ansList.splice(j,2);
      eqList.splice(j,2);
      generateNextCounter(j);
        correctSFX.play();
      }
    }

    // console.log(nextCounterIndex);
    if(gameState==1){
    equationDisplay.innerText=eqList[nextCounterIndex];
  }

    //spike check past
  // for(let j = 0; j<spikesList.length; j++){
  //   // if(bird.position.y < 0.5 && Math.abs(bird.position.z-spikesList[j].position.z)+Math.abs(bird.position.x-spikesList[j].position.x)<1.75){playerDied()}
  //   if(spikesList[j].position.z<bird.position.z-18){
  //     scene.remove(spikesList[j])
  //     spikesList.splice(j, 1);
  //     generateNextSpike(j);
  //     }
  //   }
  if(spikesList.length>2){
  let prevSpike = (nearestSpikeIndex+spikeMaxAmount-2)%spikeMaxAmount
    if(spikesList[prevSpike].position.z<bird.position.z-3){
      scene.remove(spikesList[prevSpike])
      spikesList.splice(prevSpike, 1);
      generateNextSpike(prevSpike);
      }
    }
    //counter check
    // for(let j = 0; j<counterList.length; j+=2){
    //   // if(bird.position.y < 0.5 && Math.abs(bird.position.z-spikesList[j].position.z)+Math.abs(bird.position.x-spikesList[j].position.x)<1.75){playerDied()}
    //   if(counterList[j].position.z<bird.position.z-5){
    //     scene.remove(counterList[j], counterList[j+1]);
    //     counterList.splice(j, 2);
    //     scene.remove(numberList[j], numberList[j+1]);
    //     numberList.splice(j,2);
    //     ansList.splice(j,2);
    //     eqList.splice(j,2);
    //     generateNextCounter(j);
    //     }
    //   }
  }

  
  
  camera.lookAt(0, 0, bird.position.z);
  // console.log(bird.position);
  // console.log(spikesList.length);
  renderer.render(scene,camera);
}


//frame stuff
let lastTime = 0;
var fps = config.fps;
let interval = 1000 / fps; // Time in ms between each frame (e.g., 33.33ms for 30 FPS)

function animate(currentTime) {
  // Calculate the time elapsed since the last frame
  const deltaTime = currentTime - lastTime;

  if (deltaTime > interval) {
    lastTime = currentTime - (deltaTime % interval); // Adjust for any lag/delays

    // Your update and rendering logic goes here:
    updateGame();
    renderer.render(scene, camera);
  }

  // Request the next frame
  requestAnimationFrame(animate);
}



// Function to begin the game (triggered by user action)
function beginGame() {
  startScreen.style.display = 'none';  // Hide start screen
  scene.add(bird);

  // Start the game
  initialSpikes();
  initialCounters();

  // Start the game animation
  requestAnimationFrame(animate);
  
  // Additional game setup
  setTimeout(zspeedhelper, 2000);
  musicBackground.play();
 
}



// // Attach the event listener to the start button
// document.getElementById('startButton').addEventListener('click', function() {
//   // Ensure AudioContext is resumed after user gesture
//   loadBirdModel(document.getElementById('bird').value, scene, bird)
//   updateValues();
//   setValues();
//   loadSounds(camera);  // Load sounds
//   beginGame();   // Start the game
// });
document.getElementById('startButton').addEventListener('click', function () {
  let birdModelPath = document.getElementById('bird').value;
  startScreen.style.display = 'none';  // Hide start screen

  // Create promises for loading models and sounds
  let loadModelPromise = new Promise((resolve, reject) => {
    console.log('Resolving loadBirdModel for:', birdModelPath);
    loadBirdModel(birdModelPath, scene, resolve); // `resolve` is passed as the callback
  });

  let loadSoundsPromise = new Promise((resolve, reject) => {
    console.log('Resolving loadSounds for camera');
    loadSounds(camera, resolve); // `resolve` is passed as the callback
  });

  // Wait for both the model and sounds to finish loading before starting the game
  Promise.all([loadModelPromise, loadSoundsPromise]).then(function () {
    updateValues();
    setValues();
    beginGame();  // Start the game
  }).catch(function (error) {
    console.error('Error loading resources:', error);
  });
});

//put right values on play
function setValues(){
  fps = config.fps;
  charSpeed = config.birdSpeed;
  acceleration = config.birdAcceleration;
  spikeDistance = config.spikeDistance;
  counterDistance = config.counterDistance;
  counterOffset = config.counterOffset;
  numADig = config.digitsA;
  numBDig = config.digitsB;
  operator = config.operator;


  interval = 1000 / fps
  gravity=gravity*60/fps
}

// Function to simulate player death
function playerDied() {
    // Show the death screen
    console.log(spikesList.length)
    console.log(spikeNumber)
    zspeed = 0;    
    gameState = 0

    //death sound
    jumpSFX.setDetune(-500);
    jumpSFX.playbackRate = 3
    jumpSFX.setLoop(true); // Set to loop indefinitely initially
    jumpSFX.play();
        setTimeout(() => {
      jumpSFX.setLoop(false);
      jumpSFX.setDetune(200)
      jumpSFX.playbackRate=1
    }, 400);



    nearestSpikeIndex=0,nearestcounterIndex=0,nextCounterIndex =0

    deathScreen.style.display = 'flex';
    let score = (spikeNumber - spikeMaxAmount) + 5*(counterNumber - counterMaxAmount) 


    let strHelper = 'bestScore' + Math.max(numADig, numBDig) + operator + Math.min(numADig, numBDig);
    let bestScore = localStorage.getItem(strHelper);
      if (!bestScore) {
        bestScore = 0;  // Default score if not found
      }
    if (score>bestScore) {
      bestScore=score;
      localStorage.setItem(strHelper, score);
    }
    document.getElementById('score').innerText="Score: " + score
    document.getElementById('bestScore').innerText="Best Score: " + bestScore
    document.getElementById('distanceTraveled').innerText="Distance Traveled: " + Math.round(bird.position.z) + " feet"
}


restartButton.addEventListener('click', restartGame);
resetBestButton.addEventListener('click', resetBest);
document.getElementById('returnStartScreen').addEventListener('click', function() {
  gameState=4;
  deathScreen.style.display = 'none';
  scene.remove(bird);
  musicBackground.disconnect();
  bird.position.set(0,0,0);
  startScreen.style.display = 'flex';
});

function restartGame() {
  // Hide the death screen
  gameState=4;
  deathScreen.style.display = 'none';
  // Reset the game state (for example, reset the cube's position)
  bird.position.set(0, 0, 0);
  bird.rotation.set(0,0,0)
  setTimeout(zspeedhelper,1000)

  initialSpikes();
  initialCounters();


  // Optionally reset other game variables here
}

// Retrieve best score
// If no score exists yet, you can set it to a default value


function resetBest() {
  localStorage.setItem('bestScore', 0);
  document.getElementById('bestScore').innerText="Best Score: " + 0
  bestScore = 0;
}


