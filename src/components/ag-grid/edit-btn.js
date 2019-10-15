import React, { Component } from 'react'
import Link from 'next/link'
import { Button } from 'shards-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPencilAlt
} from '@fortawesome/free-solid-svg-icons'

export default class EditBtn extends Component {
  render () {
    return (
      <Link href={`/maintenance?id=${this.props.node.data.id}`} passHref>
        <Button style={{ padding: '0.7em 0.9em' }} size='sm' outline>
          <FontAwesomeIcon width='1.325em' style={{ fontSize: '12px' }} className='edit-icon' icon={faPencilAlt} />
        </Button>
      </Link>
    )
  }
};
