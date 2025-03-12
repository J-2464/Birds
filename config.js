export const config = {
    //other
    fps: Number(document.getElementById("performance").value),

    //ground stuff
    groundLength: 10000,
    groundWidth: 24,


    //light stuff


    //character stuff
    birdSpeed: Number(document.getElementById("speed").value)*60/Number(document.getElementById("performance").value),
    birdAcceleration:  1/Number(document.getElementById("acceleration").value),


    //spike stuff
    spikeDistance: Number(document.getElementById("spikes").value),
    spikeOffset: 20,
    spikeMaxAmount: 10,


    //counter stuff
    counterDistance: Number(document.getElementById("problems").value),
    counterOffset: 20 + Number(document.getElementById("problems").value),
    counterNumber: 3,


    //gravity / jump
    jumpSpeed: 0.625,
    gravityAsc: 0.0375,
    gravityDesc: 0.0375/4,


    //camera
    camHeight: 12,
    camBackDist: 20,

    //mouse scale
    mouseScale: -32,

    //equation stuff
    digitsA: Number(document.getElementById("numADig").value),
    operator: Number(document.getElementById("operator").value),
    digitsB: Number(document.getElementById("numBDig").value),

    
  };

  export function updateValues(){
   
    config.fps=Number(document.getElementById("performance").value);
    config.birdSpeed=Number(document.getElementById("speed").value)*60/Number(document.getElementById("performance").value);
    config.birdAcceleration=1/Number(document.getElementById("acceleration").value);
    config.spikeDistance=Number(document.getElementById("spikes").value); 
    config.counterDistance=Number(document.getElementById("problems").value);
    config.digitsA=Number(document.getElementById("numADig").value)
    config.digitsB=Number(document.getElementById("numBDig").value)
    config.operator=Number(document.getElementById("operator").value)
    config.counterOffset= 20+Number(document.getElementById("problems").value);
  }