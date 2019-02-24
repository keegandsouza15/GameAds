var myGame = false
var playing = false

setInterval(insertGameButton, 1000)
function insertGameButton () {
  if (document.getElementById('menu-container') === null) return
  let menuContainer = document.getElementById('menu-container').firstChild
  if (menuContainer === null) return
  let ytclass = menuContainer.firstChild
  if (ytclass === null) return
  let topLevelButtons = ytclass.childNodes[1]
  let nodes = topLevelButtons.childNodes
  if (nodes.length <= 4) {
    addGameButton(topLevelButtons)
  }
}

// Creates a deep copy of an html element, cloneNode causing errors with elements
function elementDeepCopy (element) {
  if (element === null) return null
  let copyElement = element.cloneNode(false)
  let copyChildList = []
  for (let node of element.childNodes) {
    let child = elementDeepCopy(node)
    copyChildList.push(child)
  }
  copyElement.innerHTML = ''
  for (let element of copyChildList) {
    copyElement.appendChild(element)
  }
  return copyElement
}

function addGameButton (topLevelButtons) {
  var gameButton = elementDeepCopy(topLevelButtons.firstChild)
  // Modifies the copied icon element, to include an id and correct element
  var alink = gameButton.firstChild
  alink.removeChild(alink.childNodes[1])
  gameButton.setAttribute('id', 'gameToggleButton')
  gameButton.onclick = gameButtonClick
  let svg = alink.firstChild.firstChild.firstChild.firstChild
  svg.setAttribute('id', 'game-icon-svg')
  let path = svg.firstChild.childNodes[1]
  path.setAttribute('d', 'M23 6H1v12h22V6zm-12 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z')
  // Insert before share button
  topLevelButtons.insertBefore(gameButton, topLevelButtons.childNodes[2])
  // Creates and addes the score element
  var playerScore = document.createElement('p')
  playerScore.id = 'player-score'
  playerScore.className += ' p-score'
  document.body.append(playerScore)
}
function gameButtonClick () {
  playing = !playing;
  (playing) ? drawCanvas() : clearCanvas()
}

// Make the score appear in the corrent position
function positionScore (playerScore, newCanvas) {
  playerScore.classList.remove('scoreanimation')
  playerScore.style.top = parseInt(newCanvas.style.top) + parseInt(newCanvas.height) + 'px'
  playerScore.style.left = parseInt(newCanvas.style.left) + (parseInt(newCanvas.width) / 2) + 'px'
  playerScore.innerHTML = 0
  playerScore.style.display = 'block'
}

function drawCanvas () {
  // Scroll to the top and display the player score
  document.documentElement.scrollTop = 0
  // Changes button color
  document.getElementById('game-icon-svg').setAttribute('fill', '#ff0000')
  // Find the youtube movie player
  var video = document.getElementById('movie_player')
  let vidBound = video.getBoundingClientRect()
  // Create the new Canvas and initizile it to the screen
  var newCanvas = document.createElement('canvas')
  newCanvas.style.color = 'black'
  newCanvas.style.border = '1px solid #000000'
  newCanvas.style.opacity = '.9'
  newCanvas.width = vidBound.width
  newCanvas.height = vidBound.height
  newCanvas.setAttribute('id', 'gameCanvas')
  if (vidBound.top < 80) {
    newCanvas.style.top = '80px'
  } else {
    newCanvas.style.top = vidBound.top + 'px'
  }
  newCanvas.style.left = vidBound.left + 6 + 'px'
  newCanvas.style.position = 'absolute'
  let ctx = newCanvas.getContext('2d')
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, newCanvas.width, newCanvas.height)
  document.body.append(newCanvas)

  // Moves and displays the score.
  var playerScore = document.getElementById('player-score')
  positionScore(playerScore, newCanvas)

  // Initizale the game
  myGame = new Game(newCanvas.width, newCanvas.height, ctx, playerScore)
  myGame.start()
  document.body.onkeydown = function (e) {
    e.preventDefault()
    if (!myGame.buttonPressed(e)) {
      clearCanvas()
    }
  }
  // Set the content to stop scrolling
  document.body.style.overflow = 'hidden'
}

function clearCanvas () {
  myGame.end()
  // Handles the score animation
  myGame.scoreElement.className += ' scoreanimation'
  let count = 0
  myGame.scoreElement.addEventListener('animationend', handleEnd, false)
  function handleEnd () {
    if (count === 1) {
      myGame.scoreElement.style.display = 'none'
    }
    count++
  }

  // Changes button color
  document.getElementById('game-icon-svg').setAttribute('fill', 'hsl(0, 0%, 53.3%)')

  var gameCanvas = document.getElementById('gameCanvas')
  if (!(gameCanvas === null)) document.body.removeChild(gameCanvas)
  // Set the content back to scroll
  document.body.style.overflow = 'scroll'
}

class Game {
  constructor (width, height, ctx, scoreElement) {
    this.width = width
    this.height = height
    this.screenWidth = 108
    this.cellMultipler = this.width / this.screenWidth
    this.screenHeight = parseInt(this.height / this.cellMultipler)
    this.screen = []
    this.objects = []
    this.ctx = ctx
    this.score = 0
    this.scoreElement = scoreElement
  }

  start () {
    for (var i = 0; i < this.screenWidth; i++) {
      var row = []
      for (var j = 0; j < this.screenHeight; j++) {
        row.push(new Cell(i, j, -1, false))
      }
      this.screen.push(row)
    }
    // Add the black background
    this.ctx.globalCompositeOperation = 'source-over'
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.width, this.height)
    // Add the player
    this.player = new PlayerObj(50, 12, this.objects.length)
    this.objects.push(this.player)
    this.updateScreenInterval = setInterval(this.updateScreen.bind(this), 50)
    // Adds a test obstacles every 2 seconds
    this.addObstanceInterval = setInterval(this.createObstancle.bind(this), 2000)
  }

  createObstancle () {
    // Generates random values for the starting location.
    let obstacle = null
    let size = Math.floor(Math.random() * 9) + 1
    let startinglocation = Math.floor(Math.random() * 4) + 1
    if (startinglocation === 1) {
      obstacle = new ObstacleObj(0 + size, 0 + size, -1, 1, size, this.objects.length)
    } else if (startinglocation === 2) {
      obstacle = new ObstacleObj(0 + size, this.screenHeight - size, -1, 1, size, this.objects.length)
    } else if (startinglocation === 3) {
      obstacle = new ObstacleObj(this.screenWidth - size, 0 + size, 1, -1, size, this.objects.length)
    } else if (startinglocation === 4) {
      obstacle = new ObstacleObj(this.screenWidth - size, this.screenHeight - size, -1, -1, size, this.objects.length)
    }
    this.objects.push(obstacle)
  }

  end () {
    clearInterval(this.updateScreenInterval)
    clearInterval(this.addObstanceInterval)
    this.objects.length = 0
    this.screen.length = 0
    this.score = 0
    playing = false
  }

  updateScreen () {
    this.scoreElement.innerHTML = this.score
    this.score += 1
    for (let obj of this.objects) {
      obj.clear(this.ctx, this.cellMultipler, this.screen)
      if (!obj.updatePos(this.screen, this.screenWidth, this.screenHeight)) {
        this.end()
        clearCanvas()
      }
      obj.draw(this.ctx, this.cellMultipler)
    }
  }

  buttonPressed (e) {
    let keyCode = e.keyCode
    switch (keyCode) {
      case 37:
        this.player.run = -1
        this.player.rise = 0
        break
      case 38:
        this.player.run = 0
        this.player.rise = -1
        break
      case 39:
        this.player.run = 1
        this.player.rise = 0
        break
      case 40:
        this.player.run = 0
        this.player.rise = 1
        break
    }
    this.player.clear(this.ctx, this.cellMultipler)
    if (this.player.updatePos(this.screen, this.screenWidth, this.screenHeight)) {
      this.player.draw(this.ctx, this.cellMultipler)
      return true
    }
    return false
  }
}

class Cell {
  constructor (row, column, index) {
    this.row = row
    this.column = column
    this.index = index
  }
}

class GameObj {
  constructor (rise, run, cells, index) {
    this.rise = rise
    this.run = run
    this.cells = cells
    this.index = index
  }

  leftRightBorderCollision (row, screenWidth) {
    return !(row > -1 && row < screenWidth)
  }

  topButtomBorderCollision (column, screenHeight) {
    return !(column > -1 && column < screenHeight)
  }

  checkOtherObjectCollision (row, column, screen) {
    return (screen[row][column].index !== -1 && screen[row][column].index !== this.index)
  }

  draw (ctx, cellMultipler) {
    ctx.fillStyle = '#FF2332'
    let radius = cellMultipler / 2
    for (let cell of this.cells) {
      let x = (cell.row) * cellMultipler
      let y = (cell.column) * cellMultipler
      // Draw the border circle
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI, false)
      ctx.fillStyle = 'red'
      ctx.fill()
      // Draw the inner circle
      ctx.globalCompositeOperation = 'destination-out'
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(x + radius, y + radius, radius - 0.5, 0, 2 * Math.PI, false)
      ctx.fillStyle = 'green'
      ctx.fill()
    }
  }

  clear (ctx, cellMultipler) {
    // ReFill the circle
    let radius = cellMultipler / 2
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = 'black'
    for (let cell of this.cells) {
      let x = cell.row * cellMultipler
      let y = cell.column * cellMultipler
      ctx.beginPath()
      ctx.arc(x + radius, y + radius, radius + 1, 0, 2 * Math.PI, false)
      for (let i = 0; i < 4; i++) {
        ctx.fill()
      }
    }
  }

  updatePos (screen, screenWidth, screenHeight) {
    let borderCollision = false
    for (let cell of this.cells) {
      // Checks collisions with walls
      if (this.leftRightBorderCollision(cell.row + this.run, screenWidth)) {
        this.run *= -1
        borderCollision = true
      }
      if (this.topButtomBorderCollision(cell.column + this.rise, screenHeight)) {
        this.rise *= -1
        borderCollision = true
      }
      if (borderCollision) return true
      // Checks collisions with other objects
      if (this.checkOtherObjectCollision(cell.row + this.run, cell.column + this.rise, screen)) {
        if (screen[cell.row + this.run][cell.column + this.rise].index === 0) {
          return false
        } else {
          this.run *= -1
          this.rise *= -1
          return true
        }
      }
    }

    // Updates the cells position and store it in a the screen data structure.
    for (let cell of this.cells) {
      let newCell = new Cell(cell.row, cell.column, -1)
      screen[cell.row][cell.column] = newCell
      cell.row += this.run
      cell.column += this.rise
      screen[cell.row][cell.column] = cell
    }
    return true
  }
}

class PlayerObj extends GameObj {
  constructor (row, column, playerIndex) {
    super(0, 0, [new Cell(row, column, playerIndex, false)], playerIndex)
  }

  draw (ctx, cellMultipler) {
    let radius = cellMultipler / 2
    ctx.fillStyle = '#FF2332'
    let x = (this.cells[0].row) * cellMultipler
    let y = (this.cells[0].column) * cellMultipler
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 0.8
    ctx.beginPath()
    ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = 'red'
    ctx.fill()
  }

  updatePos (screen, screenWidth, screenHeight) {
    let cell = this.cells[0]
    // Resets the screen
    try {
      screen[cell.row][cell.column] = new Cell(cell.row, cell.col, -1)
    } catch (Expection) {
      return false
    }
    // Adds the rise and the run
    cell.row += this.run
    cell.column += this.rise
    this.rise = 0
    this.run = 0
    // Checks collisions with walls
    if (this.leftRightBorderCollision(cell.row, screenWidth)) return false
    if (this.topButtomBorderCollision(cell.column, screenHeight)) return false
    // Check collisions with other objects
    if (this.checkOtherObjectCollision(cell.row, cell.column, screen)) return false
    screen[cell.row][cell.column] = cell
    this.cells[0] = cell
    return true
  }
}

class ObstacleObj extends GameObj {
  constructor (centerX, centerY, rise, run, size, index) {
    let cellIndex = index
    let square = parseInt(Math.sqrt(size))
    let cells = []

    // Creates a square
    for (let i = 0; i < square; i++) {
      for (let j = 0; j < square; j++) {
        cells.push(new Cell(centerX + i, centerY + j, cellIndex))
      }
    }
    // Adds the leftovers
    let leftOver = size - (square * square)
    if (leftOver !== 0) {
      let squareX = square + centerX
      let squareY = square + centerY
      for (var i = 0; i < leftOver / 2; i++) {
        cells.push(new Cell(squareX, centerY + i, cellIndex))
      }
      leftOver = parseInt(leftOver /= 2)
      for (let i = 0; i < leftOver; i++) {
        cells.push(new Cell(centerX + i, squareY, cellIndex))
      }
    }
    super(rise, run, cells, index)
  }
}
