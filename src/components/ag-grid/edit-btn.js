import React, { Component } from 'react'
import Link from 'next/link'
import { Button } from 'shards-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPencilAlt
} from '@fortawesome/free-solid-svg-icons'

export default class EditBtn extends Component {
  render () {
    // console.log(this.props.node)
    return (
      <Link as={`m/${this.props.node.data.id}`} href={`/maintenance?id=${this.props.node.data.id}`}>
        <Button size='sm' outline>
          <FontAwesomeIcon width='1.325em' className='edit-icon' icon={faPencilAlt} />
        </Button>
      </Link>
    )
  }
};
