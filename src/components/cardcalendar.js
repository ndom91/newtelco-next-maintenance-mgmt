import moment from "moment-timezone"

const CardCalendar = (props) => {
  return (
    <div className="cal-wrapper">
      <div className="cal-header" />
      <div className="date-wrapper">
        <span>{moment(props.date).format("HH:mm:ss").substr(0, 5)}</span>
        <br />
        <span>{moment(props.date).format("MMM DD")}</span>
      </div>
      <style jsx>
        {`
          :global(.cal-wrapper) {
            max-width: 5.8rem;
          }
          :global(.date-wrapper) {
            border: 1px solid #6d6d6d30;
            border-radius: 0 0 10px 10px;
            padding: 3px;
            text-align: center;
            min-width: 85px;
          }
          :global(.cal-header) {
            width: 100%;
            border-radius: 5px 5px 0 0;
            height: 20px;
            background-color: #6d6d6d30;
          }
        `}
      </style>
    </div>
  )
}

export default CardCalendar
