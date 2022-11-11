const Gpio = require('pigpio').Gpio;

const distance = new Gpio(5, { mode: Gpio.INPUT })

setInterval(() => {
  // socket.emit('proximity', ir.digitalRead());
  console.log(distance.digitalRead())
}, 1000)

// var blinkInterval = setInterval(blinkLED, 3000); //run the blinkLED function every 250ms

// function blinkLED() { //function to start blinking
//   if (relay.readSync() === 0) { //check the pin state, if the state is 0 (or off)
//     relay.writeSync(1); //set pin state to 1 (turn LED on)
//   } else {
//     relay.writeSync(0); //set pin state to 0 (turn LED off)
//   }
// }

// function endBlink() { //function to stop blinking
//   clearInterval(blinkInterval); // Stop blink intervals
//   relay.writeSync(0); // Turn LED off
//   relay.unexport(); // Unexport GPIO to free resources
// }

// setTimeout(endBlink, 50000); //stop blinking after 5 seconds
