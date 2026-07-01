import { initBuffers } from "./init-buffer.js";
import { drawScene } from "./draw-scene.js";
import { mat4 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js';

async function loadPOI() {
    const res = await fetch("../../SYSTEM/3dModelTools/poi.json");// ! the path is from the index.html(or form the linked page)
    return await res.json();
}

inizialize()
//==============================================================================================================
function inizialize(){
  // --- inizialize variables --------------------------------------------------------------------------------------
  let subdivisions = 64;  // sphere quality
  let MatriceDiRotazione = mat4.create(); // creo una matrice di rotazione
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let zoom = -3.0; // set default zoom
  let lastPinchDistance = null;
 // --- Inizialize program ------------------------------------------------------------------------------------------
  const canvas = document.getElementById("myCanvas");
  const gl = canvas.getContext("webgl");
  // loading world texture
  // ! the path is from the index.html(or form the linked page)
  const Texture = loadTexture(gl, "../../SYSTEM/3dModelTools/Textures/Mappamondo.png");
  loadPOI().then(poiData => setupPOI(MatriceDiRotazione, poiData))// setup Point Of Interest list in html

  // QUESTA SEZIONE FATTA CON L'AI PERCHè PER QUALCHE MOTIVO QUANDO FACEVI SESIZE LA QUALITà DELLA TEXTURE DIMINUIVA DRASTICAMENTE  
  function resizeCanvas() { //some problems resizing the canvas
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.clientWidth  * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resizeCanvas(); 
  window.addEventListener("resize", resizeCanvas);
  // --- Mouse rotation ---------------------------------------------------------------------------------------------
  canvas.addEventListener("mousedown", (e) => {   
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }); // check if mouse is dragging

  canvas.addEventListener("mousemove", (e) => { // change rotation
      if (!isDragging) return;
      const dx = (e.clientX - lastMouseX) * 0.005; // mouse sensivity
      const dy = (e.clientY - lastMouseY) * 0.005; // mouse sensivity

      const Y = mat4.create(); // create matrix for x
      const X = mat4.create(); // create matrix for y
      mat4.fromRotation(Y, dx, [0, 1, 0]);
      mat4.fromRotation(X, dy, [1, 0, 0]);
      mat4.multiply(MatriceDiRotazione, X, MatriceDiRotazione);
      mat4.multiply(MatriceDiRotazione, Y, MatriceDiRotazione);
      

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
  });

  canvas.addEventListener("mouseup",   () => { isDragging = false; }); // check if mouse is still dragging
  canvas.addEventListener("mouseleave",() => { isDragging = false; }); // check if mouse is still dragging
  
  canvas.addEventListener("wheel", (e) => {
      zoom += e.deltaY * -0.01;
      zoom = Math.max(-10.0, Math.min(-1.5, zoom)); // limit min/max
      e.preventDefault();
  }, { passive: false });

  // --- Touch rotation ---------------------------------------------------------------------------------------------
  canvas.addEventListener("touchstart", (e) => { // check if finger is touching
      isDragging = true;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
  });
  canvas.addEventListener("touchmove", (e) => {// change rotation
      if (!isDragging) return;

      if (e.touches.length === 2){ // check if is doing a pinch
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (lastPinchDistance !== null) {
            const delta = lastPinchDistance - distance;
            zoom += delta * -0.01;
            zoom = Math.max(-10.0, Math.min(-1.5, zoom));
        }
        lastPinchDistance = distance;
        e.preventDefault();
        return;
      }
      lastPinchDistance = null

      const dx = (e.touches[0].clientX - lastMouseX) * 0.005; // finger sensivity
      const dy = (e.touches[0].clientY - lastMouseY) * 0.005; // finger sensivity
      
      const Y = mat4.create(); // create matrix for x
      const X = mat4.create(); // create matrix for y
      mat4.fromRotation(Y, dx, [0, 1, 0]);
      mat4.fromRotation(X, dy, [1, 0, 0]);

      mat4.multiply(MatriceDiRotazione, Y, MatriceDiRotazione);
      mat4.multiply(MatriceDiRotazione, X, MatriceDiRotazione);
      
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
      e.preventDefault();
  }, { passive: false });
  canvas.addEventListener("touchend", () => { 
    isDragging = false;
    lastPinchDistance = null;
   });
// --- Vertex Shader program ---------------------------------------------------------------------------------------------    
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;
    varying highp vec3 vNormal;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
      vNormal = aVertexNormal;

      // Apply lighting effect

      highp vec3 ambientLight = vec3(0.20, 0.42, 0.60);
      highp vec3 directionalLightColor = vec3(1.0, 1.0, 0.50);
      highp vec3 directionalVector = normalize(vec3(0.50, 1.0, 1.0));

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
  `;

  // --- Fragment Shader program ---------------------------------------------------------------------------------------------    
  const fsSource = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;
    varying highp vec3 vNormal;

    uniform sampler2D uTexture;

    void main(void) {
      highp vec4 finalColor = texture2D(uTexture, vTextureCoord);
      gl_FragColor = vec4(finalColor.rgb * vLighting, finalColor.a);
    }
  `;

  // --- Establishing Shaders --------------------------------------------------------------------------------------------- 
  // Initialize a shader program; this is where all the lighting for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    
  // Collect all the info needed to use the shader program. Look up which attribute our shader program is using for aVertexPosition and look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
      textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
      uTexture:  gl.getUniformLocation(shaderProgram, "uTexture"),
    },
  };

    // Where we call the routine that builds all the objects.--------------------------------------------------------------- 
    const buffers = initBuffers(gl, subdivisions);

    // Draw the scene repeatedly (necessary for wiating the texture to load and for update rotation)
    function render(now) {
      drawScene(gl, programInfo, buffers, MatriceDiRotazione, zoom, Texture);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}
//==============================================================================================================
// Initialize the shader program, so WebGL knows how to draw our data
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {   alert(   `Unable to initialize the shader program: ${gl.getProgramInfoLog(   shaderProgram,   )}`,   );   return null;   }

  return shaderProgram;
}

// creates a shader of the given type, uploads the source and compiles it.
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {   alert(   `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,   );   gl.deleteShader(shader);   return null;   }

  return shader;
}
//==============================================================================================================
function loadTexture(gl, url) {
   const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  image.src = url;
  return texture;
}
//==============================================================================================================
    function geoToMatrix(lat, lon) {
    const latRad = (-lat * Math.PI) / 180;
    const lonRad = (-lon * Math.PI) / 180;

    const my = mat4.create();
    const mx = mat4.create();
    mat4.fromRotation(my, lonRad, [0, 1, 0]);
    mat4.fromRotation(mx, latRad, [1, 0, 0]);

    const result = mat4.create();
    mat4.multiply(result, mx, my);
    return result;
}
function setupPOI(m, poiData) {
    const container = document.getElementById("poi-container");

    Object.entries(poiData).forEach(([categoria, luoghi]) => {
        const details = document.createElement("details");
        details.open = false; // collapsable closed

        const summary = document.createElement("summary");
        summary.textContent = categoria;
        summary.classList.add("Map-POI-summary")
        details.appendChild(summary);
        

        const ul = document.createElement("ul");
        luoghi.forEach(p => {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.textContent = p.name;
            btn.classList.add("poi-button");
            btn.onclick = () => mat4.copy(m, geoToMatrix(p.lat, p.lon));
            li.appendChild(btn);
            ul.appendChild(li);
        });

        details.appendChild(ul);
        container.appendChild(details);
    });
}