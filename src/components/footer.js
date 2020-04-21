import React from 'react'
import {
  CardFooter
} from 'shards-react'

export default class Footer extends React.Component {
  render () {
    return (
      <>
        <CardFooter className='footer-wrapper'>
          <img
            style={{
              opacity: '0.5'
            }}
            width='32'
            src='/static/images/icons/ndo-120.png'
            alt='ndomino'
          />
        </CardFooter>
        <style jsx>{`
          :global(.footer-wrapper) {
            display: flex;
            justify-content: flex-end;
            font-family: Poppins, Helvetica;
            font-size: 1em;
            font-weight: 100;
            color: #cfd0d2;
          } 
        `}
        </style>
      </>
    )
  }
}
