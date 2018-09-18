/* global THREE: false, ImprovedNoise: false */

export default class HeightMap {

  constructor (size = 512, geometrySize = 512, minHeight = -1, maxHeight = 30) {
    const heightData = this.generateHeight(size, size, minHeight, maxHeight)
    this.terrainMesh = this.createGeometry(size, size, geometrySize, geometrySize, heightData)
    this.terrainMesh.terrainWidth = this.terrainMesh.terrainDepth = size
    this.terrainMesh.terrainGeometoryWidth = this.terrainMesh.terrainGeometoryDepth = geometrySize
    this.terrainMesh.terrainMinHeight = minHeight
    this.terrainMesh.terrainMaxHeight = maxHeight
    this.terrainMesh.heightData = heightData
    this.terrainMesh.receiveShadow = true
    this.terrainMesh.castShadow = true
    return this.terrainMesh
  }

  // パーリンノイズからHeightMap生成
  generateHeight = (terrainWidth, terrainDepth, minHeight, maxHeight) => {
    const size = terrainWidth * terrainDepth
    const data = new Float32Array(size)
    const perlin = new ImprovedNoise()
    const hRange = maxHeight - minHeight
    let quality = 1
    const z = Math.random() * 100
    for (let j = 0; j < 4; j ++) {
      for (let i = 0; i < size; i ++) {
        const x = i % terrainWidth
        const y = ~ ~ (i / terrainWidth)
        data[i] += (Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75) / 255.0 * hRange + minHeight)
      }
      quality *= 5
    }
    return data
  }

  // Mesh作成
  createGeometry = (terrainWidth, terrainDepth, terrainGeometoryWidth, terrainGeometoryHeight, heightData) => {
    const geometry = new THREE.PlaneBufferGeometry(terrainGeometoryWidth, terrainGeometoryHeight, terrainWidth - 1, terrainDepth - 1)
    geometry.rotateX(-Math.PI / 2)
    const vertices = geometry.attributes.position.array
    for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
			// j + 1 because it is the y component that we modify
      vertices[j + 1] = heightData[i]
    }
    geometry.computeVertexNormals()
    geometry.computeFaceNormals()
    const texture = new THREE.CanvasTexture(this.generateTexture(heightData, terrainWidth, terrainDepth))
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    const terrainMesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ map: texture }))
    return terrainMesh
  }

  // ベイクドマップテクスチャ作成
  generateTexture = (data, width, height) => {
    const vector3 = new THREE.Vector3(0, 0, 0)
    const sun = new THREE.Vector3(1, 1, 1)
    sun.normalize()
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    let context = canvas.getContext('2d')
    context.fillStyle = '#000'
    context.fillRect(0, 0, width, height)
    let image = context.getImageData(0, 0, canvas.width, canvas.height)
    let imageData = image.data
    for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++) {
      vector3.x = data[j - 2] - data[j + 2]
      vector3.y = 2
      vector3.z = data[j - width * 2] - data[j + width * 2]
      vector3.normalize()
      const shade = vector3.dot(sun)
      imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007)
      imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007)
      imageData[i + 2] = (shade * 96) * (0.5 + data[j] * 0.007)
    }
    context.putImageData(image, 0, 0)
    // Scaled 4x
    const canvasScaled = document.createElement('canvas')
    canvasScaled.width = width * 4
    canvasScaled.height = height * 4
    context = canvasScaled.getContext('2d')
    context.scale(4, 4)
    context.drawImage(canvas, 0, 0)
    image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height)
    imageData = image.data
    for (let i = 0, l = imageData.length; i < l; i += 4) {
      const v = ~ ~ (Math.random() * 5)
      imageData[i] += v
      imageData[i + 1] += v
      imageData[i + 2] += v
    }
    context.putImageData(image, 0, 0)
    return canvasScaled
  }
}


