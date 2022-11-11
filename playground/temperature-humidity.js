const i2c = require('i2c-bus')

const aht20 = require('aht20-sensor');

aht20.open().then(async (sensor) => {
    const temp = await sensor.temperature();
    const hum = await sensor.humidity();
    console.log(temp, hum);
});

// M5Stack ENV III Unit with Temperature Humidity Air Pressure Sensor (SHT30+QMP6988)
// const SHT30_ADDR = 0x44
// const QMP6988_ADDR = 0x70
// const ADDR = 0x38
// const REG = 0xf0

// const reg_arr = [
//   0x00,
//   0x10,
//   0x20,
//   0x30,
//   0x40,
//   0x50,
//   0x60,
//   0x70,
//   0x80,
//   0x90,
//   0xa0,
//   0xb0,
//   0xc0,
//   0xd0,
//   0xe0,
//   0xf0
// ]
// reg_arr.forEach(REG => {
//   i2c.openPromisified(1).
//     then(i2c1 => {
//         // return i2c1.i2cFuncs().then(rawData => {
//         return i2c1.readWord(ADDR, REG).then(rawData => {
//           console.log(rawData)
//         }).then(_ => i2c1.close())
//       }
//     ).catch(console.log)
// })

// const toCelsius = rawData => {
//   let celsius = (rawData & 0x0fff) / 16
//   if (rawData & 0x1000) {
//     celsius -= 256
//   }
//   return celsius
// };

// reg_arr.forEach(REG => {
//   const wbuf = Buffer.from([REG])
//   const rbuf = Buffer.alloc(2)

//   // i2c.openPromisified(1).
//   //   then(i2c1 => i2c1.i2cWrite(ADDR, wbuf.length, wbuf).
//   //   then(_ => i2c1.i2cRead(ADDR, rbuf.length, rbuf)).
//   //   then(data => console.log(data.buffer.readUInt16BE())).
//   //   then(_ => i2c1.close())).
//   //   catch(console.log);
//   i2c.openPromisified(1).
//     then(i2c1 => i2c1.readWord(ADDR, REG).
//     then(rawData => console.log(rawData)).
//     then(_ => i2c1.close())).
//     catch(console.log)
// })


// const i2c1 = i2c.openSync(1)
// console.log(i2c1)
// const rawData = i2c1.readWordSync(ADDR, REG)
// console.log(rawData)
// // console.log(rawData)
// i2c1.closeSync()

// i2c.openPromisified(1).
//   then(i2c1 => i2c1.readWord(SHT30_ADDR)).
//   then(rawData => console.log(rawData)).
//   catch(console.log)




// const temperature = new Gpio(3, { mode: Gpio.INPUT })

// setInterval(() => {
//   // socket.emit('proximity', ir.digitalRead());
//   console.log(temperature.digitalRead())
// }, 1000)


