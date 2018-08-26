/* global THREE: false */

export default class GLTFModel {
  constructor (gltf, traverse = false) {
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
        if (child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh) {
          const {vertices, faces, boundingBox, boundingSphere} = this.getVertices(child)
          this.object.vertices = vertices
          this.object.faces = faces
          this.object.boundingBox = boundingBox
          this.object.boundingSphere = boundingSphere
          this.object.boxHelper = new THREE.BoxHelper(child, 0xffff00)
        }
      })
    }

    this.object.receiveShadow = true
    this.object.castShadow = true
    this.object.getCenter = this.getCenter
    return this.object
  }

  getCenter = () => {
    this.object.boxHelper.setFromObject(this.object)
    const box3 = new THREE.Box3()
    this.object.size = new THREE.Vector3(0, 0, 0)
    box3.setFromObject(this.object.boxHelper)
    box3.getSize(this.object.size)
    this.object.center = new THREE.Vector3(0, -this.object.size.y * 0.5, 0)
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

}