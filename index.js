const video = document.querySelector('.player')
const canvas = document.querySelector('.photo')
const ctx = canvas.getContext('2d')
const strip = document.querySelector('.strip')
const snap = document.querySelector('.snap')
const takePhotoBtn = document.querySelector('.take-photo')
const radios = document.querySelectorAll('input[type=radio]')
const toggleBtn = document.querySelector('.circle')

let selectedFilter = 'no-filter'
let globalAlpha = 1

function toggleSlowMo() {
  this.parentElement.classList.toggle('right')
  if (globalAlpha === 1) {
    globalAlpha = 0.1
  } else {
    globalAlpha = 1
  }
}

toggleBtn.addEventListener('click', toggleSlowMo)

function selectFilter() {
  selectedFilter = this.id
}

radios.forEach(radio => {
  radio.addEventListener('change', selectFilter)
})

function getVideo() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false})
    .then(localMediaStream => {
      video.srcObject = localMediaStream
      video.play()
    })
    .catch(err => console.log('ERROR!!!', err))
}

function paintToCanvas() {
  const { videoWidth: width, videoHeight: height } = video
  canvas.width = width
  canvas.height = height
  
  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height)
    let pixels = ctx.getImageData(0, 0, width, height)

    switch (selectedFilter) {
      case 'green-filter':
        pixels = greenEffect(pixels)
        break
      case 'red-filter':
        pixels = redEffect(pixels)
        break
      
      case 'blue-filter':
        pixels = blueEffect(pixels)
        break
      
      case 'rgb-filter':
        pixels = rgbSplit(pixels)
        break
      
      case 'slow-mo-filter':
        ctx.globalAlpha = 0.1
        break
      case 'no-filter':
      default:
        break      
    }

    ctx.globalAlpha = globalAlpha

    pixels = greenScreen(pixels)

    ctx.putImageData(pixels, 0, 0)
  }, 16)
}

function takePhoto() {
  snap.currentTime = 0.05
  snap.play()

  const data = canvas.toDataURL('image/jpeg')
  const link = document.createElement('a')
  link.href = data
  link.setAttribute('download', 'handsome')
  link.innerHTML = `<img src="${data}" alt="Handsome"/>`
  strip.insertBefore(link, strip.firstChild)
}

function redEffect(pixels) {
  return effect(pixels, 0)
}

function greenEffect(pixels) {
  return effect(pixels, 1)
}

function blueEffect(pixels) {
  return effect(pixels, 2)
}

function effect(pixels, pos) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i] = pos === 0 ? pixels.data[i] + 100 : pixels.data[i] * 0.5 // red
    pixels.data[i + 1] = pos === 1 ? pixels.data[i] + 100 : pixels.data[i] * 0.5 // green
    pixels.data[i + 2] = pos === 2 ? pixels.data[i] + 100 : pixels.data[i] * 0.5 // blue
    // pixels.data[i + 3] = pixels.data[i + 3] // alpha
  }

  return pixels
}

function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i] // red
    pixels.data[i + 500] = pixels.data[i + 1] // green
    pixels.data[i - 550] = pixels.data[i + 2] // blue
    // pixels.data[i + 3] = pixels.data[i + 3] // alpha
  }

  return pixels
}

function greenScreen(pixels) {
  let levels = {}

  document.querySelectorAll('input[type=range]').forEach(input => {
    levels[input.name] = input.value
  })

  for (let i = 0; i < pixels.data.length; i += 4) {
    let red = pixels.data[i]
    let green = pixels.data[i + 1]
    let blue = pixels.data[i + 2]
    let alpha = pixels.data[i + 3]

    if (
      red >= levels.RMin
      && green >= levels.GMin
      && blue >= levels.BMin
      && red <= levels.RMax
      && green <= levels.GMax
      && blue <= levels.BMax
      ) {
        pixels.data[i + 3] = 0
      }
  }

  return pixels
}

takePhotoBtn.addEventListener('click', takePhoto)
getVideo()
video.addEventListener('canplay', paintToCanvas)