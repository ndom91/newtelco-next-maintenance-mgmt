import React, { Component } from 'react'
import Link from 'next/link'

export default class EditBtn extends Component {
  render () {
    // console.log(this.props.node)
    return (
      <Link href={`/maintenance?id=${this.props.node.data.id}`}><button style={{ height: 20, lineHeight: 0.5 }} className='btn btn-info'>Edit</button></Link>
    )
  }
};
