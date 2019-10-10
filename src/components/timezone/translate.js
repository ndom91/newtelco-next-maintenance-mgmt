const fs = require('fs')
const rawdata = fs.readFileSync('timezones.json')
const timezones = JSON.parse(rawdata)

const tzArray = Object.entries(timezones)

let outputArray = []

tzArray.forEach(tz => {
 outputArray.push({ value: tz[0], label: tz[1] }) 
})

let writeOutput = JSON.stringify(outputArray)

fs.writeFileSync('timezones-array2.js', writeOutput)
