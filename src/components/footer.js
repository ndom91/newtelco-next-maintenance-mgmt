import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHeart
} from '@fortawesome/free-solid-svg-icons'
import {
  CardFooter
} from 'shards-react'

export default class Footer extends React.Component {
  render () {
    return (
      <>
        <CardFooter className='footer-wrapper'>
          <FontAwesomeIcon
            icon={faHeart}
            width='1em'
            style={{
              marginRight: '10px',
              color: 'secondary',
              opacity: '0.2'
            }}
          />
        ndomino
        </CardFooter>
        <style jsx>{`
          :global(.footer-wrapper) {
            display: flex;
            justify-content: flex-end;
            font-family: Poppins, Helvetica;
            font-size: 1em;
            font-weight: 100;
          } 
        `}
        </style>
      </>
    )
  }
}
