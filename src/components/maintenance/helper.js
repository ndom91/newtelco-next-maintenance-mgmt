import { isValid, format } from 'date-fns'

// module.exports = {
// deduplicate array of objects
const getUnique = (arr, comp) => {
  const unique = arr
    .map(e => e[comp])
    .map((e, i, final) => final.indexOf(e) === i && i)
    .filter(e => arr[e])
    .map(e => arr[e])
  return unique
}

// convert datetime
const convertDateTime = datetime => {
  let newDateTime
  if (isValid(new Date(datetime))) {
    newDateTime = format(new Date(datetime), 'dd.M.yyyy, HH:mm:ss')
  } else {
    newDateTime = datetime
  }
  return newDateTime
}
// }

export { getUnique, convertDateTime }
