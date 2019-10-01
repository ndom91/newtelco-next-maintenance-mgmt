import React, { Component } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEdit
} from '@fortawesome/free-solid-svg-icons'

export default class EditBtn extends Component {
  render () {
    // console.log(this.props.node)
    return (
      <Link href={`/maintenance?id=${this.props.node.data.id}`}>
        <FontAwesomeIcon width='1.125em' className='edit-icon' icon={faEdit} />
      </Link>
    )
  }
};
