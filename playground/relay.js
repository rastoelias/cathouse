// const Gpio = require('onoff').Gpio
const Gpio = require('pigpio').Gpio

// const relay = new Gpio(17, 'out')
const relay = new Gpio(17, { mode: Gpio.OUTPUT })

relay.digitalWrite(0)

setInterval(() => {
  relay.digitalWrite(!relay.digitalRead())
}, 10000)

// var blinkInterval = setInterval(blinkLED, 3000); //run the blinkLED function every 250ms

// function blinkLED() { //function to start blinking
//   console.log(relay.digitalRead())
//   if (relay.digitalRead() === 0) { //check the pin state, if the state is 0 (or off)
//     relay.digitalWrite(1); //set pin state to 1 (turn LED on)
//   } else {
//     relay.digitalWrite(0); //set pin state to 0 (turn LED off)
//   }
//   // if (relay.readSync() === 0) { //check the pin state, if the state is 0 (or off)
//   //   relay.writeSync(1); //set pin state to 1 (turn LED on)
//   // } else {
//   //   relay.writeSync(0); //set pin state to 0 (turn LED off)
//   // }
// }

// function endBlink() { //function to stop blinking
//   clearInterval(blinkInterval); // Stop blink intervals
//   relay.digitalWrite(0); // Turn LED off
//   // relay.unexport(); // Unexport GPIO to free resources
// }

// setTimeout(endBlink, 50000); //stop blinking after 5 seconds
