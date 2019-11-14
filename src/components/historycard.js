import React from 'react'
import Link from 'next/link'
import moment from 'moment-timezone'
import EdittedBy from '../components/ag-grid/edittedby'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPencilAlt
} from '@fortawesome/free-solid-svg-icons'
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Button,
  Badge
} from 'shards-react'

class MaintCard extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      state: false,
      maintenanceIdDisplay: `NT-${this.props.maint.id}`
    }
  }

  render () {
    const {
      maintenanceIdDisplay
    } = this.state

    return (
      <li className='maint-wrapper'>
        <Card className='maint-card'>
          <CardHeader className='maint-card-header'>
            <Badge theme='secondary' style={{ fontSize: '1rem', marginRight: '5px' }} outline>
              {maintenanceIdDisplay}
            </Badge>
            {this.props.maint.name}
            <Link href={`/maintenance?id=${this.props.maint.id}`} passHref>
              <Button className='maint-card-edit-btn'>
                <FontAwesomeIcon icon={faPencilAlt} width='1.2em' />
              </Button>
            </Link>
          </CardHeader>
          <CardBody>
            <CardTitle>Lorem Ipsum</CardTitle> 
            <div className='maint-card-date-wrapper'>
              <span>
                {moment(this.props.maint.startDateTime).format('DD.MM.YYYY HH:mm:ss')}
              </span>
              <span>
                <i>to</i>
              </span>
              <span>
                {moment(this.props.maint.endDateTime).format('DD.MM.YYYY HH:mm:ss')}
              </span>
            </div>
          </CardBody>
          <CardFooter className='maint-card-footer'>
            <EdittedBy username={this.props.maint.bearbeitetvon} />
          </CardFooter>
        </Card>
        <style jsx>{`
          :global(.maint-wrapper) {
            display: inline-block;
            list-style: none;
            width: 280px;
            margin: 5px 10px;
          }
          :global(.maint-card) {
            transition: all 250ms ease-in-out;
          }
          :global(.maint-card:hover) {
            box-shadow: 0 5px 10px 1px rgba(0,0,0,0.4);
            transform: translateY(-5px);
          }
          :global(.maint-card-date-wrapper) {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          :global(.maint-card-header) {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.09375rem 1.175rem;
          }
          :global(.maint-card-edit-btn) {
            padding: 0.75rem;
          }
        `}
        </style>
      </li>
    )
  }
}

export default MaintCard
