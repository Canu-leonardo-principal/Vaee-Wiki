import { mat4, quat } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js';

function drawScene(gl, programInfo, buffers, rotationQuat, zoom, Texture) {
    // gl.clearColor(0.10, 0.32, 0.50, 1.0); // Clear to fully opaque background color
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height ratio that matches the display size of the canvas and we only want to see objects between 0.1 units and 100 units away from the camera.
    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // note: glMatrix always has the first argument as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point, which is he center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to start drawing the square.
    mat4.translate(
        modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to translate
        [0.0, 0.0, zoom],// amount to translate
    ); 
    const rotationMatrix = mat4.create();
    mat4.fromQuat(rotationMatrix, rotationQuat);
    mat4.multiply(modelViewMatrix, modelViewMatrix, rotationMatrix);
    
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    
    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute.
    setNormalAttribute(gl, buffers, programInfo);
    setPositionAttribute(gl, buffers, programInfo);
    setTextureAttribute(gl, buffers, programInfo);
    
    // Set the shader uniforms
    gl.uniformMatrix4fv( programInfo.uniformLocations.projectionMatrix, false, projectionMatrix );
    gl.uniformMatrix4fv( programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix );
    gl.uniformMatrix4fv( programInfo.uniformLocations.normalMatrix, false, normalMatrix );

    
    const vertexCount = buffers.vertexCount;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, Texture);
    gl.uniform1i(programInfo.uniformLocations.uTexture, 0);

    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);    
}

// Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute.
function setPositionAttribute(gl, buffers, programInfo) {
    const numComponents = 3; // pull out 3 values per iteration (for the 3 domensions)
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer( programInfo.attribLocations.vertexPosition,  numComponents,  type,  normalize,  stride,  offset );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}
// Tell WebGL how to pull out the normals from the normal buffer into the vertexNormal attribute.
function setNormalAttribute(gl, buffers, programInfo) {
  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
  gl.vertexAttribPointer( programInfo.attribLocations.vertexNormal,  numComponents,  type,  normalize,  stride,  offset );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}

function setTextureAttribute(gl, buffers, programInfo) {
  const numComponents = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
  gl.vertexAttribPointer( programInfo.attribLocations.textureCoord,  numComponents,  type,   normalize,  stride,  offset );
  gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
}

export { drawScene };