import Game from './game'

const startButton = document.getElementById('startButton')

function init() {
  startButton.remove()
  const game = new Game()
  game.init()
}

startButton.addEventListener('click', init)