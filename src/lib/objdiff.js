import transform from "lodash.transform"
import isEqual from "lodash.isequal"
import isArray from "lodash.isarray"
import isObject from "lodash.isobject"

/**
 * Find difference between two objects
 * @param  {object} origObj - Source object to compare newObj against
 * @param  {object} newObj  - New object with potential changes
 * @return {object} differences
 */
const objDiff = (origObj, newObj) => {
  const changes = (newObj, origObj) => {
    let arrayIndexCounter = 0
    return transform(newObj, (result, value, key) => {
      if (!isEqual(value, origObj[key])) {
        const resultKey = isArray(origObj) ? arrayIndexCounter++ : key
        result[resultKey] =
          isObject(value) && isObject(origObj[key])
            ? changes(value, origObj[key])
            : value
      }
    })
  }
  return changes(newObj, origObj)
}

export default objDiff
