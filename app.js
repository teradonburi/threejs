import Game from './src/game'


function init() {
  const game = new Game()
  game.init()
}

window.addEventListener('DOMContentLoaded', init)
