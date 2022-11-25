const express = require('express')
const http = require('http')
const Stream = require('node-rtsp-stream')
const sensor = require('node-dht-sensor')
const { Server } = require('socket.io')
const Gpio = require('pigpio').Gpio
const VL53L0X = require('vl53l0x') // TOF (m5stack)
const aht20 = require('aht20-sensor')
const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const cron = require('node-cron')

const app = express()
const server = http.createServer(app)
const io = new Server(server)
let brightness = 150 // max 250
let snapshot = getLastSnapshot()

// SETTING
const DISTANCE_BREAK = 600 // if distance detected is lower than DISTANCE_BREAK = object detected
const TEMPERATURE_LIMIT = 15 // if object detected and the temperature is lower than TEMPERATURE_LIMIT = turn heater on

// Components
const light = new Gpio(27, { mode: Gpio.OUTPUT })
const distanceRelay = new Gpio(22, { mode: Gpio.OUTPUT })
const heaterRelay = new Gpio(17, { mode: Gpio.OUTPUT })

// Initial state
light.pwmWrite(brightness)
distanceRelay.digitalWrite(1)
heaterRelay.digitalWrite(0)

// Functions
async function getDistance() {
  async function tof(vl53l0x) {
    try {
      while(true) {
        const dist = await vl53l0x.measure()
        if (dist > 0 && dist < 800) {
          return dist
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  try {
    const vl53l0x = await VL53L0X(...[1, 0x29])
    const dstn = await tof(vl53l0x)
    return dstn
  } catch (error) {
    console.log(error)
  }
}

function Timer(fn, t) {
  let timerObj = setInterval(fn, t)

  this.stop = function () {
    if (timerObj) {
      clearInterval(timerObj)
      timerObj = null
    }

    return this
  }

  this.start = function() {
    if (!timerObj) {
      this.stop()
      timerObj = setInterval(fn, t)
    }

    return this
  }

  this.reset = function(newT = t) {
    t = newT
    return this.stop().start()
  }
}

function getLastSnapshot() {
  const files = orderReccentFiles('./public/snapshots/')
  return files.length ? files[0].file : undefined
}

function orderReccentFiles(dir) {
  return fs.readdirSync(dir)
    .filter((file) => fs.lstatSync(path.join(dir, file)).isFile() && file.match(/\.jpg$/))
    .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
}

async function getTemperatureHumidity() {
  async function sensor(sensor) {
    const temperature = await sensor.temperature()
    const humidity = await sensor.humidity()
    return [temperature, humidity]
  }

  try {
    const open = await aht20.open()
    return await sensor(open)
  } catch (error) {
    console.log(error)
  }
}

function deleteSnapshots() {
  const path = './public/snapshots/'

  // delete strange files
  const regex = /^\..*\.jpg$/
  fs.readdirSync(path)
    .filter(f => regex.test(f))
    .map(f => fs.unlinkSync(path + f))

  // delete older files than one week (86400000 * 7)
  fs.readdirSync(path).forEach(file => {
    const isOld = Date.parse(fs.statSync(path + file).ctime) < Date.now() - (86400000 * 7)

    if (isOld) {
      fs.unlinkSync(path + file)
    }
  })
}

function makeSnapshot() {
  deleteSnapshots() // delete old snapshots and strange files

  const date = new Date()
  const year = date.getUTCFullYear()
  const month = (date.getUTCMonth() + 1).toString().length === 1 ? `0${date.getUTCMonth() + 1}` : (date.getUTCMonth() + 1).toString()
  const day = date.getUTCDate().toString().length === 1 ? `0${date.getUTCDate()}` : date.getUTCDate().toString()
  const hour = date.getUTCHours().toString().length === 1 ? `0${date.getUTCHours()}` : date.getUTCHours().toString()
  const minute = date.getUTCMinutes().toString().length === 1 ? `0${date.getUTCMinutes()}` : date.getUTCMinutes().toString()
  const second = date.getUTCSeconds().toString().length === 1 ? `0${date.getUTCSeconds()}` : date.getUTCSeconds().toString()
  const filename = `${year}-${month}-${day}_${hour}-${minute}-${second}.jpg`
  shell.exec(`ffmpeg -y -i rtsp://192.168.0.29:8554/stream1 -vframes 1 ./public/snapshots/${filename}`)
  console.log('snapshot taken')
  return filename
}

function getSnapshots() {
  return fs.readdirSync('./public/snapshots').filter(file => file.match(/\.jpg$/)).map(file => file).reverse().slice(0, 10)
}

function reboot() {
  console.log('rebooting...')
  setTimeout(() => {
    shell.exec('sudo reboot')
  }, 2000)
}

// APP ###################################
app.use(express.static('public'))

let temperature = 0
let humidity = 0
let distance = 0
let lastObjectDistance = 0

// Temperature & Humidity
setInterval(async () => {
  [temperature, humidity] = await getTemperatureHumidity()
}, 1000)

// Distance
const timer = new Timer(() => {
  distanceRelay.digitalWrite(1)
}, 30 * 60 * 1000) // 30 * 60 * 1000
setInterval(async () => {
  if (distanceRelay.digitalRead() === 1) {
    distance = await getDistance()

    // Object detected
    if (distance != lastObjectDistance && distance <= DISTANCE_BREAK) {
      distanceRelay.digitalWrite(0)
      lastObjectDistance = distance
      snapshot = makeSnapshot()
      timer.reset(30 * 60 * 1000)

      // Heater
      if (temperature != 0 && temperature < TEMPERATURE_LIMIT) {
        heaterRelay.digitalWrite(1)
      }
    } else {
      heaterRelay.digitalWrite(0)
    }
  }
}, 1 * 1000)

io.on('connection', (socket) => {

  // Connection
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  io.emit('enable reboot')

  setInterval(() => {
    socket.emit('temperature', (Math.round(temperature * 10) / 10).toFixed(1))
    socket.emit('humidity', Math.round(humidity))
    socket.emit('distance', Math.round(distance / 10))
    socket.emit('distanceRelay', distanceRelay.digitalRead())
    socket.emit('heaterRelay', heaterRelay.digitalRead())
    socket.emit('last snapshot', getLastSnapshot())
  }, 1 * 1000)

  // Brightness
  io.emit('brightness', brightness)

  socket.on('brightness decrease', () => {
    brightness = (brightness - 25) < 0 ? 0 : brightness - 25
    light.pwmWrite(brightness)
    io.emit('brightness', brightness)
  })

  socket.on('brightness increase', () => {
    brightness = (brightness + 25) > 250 ? 250 : brightness + 25
    light.pwmWrite(brightness)
    io.emit('brightness', brightness)
  })

  // Snapshot
  socket.on('make snapshot', () => {
    snapshot = makeSnapshot()
    io.emit('last snapshot', snapshot)
    io.emit('enable snapshot')
  })

  // Get snapshots
  socket.on('get snapshots', () => {
    io.emit('snapshots', getSnapshots())
  })

  // Delete snapshots
  socket.on('delete snapshots', (value) => {
    JSON.parse(value).forEach(file => {
      fs.unlinkSync(`./public/snapshots/${file}`)
    })
    io.emit('snapshots', getSnapshots())
    io.emit('last snapshot', getLastSnapshot())
  })

  // Reboot
  socket.on('reboot', () => {
    io.emit('rebooting')
    reboot()
  })

  // Reboot every day at 01:00: 0 1 * * *
  // Reboot every 2 hours: 0 */2 * * *
  cron.schedule('0 */2 * * *', () => {
    io.emit('rebooting')
    reboot()
  })
})

new Stream({
  name: 'name',
  streamUrl: 'rtsp://192.168.0.29:8554/stream1',
  wsPort: 9999,
  ffmpegOptions: { // options ffmpeg flags
    '-stats': '', // an option with no neccessary value uses a blank string
    '-r': 30, // options with required values specify the value after the key
  }
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});