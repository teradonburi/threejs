/* global THREE: false */

export default class Render {
  constructor (onResize = () => {}, color = 0xf3f3f3) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      gammaOutput: true,
    })
    // render用タグをbodyに追加
    const container = document.createElement('div')
    container.appendChild(this.renderer.domElement)
    document.body.appendChild(container)

    this.renderer.setClearColor(color, 1.0)
    // ウィンドウサイズが変更された場合、レンダラーをリサイズする
    this.resize()
    window.addEventListener('resize', onResize)

    this.renderer.autoClear = false
    this.renderer.resize = this.resize.bind(this)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    return this.renderer
  }

  resize = () => {
    // レンダラーのサイズを調整する
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

}
