/* global THREE: false */
import Render from './Render'
import Scene from './Scene'
import Clock from './Clock'
import Vector3 from './Vector3'
import Axis from './Axis'
import Grid from './Grid'
import Camera from './Camera'
import DirectionalLight from './DirectionalLight'
import AmbientLight from './AmbientLight'
import Loader from './Loader'
import HeightMap from './HeightMap'
import Sphere from './Sphere'
import Box from './Box'
import Cylinder from './Cylinder'
import Cone from './Cone'
import SkinnedMesh from './SkinnedMesh'
import GLTFModel from './GLTFModel'
import PhysicsWorld from './PhysicsWorld'
import DragControls from './DragControls'

export default class Game {

  init = async () => {
    // アニメーションとかで使う時間用
    this.clock = new Clock()
    // シーン作成
    this.scene = new Scene()
    // レンダラー作成
    this.renderer = new Render(this.onResize)
    // 物理世界作成
    this.physicsWorld = new PhysicsWorld()

    // カメラ
    const eye = new Vector3(50, 50, 150)
    const lookAt = new Vector3(0, 0, 0)
    this.camera = new Camera(eye, lookAt)
    this.scene.add(this.camera)
    this.scene.add(this.camera.getHelper())

    // コントロールカメラ
    const debugEye = new Vector3(100, 200, 200)
    const debugLookAt = new Vector3(0, 0, 0)
    this.controlCamera = new Camera(debugEye, debugLookAt, 1, 4000)
    this.controls = this.controlCamera.getControls()

    this.light = new DirectionalLight()
    this.ambient = new AmbientLight()
    this.scene.add(this.light)
    // this.scene.add(this.ambient)

    this.grid = new Grid()
    this.axis = new Axis()
    this.scene.add(this.grid)
    this.scene.add(this.axis)

    this.loader = new Loader()

    /*
    this.SkinnedMesh = new SkinnedMesh(
      await this.loader.loadTexture('../model/fox.png'),
      await this.loader.loadJsonModel('../model/fox.json')
    )
    // this.SkinnedMesh.position.set(0, 0, 0)
    // this.SkinnedMesh.scale.set(5, 5, 5)
    this.SkinnedMesh.actions[1].play()
    this.scene.add(this.SkinnedMesh)
    //this.physicsWorld.addRigidBody(this.SkinnedMesh.userData.physicsBody)
    */

    const gltf = await this.loader.loadGLTFModel('./model/CesiumMan.gltf')
    this.model = new GLTFModel(gltf)
    this.model.object.position.set(50, 10, 0)
    this.model.object.scale.set(5, 5, 5)
    const animations = gltf.animations
    if (animations && animations.length) {
      this.CesiumMan.mixer = new THREE.AnimationMixer(this.CesiumMan)
      const actions = []
      for (let i = 0; i < animations.length; i ++) {
        const animation = animations[ i ]
        actions.push(this.CesiumMan.mixer.clipAction(animation))
      }
      actions[0].play()
    }
    this.scene.add(this.CesiumMan)

    this.heightMap = new HeightMap()
    this.scene.add(this.heightMap)
    this.physicsWorld.addRigidBody(this.heightMap.userData.physicsBody)


    this.objectTimePeriod = 3
    this.timeNextSpawn = this.objectTimePeriod


    // ドラッグ処理
    this.dragControls = new DragControls(this.physicsWorld.dynamicObjects, this.controlCamera, this.renderer)

    this.loop()
  }

  loop = () => {
    requestAnimationFrame(this.loop)
    this.render()
  }

  onResize = () =>  {
    this.renderer.resize()

    const cameras = [this.camera, this.controlCamera]
    for (let camera of cameras) {
      camera.resize()
    }
  }

  render = () => {
    const {delta, time} = this.clock.update()
    this.SkinnedMesh.mixer.update(delta)
    this.CesiumMan.mixer && this.CesiumMan.mixer.update(delta)

    if (this.physicsWorld.dynamicObjects.length < 5 && time > this.timeNextSpawn) {
      const objectType = Math.ceil(Math.random() * 4)
      let mesh = null
      const initPos = new Vector3(0, 100, 0)
      switch (objectType) {
        case 1:
          mesh = new Sphere(initPos)
          break
        case 2:
          mesh = new Box(initPos)
          break
        case 3:
          mesh = new Cylinder(initPos)
          break
        default:
          mesh = new Cone(initPos)
          break
      }

      this.scene.add(mesh)
      this.physicsWorld.dynamicObjects.push(mesh)
      this.physicsWorld.addRigidBody(mesh.userData.physicsBody)
      this.timeNextSpawn = time + this.objectTimePeriod
    }
    this.physicsWorld.update(delta)
    this.SkinnedMesh.updatePhysics()
    this.controls.update()
    this.renderer.render(this.scene, this.controlCamera)
  }
}




