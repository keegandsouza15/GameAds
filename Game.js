class Game {
  constructor (width, height, ctx, img) {
    this.img = img
    this.width = width
    this.height = height
    this.screenWidth = parseInt(width / 10)
    this.screenHeight = parseInt(height / 10)
    this.screen = []
    this.objects = []
    this.ctx = ctx
    for (var i = 0; i < this.screenWidth; i++) {
      var row = []
      for (var j = 0; j < this.screenHeight; j++) {
        row.push(new Cell(i, j, -1, false))
      }
      this.screen.push(row)
    }

    // Add the black background
    this.redrawBackGround()
    // Add the player
    this.player = new PlayerObj(50, 12, this.objects.length)
    this.objects.push(this.player)
    setInterval(this.updateScreen.bind(this), 60)
    //Adds a test obstacle
    let obstancle = new ObstacleObj(10, 10, -1, -1, 4, this.objects.length)
    this.objects.push(obstancle)
    obstancle = new ObstacleObj(1, 1, -1, -1, 4, this.objects.length)
    this.objects.push(obstancle)
  }

  updateScreen () {
    this.redrawBackGround()
    this.redraw += 1
    for (let obj of this.objects) {
      obj.clear(this.ctx, 10, this.screen)
      obj.updatePos(this.screen, this.screenWidth, this.screenHeight)
      obj.draw(this.ctx, 10, this.img)
    }
  }

  redrawBackGround () {
    this.ctx.globalCompositeOperation = 'source-over'
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, 800, 800)
  }
}

class Cell {
  constructor (row, column, index, isHole) {
    this.row = row
    this.column = column
    this.index = index
    this.isHole = isHole
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

  draw (ctx, cellMultipler, img) {
    ctx.fillStyle = '#FF2332'
    for (let cell of this.cells) {
      let x = (cell.row) * cellMultipler
      let y = (cell.column) * cellMultipler
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.arc(x + 5, y + 5, 5, 0, 2 * Math.PI, false)
      ctx.fillStyle = 'red'
      ctx.fill()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(x + 5, y + 5, 4.5, 0, 2 * Math.PI, false)
      ctx.fillStyle = 'green'
      ctx.fill()
    }
  }

  clear (ctx, cellMultipler) {
    ctx.fillStyle = 'pink'
    ctx.globalAlpha = 0.2
    ctx.globalCompositeOperation = 'source-over'
    for (let cell of this.cells) {
      let x = cell.row * cellMultipler
      let y = cell.column * cellMultipler
      ctx.beginPath()
      ctx.arc(x + 5, y + 5, 5, 0, 2 * Math.PI, false)
      ctx.fill()
    }
  }

  updatePos (screen, screenWidth, screenHeight) {
    let borderCollision = false
    for (let cell of this.cells) {
      // Checks collisions with walls
      if (this.leftRightBorderCollision(cell.row + this.run, screenWidth)) {
        console.log(cell.row, screenWidth)
        this.run *= -1
        borderCollision = true
      }
      if (this.topButtomBorderCollision(cell.column + this.rise, screenHeight)) {
        this.rise *= -1
        borderCollision = true
      }
      if (borderCollision) return
      //Checks collisions with other objects
      if (this.checkOtherObjectCollision(cell.row + this.run, cell.column + this.rise, screen)) {
        console.log('bang')
        this.run *= -1
        this.rise *= -1
        return
      }
    }

    for (let cell of this.cells) {
      let newCell = new Cell(cell.row, cell.column, -1)
      screen[cell.row][cell.column] = newCell
      cell.row += this.run
      cell.column += this.rise

      screen[cell.row][cell.column] = cell
    }
  }
}

class PlayerObj extends GameObj {
  constructor (row, column, playerIndex) {
    super(0, 0, [new Cell(row, column, playerIndex, false)], playerIndex)
  }

  draw (ctx, cellMultipler, img) {
    ctx.fillStyle = '#FF2332'
    for (let cell of this.cells) {
      let x = (cell.row) * cellMultipler
      let y = (cell.column) * cellMultipler
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.arc(x + 5, y + 5, 5, 0, 2 * Math.PI, false)
      ctx.fillStyle = 'red'
      ctx.fill()
    }
  }

  updatePos (screen, screenWidth, screenHeight) {
    let cell = this.cells[0]
    cell.row += this.run
    cell.column += this.rise
    this.rise = 0
    this.run = 0
    // Checks collisions with walls
    if (this.leftRightBorderCollision(cell.row, screenWidth)) return false
    if (this.topButtomBorderCollision(cell.column, screenHeight)) return false
    screen[cell.row][cell.column] = cell
    this.cells[0] = cell
    return true
  }
}

class ObstacleObj extends GameObj {
  constructor (centerX, centerY, rise, run, size, index) {
    size = 4
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
