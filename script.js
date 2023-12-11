const status = document.getElementById('status');
if (status) {
  status.innerText = 'Loaded TensorFlow.js - version: ' + tf.version.tfjs;
}

const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');

// Check if webcam access is supported.
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
}
  
// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function which we will 
// define in the next step.
if (getUserMediaSupported()) {
enableWebcamButton.addEventListener('click', enableCam);
} else {
console.warn('getUserMedia() is not supported by your browser');
}

// Enable the live webcam view and start classification.
function enableCam(event) {
    // Only continue if the COCO-SSD has finished loading.
    if (!model) {
      return;
    }
    
    // Hide the button once clicked.
    event.target.classList.add('removed');  
    
    // getUsermedia parameters to force video but not audio.
    const constraints = {
      video: true
    };
  
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      video.srcObject = stream;
      video.addEventListener('loadeddata', predictWebcam);
    });
}

// Placeholder function for next step.
var children = [];

function predictWebcam() {
  // Now let's start classifying a frame in the stream.
  model.detect(video).then(function (predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);
    
    for (let n = 0; n < predictions.length; n++) {
      if (predictions[n].score > 0.2) {
        const p = document.createElement('p');
        p.innerText = predictions[n].class  + ' -  ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '%';
  
        // 更新定位方式
        p.style = 'position: absolute; left: ' + (predictions[n].bbox[0] + video.offsetLeft) + 'px; top: '
            + (predictions[n].bbox[1] + video.offsetTop - 10) + 'px; width: ' 
            + (predictions[n].bbox[2] - 10) + 'px; color: white; background: rgba(0, 0, 0, 0.5); padding: 4px; border-radius: 8px;';
  
        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'position: absolute; left: ' + (predictions[n].bbox[0] + video.offsetLeft) + 'px; top: '
            + (predictions[n].bbox[1] + video.offsetTop) + 'px; width: ' 
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';
  
        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }
    
    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });
}

var model = true;
demosSection.classList.remove('invisible');

// Store the resulting model in the global scope
var model = undefined;

cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  demosSection.classList.remove('invisible');
});

