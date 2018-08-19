
/* global THREE: false, Ammo: false */

export default class SkinnedMesh {
  constructor (texture, geometry, skinning = true) {
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      skinning,
    })
    this.SkinnedMesh = new THREE.SkinnedMesh(geometry, material)
    this.SkinnedMesh.mixer = new THREE.AnimationMixer(this.SkinnedMesh)
    this.SkinnedMesh.actions = []
    for (let animation of geometry.animations) {
      this.SkinnedMesh.actions.push(this.SkinnedMesh.mixer.clipAction(animation))
    }

    this.SkinnedMesh.position.set(0, 30, 0)
    this.SkinnedMesh.scale.set(5, 5, 5)
    this.SkinnedMesh.userData.physicsBody = this.createPhysicsBody(this.SkinnedMesh.geometry)
    this.SkinnedMesh.receiveShadow = true
    this.SkinnedMesh.castShadow = true
    this.SkinnedMesh.updatePhysics = this.updatePhysics
    return this.SkinnedMesh
  }

  updatePhysics = () => {
    const ms = this.SkinnedMesh.userData.physicsBody.getMotionState()
    if (ms) {
      let transformAux1 = new Ammo.btTransform()
      ms.getWorldTransform(transformAux1)
      const p = transformAux1.getOrigin()
      const q = transformAux1.getRotation()
      this.SkinnedMesh.position.set(p.x(), p.y(), p.z())
      this.SkinnedMesh.quaternion.set(q.x(), q.y(), q.z(), q.w())
    }
  }

  createPhysicsBody = (geometry, objectSize = 3) => {

    const vertices = geometry.vertices
    /*
    const triangle_mesh = new Ammo.btTriangleMesh()
    const triangles = []
    for (let i = 0; i < geometry.faces.length; i++) {
      const face = geometry.faces[i]
      if (face instanceof THREE.Face3) {

        triangles.push([
					{ x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
					{ x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
					{ x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z },
        ])

      } else if (face instanceof THREE.Face4) {

        triangles.push([
					{ x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
					{ x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
					{ x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z },
        ])
        triangles.push([
					{ x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
					{ x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z },
					{ x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z },
        ])

      }
    }

    for (let i = 0; i < triangles.length; i++) {
      const triangle = triangles[i]

      const a = new Ammo.btVector3(triangle[0].x, triangle[0].y, triangle[0].z)
      const b = new Ammo.btVector3(triangle[1].x, triangle[1].y, triangle[1].z)
      const c = new Ammo.btVector3(triangle[2].x, triangle[2].y, triangle[2].z)

      triangle_mesh.addTriangle(a, b, c, true)
    }

    const shape = new Ammo.btBvhTriangleMeshShape(
      triangle_mesh,
      true,
      true
    )
    */

    const scale = this.SkinnedMesh.scale

    const shape = new Ammo.btConvexHullShape()
    for (let  i = 0; i < vertices.length; i++) {
      const vec = vertices[i]
      shape.addPoint(new Ammo.btVector3(vec.x * scale.x, vec.y * scale.y, vec.z * scale.z))
    }

    const mass = objectSize * 5
    const localInertia = new Ammo.btVector3(0, 0, 0)
    shape.calculateLocalInertia(mass, localInertia)
    const transform = new Ammo.btTransform()
    transform.setIdentity()
    const pos = this.SkinnedMesh.position
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
    const motionState = new Ammo.btDefaultMotionState(transform)
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
    const body = new Ammo.btRigidBody(rbInfo)
    return body
  }
}