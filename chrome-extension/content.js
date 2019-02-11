console.log('Hello World')

var helloThere = document.createElement('button')
helloThere.innerHTML = 'Hello There from extension'
helloThere.onclick = function () {
  drawCanvas()
}

var clearVid = document.createElement('button')
clearVid.innerHTML = 'Clear Game'
clearVid.onclick = function () {
  clearCanvas()
}

var title = document.getElementById('info')
title.append(helloThere)
title.append(clearVid)
// Draw prentent canvas for testing

function drawCanvas () {
  console.log('here')
  var video = document.getElementById('movie_player')
  let vidBound = video.getBoundingClientRect()
  console.log(vidBound)
  var newCanvas = document.createElement('canvas')
  newCanvas.style.color = 'black'
  newCanvas.style.border = '1px solid #000000'
  newCanvas.style.opacity = '.9'
  console.log(vidBound.width, vidBound.height)
  newCanvas.width = vidBound.width
  newCanvas.height = vidBound.height
  newCanvas.setAttribute('id', 'gameCanvas')
  console.log(vidBound.top)
  if (vidBound.top < 80) {
    newCanvas.style.top = '80px'
  } else {
    newCanvas.style.top = vidBound.top + 'px'
  }
  newCanvas.style.left = vidBound.left + 'px'
  newCanvas.style.position = 'absolute'

  let ctx = newCanvas.getContext('2d')
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, newCanvas.width, newCanvas.height)
  console.log(newCanvas)
  document.body.append(newCanvas)
}
function clearCanvas () {
  var gameCanvas = document.getElementById('gameCanvas')
  document.body.removeChild(gameCanvas)
}
