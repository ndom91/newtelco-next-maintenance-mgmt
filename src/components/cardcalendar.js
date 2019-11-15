import React from 'react'
import moment from 'moment-timezone'

const CardCalendar = (props) => {
  return (
    <div className='cal-wrapper'>
      <div className='cal-header' />
      <div className='date-wrapper'>
        <span>
          {moment(props.date).format('DD.MM.YYYY HH:mm:ss')}
        </span>
      </div>
      <style jsx>{`
        :global(.cal-wrapper) {
          max-width: 5.8rem;
        }
        :global(.date-wrapper) {
          border: 1px solid #6d6d6d;
          border-radius: 0 0 10px 10px;
          padding: 3px;
          text-align: center;
        }
        :global(.cal-header) {
          width: 100%;
          border-radius: 5px 5px 0 0;
          height: 20px;
          background-color: #6d6d6d;
        }
      `}
      </style>
    </div>
  )
}

export default CardCalendar
