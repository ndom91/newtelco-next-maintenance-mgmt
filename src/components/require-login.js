import React from 'react'
import Link from 'next/link'

export default class RequireLogin extends React.Component {
  render () {
    return (
      <div className='require-login-wrapper'>
        <div>
          <h2>You must login to continue</h2>
          <Link href='/auth'>
              Login
          </Link>
        </div>
        <style jsx>{`
          .require-login-wrapper {
            display: flex;
            align-content: center;
          }
          .require-login-wrapper > div {
            margin-top: 20px;
            font-family: Lato, Helvetica;
          }
        `}
        </style>
      </div>
    )
  }
}
