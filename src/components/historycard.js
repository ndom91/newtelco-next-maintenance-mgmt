import React from 'react'
import Link from 'next/link'
import fetch from 'isomorphic-unfetch'
import { Tooltip } from 'react-tippy'
import 'react-tippy/dist/tippy.css'
import EdittedBy from '../components/ag-grid/edittedby'
import CardCalendar from './cardcalendar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPencilAlt,
  faBan,
  faFirstAid,
  faClock,
  faCheckDouble,
  faChevronRight
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
      maintenanceIdDisplay: `NT-${this.props.maint.id}`,
      iconUrl: ''
    }
  }

  componentDidMount () {
    fetch(`/v1/api/favicon?d=${this.props.maint.mailDomain}`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        const iconUrl = data.icons
        this.setState({
          iconUrl: iconUrl
        })
      })
      .catch(err => console.error(err))
  }

  render () {
    const {
      maintenanceIdDisplay,
      iconUrl
    } = this.state

    return (
      <li className='maint-wrapper'>
        <Card className='maint-card'>
          <CardHeader className='maint-card-header'>
            <Badge theme='secondary' style={{ fontSize: '2rem' }} outline>
              {maintenanceIdDisplay}
            </Badge>
          </CardHeader>
          <CardBody>
            <img className='maint-icon-bg' src={iconUrl} alt='Logo' />
            <CardTitle>
              <span>
                {this.props.maint.name}
              </span>
            </CardTitle>
            <span title={this.props.maint.betroffeneCIDs} className='card-cid-wrapper'>
              {this.props.maint.betroffeneCIDs}
            </span>
            <div className='maint-card-date-wrapper'>
              <CardCalendar date={this.props.maint.startDateTime} />
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <FontAwesomeIcon icon={faChevronRight} style={{ color: '#6d6d6d30' }} width='0.8em' />
              </span>
              <CardCalendar date={this.props.maint.endDateTime} />
            </div>
          </CardBody>
          <CardFooter className='maint-card-footer'>
            <EdittedBy username={this.props.maint.bearbeitetvon} />
            <Badge style={this.props.maint.done === 'true' ? { opacity: '1.0' } : {}} outline className='maint-card-complete-badge footer-badge'>
              <Tooltip
                title='Completed'
                position='top'
                trigger='mouseenter'
                delay='250'
                distance='25'
                interactiveBorder='15'
                arrow
                size='small'
                theme='transparent'
              >
                <FontAwesomeIcon icon={faCheckDouble} width='1.2em' />
              </Tooltip>
            </Badge>
            <Badge style={this.props.maint.cancelled === 'true' ? { opacity: '1.0' } : {}} outline className='maint-card-cancel-badge footer-badge'>
              <Tooltip
                title='Cancelled'
                position='top'
                trigger='mouseenter'
                delay='250'
                distance='25'
                interactiveBorder='15'
                arrow
                size='small'
                theme='transparent'
              >
                <FontAwesomeIcon icon={faBan} width='1.2em' />
              </Tooltip>
            </Badge>
            <Badge style={this.props.maint.emergency === 'true' ? { opacity: '1.0' } : {}} outline className='maint-card-emergency-badge footer-badge'>
              <Tooltip
                title='Emergency'
                position='top'
                trigger='mouseenter'
                delay='250'
                distance='25'
                interactiveBorder='15'
                arrow
                size='small'
                theme='transparent'
              >
                <FontAwesomeIcon icon={faFirstAid} width='1.2em' />
              </Tooltip>
            </Badge>
            <Badge style={this.props.maint.rescheduled > 0 ? { opacity: '1.0' } : {}} outline className='maint-card-reschedule-badge footer-badge'>
              <Tooltip
                title='Rescheduled'
                position='top'
                trigger='mouseenter'
                delay='250'
                distance='25'
                interactiveBorder='15'
                arrow
                size='small'
                theme='transparent'
              >
                <Badge pill>
                  {this.props.maint.rescheduled > 0 ? this.props.maint.rescheduled : ''}
                </Badge>
                <FontAwesomeIcon icon={faClock} width='1.2em' />
              </Tooltip>
            </Badge>
            <Link href={`/maintenance?id=${this.props.maint.id}`} passHref>
              <Button className='maint-card-edit-btn'>
                <FontAwesomeIcon icon={faPencilAlt} width='1.5em' />
              </Button>
            </Link>
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
            box-shadow: none;
            border-radius: 1rem;
            overflow: hidden;
            border: ${this.props.maint.done === 'true' ? '1px solid #67b246' : null};
          }
          :global(.maint-card:hover) {
            box-shadow: 0 5px 10px 1px rgba(0,0,0,0.4);
            transform: translateY(-5px);
          }
          :global(.maint-card-footer) {
            display: flex;
            justify-content: space-around;
          }
          :global(.maint-card-date-wrapper) {
            display: flex;
            width: 100%;
            margin-top: 20px;
            justify-content: space-between;
          }
          :global(.maint-card-header) {
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 1.09375rem 1.175rem;
          }
          :global(.maint-card-edit-btn) {
            height: 32px;
            width: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0.5rem;
          }
          :global(.footer-badge) {
            height: 32px;
            width: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0.2;
          }
          :global(.card-cid-wrapper) {
            font-size: 0.9rem;
            max-width: 230px;
            max-height: 16px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: inline-block;
            margin-top: 15px;
          }
          :global(.maint-card-reschedule-badge > div) {
            position: relative;
          }
          :global(.maint-card-reschedule-badge .badge-pill) {
            position: absolute;
            top: -3px;
            right: -3px;
            font-size: 95%;
          }
          :global(.maint-icon-bg) {
            position: absolute;
            top: 90px;
            right: 10px;
            height: 64px;
            width: 64px;
            z-index: 0;
            opacity: 0.1;
          }
        `}
        </style>
      </li>
    )
  }
}

export default MaintCard
