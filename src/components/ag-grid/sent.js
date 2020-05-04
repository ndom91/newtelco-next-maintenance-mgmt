import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faCheckDouble,
  faQuestion
} from '@fortawesome/free-solid-svg-icons'
import {
  faCircle
} from '@fortawesome/free-regular-svg-icons'

const SentIcon = ({ node }) => {
  const {
    sent
  } = node.data

  if (sent === '2' || sent === 2) {
    return (
      <FontAwesomeIcon style={{ fontSize: '12px' }} width='1.5em' icon={faCheckDouble} />
    )
  } else {
    const isTrue = (sent == 'true')
    if (isTrue) {
      return <FontAwesomeIcon style={{ fontSize: '12px' }} width='1.5em' icon={faCheck} />
    } else {
      return <FontAwesomeIcon style={{ fontSize: '12px' }} width='1.5em' icon={faCircle} />
    }
  }
  
  // if (sent === '1' || sent === 'true' || sent === 1 || sent === true) {
  //   return (
  //     <FontAwesomeIcon style={{ fontSize: '12px' }} width='1.5em' icon={faCheck} />
  //   )
  // } else if (sent === '0' || sent === 'false' || sent === 0 || sent === false) {
  //   return (
  //     <FontAwesomeIcon style={{ fontSize: '12px' }} width='1.5em' icon={faCircle} />
  //   )
  // } else {
  //   return (
  //     <FontAwesomeIcon style={{ fontSize: '12px' }} width='1.5em' icon={faQuestion} />
  //   )
  // }
}

export default SentIcon
