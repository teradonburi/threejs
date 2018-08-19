import Game from './game'


function init() {
  const game = new Game()
  game.init()
}

window.addEventListener('DOMContentLoaded', init)
