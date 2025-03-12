import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Ensure correct path to the loader
import * as THREE from 'three';
import { ColorNodeUniform } from 'three/src/renderers/common/nodes/NodeUniform.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';


export var bird = new THREE.Object3D;

// Modified loadBirdModel to handle callback properly
export function loadBirdModel(name, scene, callback) {
    const gltfLoader = new GLTFLoader();
    let path = './models/' + name + '/scene.gltf';
    if(name=='porygon' || name=='penguin'){path =  './models/' + name + '/porygon.gltf';}
    
    // Log callback to check if it's a function
    console.log('Callback passed to loadBirdModel:', callback);
          console.log(name)
          console.log(path)
    gltfLoader.load(path, function (gltf) {
       bird = gltf.scene;
      if (name == 'duck') {
        bird.scale.set(6, 6, 6);
      }
      else if (name == 'mallard') {
        bird.scale.set(3, 3, 3);
        bird.rotateY(-0.29);
      }
      else if (name == 'bluejay') {
        bird.scale.set(3 / 4, 3 / 4, 3 / 4);
      }

      else if (name == 'porygon') {
        bird.scale.set(1 / 30, 1/30, 1 / 30);
      }

      else if (name == 'penguin') {
        bird.scale.set(1 / 20, 1/20, 1 / 20);
      }
      
      else if(name =='goose'){
        bird.scale.set(1 / 14, 1/14, 1 / 14);
      }

      else if(name =='parrot'){
        bird.scale.set(1 / 2, 1/2, 1 / 2);
      }

      else if(name =='rooster'){
        bird.scale.set(4/3, 4/3, 4/3);
      }

      else if(name =='trex'){
        bird.scale.set(1/6,1/6,1/6);
      }

      bird.position.set(0, 0, 0);
  
      // Check if callback is a function before calling it
      if (callback && typeof callback === 'function') {
        callback(); // Only call if callback is a valid function
      } else {
        console.error('Callback is not a function in loadBirdModel.');
      }
    }, undefined, function (error) {
      console.error('Error loading model:', error);
      if (callback && typeof callback === 'function') {
        callback(); // Call callback in case of error
      }
    });
  }

export var listener;
export var musicBackground;
export var jumpSFX;
export var correctSFX

export function loadSounds(camera, callback) {
    listener = new THREE.AudioListener();
    musicBackground = new THREE.Audio(listener);
    jumpSFX = new THREE.Audio(listener);
    correctSFX = new THREE.Audio(listener);

    const audioLoader = new THREE.AudioLoader();

    // Load the jump sound
    audioLoader.load('./sounds/effects/Jump.wav', function(buffer) {
        jumpSFX.setBuffer(buffer);
        jumpSFX.detune = 200;
        jumpSFX.setVolume(0.4);  // Set volume for jump SFX
    }, function(error) {
        console.error("Jump sound loading error:", error);
    });

    audioLoader.load('./sounds/effects/Correct.wav', function(buffer) {
      correctSFX.setBuffer(buffer);
      correctSFX.detune = 500;
      correctSFX.setVolume(0.7);  // Set volume for jump SFX
  }, function(error) {
      console.error("Correct sound loading error:", error);
  });



    // Load the background music
    audioLoader.load('./sounds/music/iceMario.ogg', function(buffer) {
        musicBackground.setBuffer(buffer);
        musicBackground.setLoop(true);  // Loop the music
        musicBackground.setVolume(0); // Adjust volume
        console.log("Background music loaded and ready.");
        
        // Play music once it's loaded
        callback();  // Call the callback function after loading
        // musicBackground.play();

    }, function(error) {
        console.error("Background music loading error:", error);
    });

    // Ensure listener is attached to the camera after user interaction
    camera.add(listener);
    
}

