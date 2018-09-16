/* global THREE: false */

export default class GLTFModel {
  constructor (gltfOriginal, traverse = false, clone = false) {
    const gltf = clone ? this.cloneGltf(gltfOriginal) : gltfOriginal
    this.object = gltf.scene
    const animations = gltf.animations
    if (animations && animations.length) {
      this.object.mixer = new THREE.AnimationMixer(this.object)
      this.object.actions = []
      for (let i = 0; i < animations.length; i ++) {
        const animation = animations[ i ]
        this.object.actions.push(this.object.mixer.clipAction(animation))
      }
    }

    if (traverse) {
      this.object.traverse((child) => {
        if (child.isMesh) {
          const {vertices, faces, boundingBox, boundingSphere} = this.getVertices(child)
          this.object.vertices = vertices
          this.object.faces = faces
          this.object.boundingBox = boundingBox
          this.object.boundingSphere = boundingSphere
          this.object.boxHelper = new THREE.BoxHelper(child, 0xffff00)
        }
        if (child.isMesh || child.isLight) {
          child.castShadow = true
        }
      })
    }
    this.object.receiveShadow = true
    this.object.castShadow = true
    this.object.init = this.init.bind(this)
    this.object.getCenter = this.getCenter.bind(this)
    this.maxSpeed = 0.2
    this.speed = 0.5
    this.velocity = new THREE.Vector3(0, 0, 0)
    this.object.setSpeed = this.setSpeed.bind(this)
    this.object.move = this.move.bind(this)
    this.object.moveTo = this.moveTo.bind(this)
    this.object.stop = this.stop.bind(this)
    return this.object
  }


  init = (pos, rotate, size) => {
    this.initPos = pos
    this.initRotate = rotate
    this.initScale = new THREE.Vector3(size, size, size)
    this.object.position.set(this.initPos.x, this.initPos.y, this.initPos.z)
    this.object.scale.set(this.initScale.x, this.initScale.y, this.initScale.z)
    this.object.rotation.set(0, this.initRotate, 0)
  }

  getCenter = () => {
    this.object.boxHelper.setFromObject(this.object)
    const box3 = new THREE.Box3()
    this.object.size = new THREE.Vector3(0, 0, 0)
    box3.setFromObject(this.object.boxHelper)
    box3.getSize(this.object.size)
    this.object.center = new THREE.Vector3(0, -this.object.size.y * 0.5, 0)
  }

  setSpeed = (speed, maxSpeed) => {
    this.speed = speed
    this.maxSpeed = maxSpeed
  }

  move = (camera, radian) => {
    let dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    dir.y = 0
    dir.normalize()
    const yAxis = new THREE.Vector3(0, 1, 0)

    dir.applyAxisAngle(yAxis, radian)
    const rotate = new THREE.Vector3()
    rotate.copy(dir)
    rotate.applyAxisAngle(yAxis, this.initRotate)
    this.object.lookAt(new THREE.Vector3(this.object.position.x + rotate.x, this.object.position.y + rotate.y, this.object.position.z + rotate.z))
    dir.multiplyScalar(this.speed)
    if (this.velocity.length() < this.maxSpeed) {
      this.velocity.x += dir.x
      this.velocity.z += dir.z
    }
    this.object.position.x += this.velocity.x
    this.object.position.z += this.velocity.z
  }

  moveTo = (pos) => {
    let dir = new THREE.Vector3(pos.x - this.object.position.x, pos.y - this.object.position.y, pos.z - this.object.position.z)
    dir.y = 0
    dir.normalize()
    const yAxis = new THREE.Vector3(0, 1, 0)

    const rotate = new THREE.Vector3()
    rotate.copy(dir)
    rotate.applyAxisAngle(yAxis, this.initRotate)
    this.object.lookAt(new THREE.Vector3(this.object.position.x + rotate.x, this.object.position.y + rotate.y, this.object.position.z + rotate.z))
    dir.multiplyScalar(this.speed)
    if (this.velocity.length() < this.maxSpeed) {
      this.velocity.x += dir.x
      this.velocity.z += dir.z
    }
    this.object.position.x += this.velocity.x
    this.object.position.z += this.velocity.z
  }

  stop = () => {
    this.velocity.x = 0
    this.velocity.z = 0
  }


  getVertices = (obj) => {
    const vertices = []
    let faces = []
    let boundingBox = null
    let boundingSphere = null

    if (obj.hasOwnProperty('geometry')) {
      let geo = obj.geometry
      if (geo instanceof THREE.Geometry) {
        for (let v of geo.vertices) {
          vertices.push(v)
        }
        faces = geo.faces
        geo.computeBoundingBox()
        geo.computeBoundingSphere()
        boundingBox = geo.boundingBox
        boundingSphere = geo.boundingSphere
      } else if (geo instanceof THREE.BufferGeometry) {
        let tempGeo = new THREE.Geometry().fromBufferGeometry(geo)
        for (let v of tempGeo.vertices) {
          vertices.push(v)
        }
        faces = tempGeo.faces
        tempGeo.computeBoundingBox()
        tempGeo.computeBoundingSphere()
        boundingBox = tempGeo.boundingBox
        boundingSphere = tempGeo.boundingSphere
        tempGeo.dispose()
      }
    }
    return {vertices, faces, boundingBox, boundingSphere}
  }

  cloneGltf = (gltf) => {
    const clone = {
      animations: gltf.animations,
      scene: gltf.scene.clone(true),
    }

    const skinnedMeshes = {}

    gltf.scene.traverse(node => {
      if (node.isSkinnedMesh) {
        skinnedMeshes[node.name] = node
      }
    })

    const cloneBones = {}
    const cloneSkinnedMeshes = {}

    clone.scene.traverse(node => {
      if (node.isBone) {
        cloneBones[node.name] = node
      }

      if (node.isSkinnedMesh) {
        cloneSkinnedMeshes[node.name] = node
      }
    })

    for (let name in skinnedMeshes) {
      const skinnedMesh = skinnedMeshes[name]
      const skeleton = skinnedMesh.skeleton
      const cloneSkinnedMesh = cloneSkinnedMeshes[name]

      const orderedCloneBones = []

      for (let i = 0; i < skeleton.bones.length; ++i) {
        const cloneBone = cloneBones[skeleton.bones[i].name]
        orderedCloneBones.push(cloneBone)
      }

      cloneSkinnedMesh.bind(
        new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
        cloneSkinnedMesh.matrixWorld)
    }

    return clone
  }

}