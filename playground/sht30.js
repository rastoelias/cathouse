// https://github.com/kou029w/megabit
const { sht30 } = require("megabit");

async function measure() {
  const { humidity, temperature } = await sht30().read();
  console.log(`Humidity: ${humidity.toFixed(2)} %`);
  console.log(`Temperature: ${temperature.toFixed(2)} ℃`);
}

measure();