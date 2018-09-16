/* global THREE: false, Ammo: false */

export default class HeightMap {

  constructor () {
    // Heightfield parameters
    this.terrainWidth = 512
    this.terrainDepth = 512
    this.terrainMaxHeight = 10
    this.terrainMinHeight = 1
    this.terrainWidthExtents = 200
    this.terrainDepthExtents = 200
    this.heightData = this.generateHeight(this.terrainWidth, this.terrainDepth, this.terrainMinHeight, this.terrainMaxHeight)
    this.terrainMesh = this.createGeometry()
    this.terrainMesh.receiveShadow = true
    this.terrainMesh.castShadow = true
    this.terrainMesh.userData.physicsBody = this.createPhysicsBody()
    return this.terrainMesh
  }

  generateHeight = (width, depth, minHeight, maxHeight) => {
		// Generates the height data (a sinus wave)
    const size = width * depth
    const data = new Float32Array(size)
    const hRange = maxHeight - minHeight
    const w2 = width / 2
    const d2 = depth / 2
    const phaseMult = 12
    let p = 0
    for (let j = 0; j < depth; j++) {
      for (let i = 0; i < width; i++) {
        const radius = Math.sqrt(Math.pow((i - w2) / w2, 2.0) + Math.pow((j - d2) / d2, 2.0))
        const height = (Math.sin(radius * phaseMult) + 1) * 0.5 * hRange + minHeight
        data[p] = height
        p++
      }
    }
    return data
  }

  createGeometry = (color = 0xC7C7C7) => {
    // draw heightmap
    const geometry = new THREE.PlaneBufferGeometry(this.terrainWidthExtents, this.terrainDepthExtents, this.terrainWidth - 1, this.terrainDepth - 1)
    geometry.rotateX(-Math.PI / 2)
    const vertices = geometry.attributes.position.array
    for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
			// j + 1 because it is the y component that we modify
      vertices[ j + 1 ] = this.heightData[ i ]
    }
    geometry.computeVertexNormals()
    geometry.computeFaceNormals()
    const groundMaterial = new THREE.MeshPhongMaterial({ color })
    const terrainMesh = new THREE.Mesh(geometry, groundMaterial)
    return terrainMesh
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


