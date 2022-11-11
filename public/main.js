var socket = io();

// Elements
const brightnessPerc = document.getElementById('brightnessPerc')
const brightnessDecrease = document.getElementById('brightnessDecrease')
const brightnessIncrease = document.getElementById('brightnessIncrease')
const snapshotBtn = document.getElementById('makeSnapshot')
const lastSnapshot = document.getElementById('lastSnapshot')
const carouselInner = document.querySelector('.carousel-inner')
const carouselIndicators = document.querySelector('.carousel-indicators')
const deleteCount = document.querySelector('.deleteCount')
const deleteJSON = document.getElementById('deleteJSON')
const deleteAndReload = document.getElementById('deleteAndReload')
const temperature = document.getElementById('temperature')
const temperatureIcon = document.getElementById('temperatureIcon')
const humidity = document.getElementById('humidity')
const distance = document.getElementById('distance')
const distanceRelayStatusIcon = document.getElementById('distanceRelayStatusIcon')
const heaterRelayStatusIcon = document.getElementById('heaterRelayStatusIcon')
const heaterRelayFireIcon = document.getElementById('heaterRelayFireIcon')
const rebootBtn = document.getElementById('rebootBtn')

const noSnapshotIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-image" viewBox="0 0 16 16" style="opacity: .1;"><path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/></svg>'

// Init
const { day, month, hour, minute } = getDateFromFilename(localStorage.getItem('lastSnapshot'))
brightnessPerc.innerHTML = localStorage.getItem('brightnessPerc') ? localStorage.getItem('brightnessPerc') : '0'
lastSnapshot.innerHTML = localStorage.getItem('lastSnapshot') ? `<img src="./snapshots/${localStorage.getItem('lastSnapshot')}" width="54" class="rounded"><div class="date">${day}/${month} ${hour}:${minute}</div>` : noSnapshotIcon
temperature.innerHTML = localStorage.getItem('temperature') ? localStorage.getItem('temperature') : '00.0'
humidity.innerHTML = localStorage.getItem('humidity') ? localStorage.getItem('humidity') : '00'
distance.innerHTML = localStorage.getItem('distance') ? localStorage.getItem('distance') : '00'

// Stream
player = new JSMpeg.Player('ws://192.168.0.29:9999', {
  canvas: document.getElementById('canvas') // Canvas should be a canvas DOM element
})

// Brightness
socket.on('brightness', (value) => {
  const perc = (value / 250) * 100

  brightnessPerc.innerHTML = perc
  localStorage.setItem('brightnessPerc', perc)

  if (perc === 0) {
    brightnessDecrease.setAttribute('disabled', true)
  } else {
    brightnessDecrease.removeAttribute('disabled')
  }
  if (perc === 100) {
    brightnessIncrease.setAttribute('disabled', true)
  } else {
    brightnessIncrease.removeAttribute('disabled')
  }
})

// Temperature
socket.on('temperature', (value) => {
  temperature.innerHTML = value
  temperatureIcon.classList.remove('text-secondary', 'text-danger', 'text-warning')

  if (value >= 20) {
    temperatureIcon.classList.add('text-danger')
  } else if (value <= 15) {
    temperatureIcon.classList.add('text-info')
  } else {
    temperatureIcon.classList.add('text-warning')
  }
  localStorage.setItem('temperature', value)
})

// Humidity
socket.on('humidity', (value) => {
  humidity.innerHTML = value
  localStorage.setItem('humidity', value)
})

// Distance
socket.on('distance', (value) => {
  distance.innerHTML = value
  localStorage.setItem('distance', value)
})

// Distance Relay
socket.on('distanceRelay', (value) => {
  if (value === 1) {
    distanceRelayStatusIcon.classList.remove('text-muted')
    distanceRelayStatusIcon.classList.add('text-success')
  } else {
    distanceRelayStatusIcon.classList.add('text-muted')
    distanceRelayStatusIcon.classList.remove('text-success')
  }
})

// Heater Relay
socket.on('heaterRelay', (value) => {
  if (value === 1) {
    heaterRelayStatusIcon.classList.remove('text-muted')
    heaterRelayStatusIcon.classList.add('text-success')

    heaterRelayFireIcon.classList.remove('text-muted')
    heaterRelayFireIcon.classList.add('text-warning')
  } else {
    heaterRelayStatusIcon.classList.add('text-muted')
    heaterRelayStatusIcon.classList.remove('text-success')

    heaterRelayFireIcon.classList.add('text-muted')
    heaterRelayFireIcon.classList.remove('text-warning')
  }
})

// Last snapshot
socket.on('last snapshot', (value) => {
  if (value) {
    if (localStorage.getItem('lastSnapshot') !== value) {
      const { day, month, hour, minute } = getDateFromFilename(value)

      lastSnapshot.innerHTML = `<img src="./snapshots/${value}" width="54" class="rounded"><div class="date">${day}/${month} ${hour}:${minute}</div>`
      localStorage.setItem('lastSnapshot', value)
    }
  } else {
    localStorage.removeItem('lastSnapshot')
    lastSnapshot.innerHTML = noSnapshotIcon
  }
})

// Snapshots
socket.on('snapshots', (value) => {
  const snapshots = {
    inner: '',
    indicators: ''
  }
  value.map((snapshot, i) => {
    const { day, month, hour, minute } = getDateFromFilename(snapshot)

    snapshots.inner += `<div class="carousel-item ${i === 0 ? 'active' : ''}"><img src="./snapshots/${snapshot}" class="d-block w-100" alt="..."><div class="carousel-caption"><h5 class="fs-6 fw-lighter">${day}/${month} <small>${hour}:${minute}</small></h5></div></div>`
    snapshots.indicators += `<button type="button" data-bs-target="#carouselSnap" data-bs-slide-to="${i}" class="${i === 0 ? 'active' : ''}" aria-current="true" aria-label="Slide ${i}"></button>`
  })
  carouselInner.innerHTML = snapshots.inner
  carouselIndicators.innerHTML = snapshots.indicators
  deleteCount.innerHTML = value.length
  deleteJSON.value = JSON.stringify(value)
  deleteAndReload.removeAttribute('disabled')
})

// rebooting
socket.on('rebooting', () => {
  rebootBtn.setAttribute('disabled', true)
  rebootBtn.innerHTML = 'Rebooting...'
})

// enable reboot btn
socket.on('enable reboot', () => {
  rebootBtn.innerHTML = 'Reboot'
  rebootBtn.removeAttribute('disabled')
})

// enable snapshot btn
socket.on('enable snapshot', () => {
  snapshotBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-record-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>'
  snapshotBtn.removeAttribute('disabled')
})

// Event listeners ==================================

// Brightness
brightnessDecrease.addEventListener('click', () => {
  socket.emit('brightness decrease')
})
brightnessIncrease.addEventListener('click', () => {
  socket.emit('brightness increase')
})

// Snapshot
snapshotBtn.addEventListener('click', () => {
  snapshotBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-record-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>'
  snapshotBtn.setAttribute('disabled', true)
  socket.emit('make snapshot')
})

// Delete snapshots and reload modal
deleteAndReload.addEventListener('click', () => {
  deleteAndReload.setAttribute('disabled', true)
  socket.emit('delete snapshots', deleteJSON.value)
})

// Last snapshot
lastSnapshot.addEventListener('click', () => {
  socket.emit('get snapshots')
})

// Reboot
rebootBtn.addEventListener('click', () => {
  rebootBtn.setAttribute('disabled', true)
  rebootBtn.innerHTML = 'Rebooting...'
  socket.emit('reboot')
})

// Functions

function getDateFromFilename(filename) {
  return {
    day: filename ? filename.substring(8, 10) : 0,
    month: filename ? filename.substring(5, 7) : 0,
    hour: filename ? filename.substring(11, 13) : 0,
    minute: filename ? filename.substring(14, 16) : 0,
  }
}
