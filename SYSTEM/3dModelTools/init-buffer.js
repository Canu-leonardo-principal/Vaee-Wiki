function initBuffers(gl, subdivisions) {
  const { positions, normals, texCoords, indices } = buildSphere(subdivisions);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    normal: normalBuffer,
    texCoord: texCoordBuffer,
    indices: indexBuffer,
    vertexCount: indices.length,
  };
}

function buildSphere(subdivisions) {
  const positions = [];
  const normals = [];
  const texCoords = [];
  const indices = [];

  for (let i = 0; i <= subdivisions; i++) {
    const theta = (i * Math.PI) / subdivisions;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let j = 0; j <= subdivisions; j++) {
      const phi = (j * 2 * Math.PI) / subdivisions;
      const x = Math.cos(phi) * sinTheta;
      const y = cosTheta;
      const z = Math.sin(phi) * sinTheta;

      positions.push(x, y, z);
      normals.push(x, y, z);
      texCoords.push(j / subdivisions, i / subdivisions);
    }
  }

  for (let i = 0; i < subdivisions; i++) {
    for (let j = 0; j < subdivisions; j++) {
      const first  = i * (subdivisions + 1) + j;
      const second = first + subdivisions + 1;
      indices.push(first,     second,     first + 1);
      indices.push(second,    second + 1, first + 1);
    }
  }

  return { positions, normals, texCoords, indices };
}

export { initBuffers };