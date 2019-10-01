import React from 'react'
import Link from 'next/link'

export default class RequireLogin extends React.Component {
  render () {
    return (
      <div className='require-login-wrapper'>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-6 mr-auto ml-auto'>
              <div className='card mt-3 mb-3'>
                <h4 className='card-header text-error'>Error!</h4>
                <div className='card-body pb-0'>
                    <p>
                      You must be signed-in to view this content.
                    </p>
                    <p className='text-right'>
                      <Link href="/auth">Sign-In</Link>
                    </p>
                </div>
              </div>
            </div>
          </div>
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
