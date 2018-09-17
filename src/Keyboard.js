export default class Keyboard {
  constructor () {
    this.keys = []
    document.addEventListener('keydown', (e) => {
      const keycode = e.keyCode
      this.keys[keycode] = true
      e.preventDefault()
      e.stopPropagation()
      return false
    })
    document.addEventListener('keyup', (e) => {
      const keycode = e.keyCode
      this.keys[keycode] = false
      e.preventDefault()
      e.stopPropagation()
      return false
    })
  }

  isPressEnter = () => this.getKey(13)
  isPressSpace = () => this.getKey(32)
  isPressA = () => this.getKey(65)
  isPressD = () => this.getKey(68)
  isPressW = () => this.getKey(87)
  isPressS = () => this.getKey(83)
  isPressC = () => this.getKey(67)
  isPressLeft = () => this.getKey(37)
  isPressRight = () => this.getKey(39)
  isPressUp = () => this.getKey(38)
  isPressDown = () => this.getKey(40)

  getKey = (keycode) => {
    return this.keys[keycode]
  }
}