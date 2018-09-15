/* global THREE: false */
import 'three/Particle'

export default class Particle {
  constructor (maxParticles = 100000) {
    this.maxParticles = maxParticles
    this.particleSystem = new THREE.GPUParticleSystem({
      maxParticles, // 最大パーティクル数
      containerCount: 1,
    })
    this.tick = 0
    this.options = {
      position: new THREE.Vector3(), // 位置
      positionRandomness: .3, // 位置の分散
      velocity: new THREE.Vector3(), // 速度
      velocityRandomness: .5, // 速度の分散
      color: 0xaa88ff, // 色
      colorRandomness: .2, // 色の分散
      turbulence: .5, // 乱気流
      lifetime: 2, // 寿命
      size: 5, // 大きさ
      sizeRandomness: 1, // 大きさの分散
    }
    this.spawnerOptions = {
      spawnRate: 1000,  // 描画するパーティクル数
      horizontalSpeed: 1.5,
      verticalSpeed: 1.33,
    }

    this.particleSystem.simulate = this.simulate.bind(this)
    return this.particleSystem
  }

  simulate = (delta) => {
    this.tick += delta
    if (this.tick < 0 || this.tick === Infinity) this.tick = 0
    if (delta > 0) {
      this.options.position.x = Math.sin(this.tick * this.spawnerOptions.horizontalSpeed) * 20
      this.options.position.y = Math.sin(this.tick * this.spawnerOptions.verticalSpeed) * 10 + 30
      this.options.position.z = Math.sin(this.tick * this.spawnerOptions.horizontalSpeed + this.spawnerOptions.verticalSpeed) * 5
      for (let i = 0; i < this.spawnerOptions.spawnRate; i++) {
        // パーティクルの状態を更新する
        this.particleSystem.spawnParticle(this.options)
      }
    }
    // GPUレンダリング
    this.particleSystem.update(this.tick)
  }

}