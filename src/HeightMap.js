/* global THREE: false, ImprovedNoise: false, Ammo: false */

export default class HeightMap {

  constructor () {
    // Heightfield parameters
    this.terrainWidth = 512
    this.terrainDepth = 512
    this.terrainMaxHeight = 20
    this.terrainMinHeight = 1
    this.terrainWidthExtents = 200
    this.terrainDepthExtents = 200
    this.heightData = this.generateHeight(this.terrainWidth, this.terrainDepth, this.terrainMinHeight, this.terrainMaxHeight)
    this.terrainMesh = this.createGeometry(this.terrainWidth, this.terrainDepth)
    this.terrainMesh.receiveShadow = true
    this.terrainMesh.castShadow = true
    this.terrainMesh.userData.physicsBody = this.createPhysicsBody()
    return this.terrainMesh
  }

  generateHeight = (width, depth, minHeight, maxHeight) => {
    const size = width * depth
    const data = new Float32Array(size)
    const perlin = new ImprovedNoise()
    const hRange = maxHeight - minHeight
    let quality = 1
    const z = Math.random() * 100
    for (let j = 0; j < 4; j ++) {
      for (let i = 0; i < size; i ++) {
        const x = i % width
        const y = ~ ~ (i / width)
        data[i] += (Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75) / 255.0 * hRange + minHeight)
      }
      quality *= 5
    }
    return data
  }


  createGeometry = (width, depth) => {
    // draw heightmap
    const geometry = new THREE.PlaneBufferGeometry(this.terrainWidthExtents, this.terrainDepthExtents, this.terrainWidth - 1, this.terrainDepth - 1)
    geometry.rotateX(-Math.PI / 2)
    const vertices = geometry.attributes.position.array
    for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
			// j + 1 because it is the y component that we modify
      vertices[j + 1] = this.heightData[i]
    }
    geometry.computeVertexNormals()
    geometry.computeFaceNormals()
    const texture = new THREE.CanvasTexture(this.generateTexture(this.heightData, width, depth))
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    const terrainMesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ map: texture }))
    return terrainMesh
  }

  // アンビエントオクルージョンテクスチャ作成
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

  createPhysicsBody() {
		// Creates height data buffer in Ammo heap
    const ammoHeightData = Ammo._malloc(4 * this.terrainWidth * this.terrainDepth)
		// Copy the javascript height data array to the Ammo one.
    let p = 0
    let p2 = 0
    for (let j = 0; j < this.terrainDepth; j++) {
      for (let i = 0; i < this.terrainWidth; i++) {
				// write 32-bit float data to memory
        Ammo.HEAPF32[ ammoHeightData + p2 >> 2 ] = this.heightData[ p ]
        p++
				// 4 bytes/float
        p2 += 4
      }
    }
		// Creates the heightfield physics shape
    const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
      this.terrainWidth,
      this.terrainDepth,
      ammoHeightData,
      1,
      this.terrainMinHeight,
      this.terrainMaxHeight,
      1,
      'PHY_FLOAT',
      false
    )
		// Set horizontal scale
    const scaleX = this.terrainWidthExtents / (this.terrainWidth - 1)
    const scaleZ = this.terrainDepthExtents / (this.terrainDepth - 1)
    heightFieldShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ))
    heightFieldShape.setMargin(0.05)

		// Create the terrain body
    const groundTransform = new Ammo.btTransform()
    groundTransform.setIdentity()
		// Shifts the terrain, since bullet re-centers it on its bounding box.
    groundTransform.setOrigin(new Ammo.btVector3(0, (this.terrainMaxHeight + this.terrainMinHeight) / 2, 0))
    const groundMass = 0
    const groundLocalInertia = new Ammo.btVector3(0, 0, 0)
    const groundMotionState = new Ammo.btDefaultMotionState(groundTransform)
    const groundBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(groundMass, groundMotionState, heightFieldShape, groundLocalInertia))
    return groundBody
  }
}


