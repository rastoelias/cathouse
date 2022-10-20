const express = require('express')
const http = require('http')
const Stream = require('node-rtsp-stream')
const sensor = require('node-dht-sensor')
const { Server } = require('socket.io')
const Gpio = require('pigpio').Gpio;

const app = express()
const server = http.createServer(app)
const io = new Server(server)
const ir = new Gpio(4, { mode: Gpio.INPUT })

app.use(express.static('public'))

app.get('/', (req, res) => {
  // res.sendFile(__dirname + '/index.html');
})

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

  // Temperature & Humidity
  setInterval(() => {
    sensor.read(11, 17, function(err, temperature, humidity) {
      if (!err) {
        // console.log(`temp: ${temperature}°C, humidity: ${humidity}%`);
        // socket.emit('chat message', 'hi');
        socket.emit('temperature', temperature);
        socket.emit('humidity', humidity);
      }
    });
  }, 1000)

  // IR proximity
  setInterval(() => {
    socket.emit('proximity', ir.digitalRead());
    console.log(ir.digitalRead())
  }, 1000)

});

new Stream({
  name: 'name',
  streamUrl: 'rtsp://192.168.0.29:8554/stream1',
  wsPort: 9999,
  ffmpegOptions: { // options ffmpeg flags
    '-stats': '', // an option with no neccessary value uses a blank string
    '-r': 30 // options with required values specify the value after the key
  }
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});