// https://github.com/williamkapke/vl53l0x

const VL53L0X = require('vl53l0x')
const args = [1, 0x29]

VL53L0X(...args).then(async (vl53l0x) => {
  while(true) {
    console.log(await vl53l0x.measure())
  }
})
.catch(console.error)