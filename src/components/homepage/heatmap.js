import React from 'react'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import ReactTooltip from 'react-tooltip'
import CalendarHeatmap from 'react-calendar-heatmap'
import { Loader, Placeholder } from 'rsuite'

const Heatmap = () => {
  const { data } = useSWR(
    '/api/maintenances/heatmap',
    (...args) => fetch(...args).then(res => res.json()),
    { revalidateOnFocus: false }
  )

  if (data) {
    return (
      <div style={{ width: '100%', maxWidth: '1300px' }}>
        <CalendarHeatmap
          startDate={new Date('2019-01-01')}
          endDate={new Date()}
          values={data.maintenances}
          showWeekdayLabels
          classForValue={value => {
            if (!value) {
              return 'color-empty'
            }
            return `color-github-${value.value}`
          }}
          tooltipDataAttrs={value => {
            return {
              'data-tip': `${value.format} has ${value.value || '0'} maintenance(s)`
            }
          }}
        />
        <ReactTooltip />
      </div>
    )
  } else {
    return (
      <div style={{ height: '165px', width: '100%', maxWidth: '1300px' }}>
        <Placeholder.Graph active height='165px' style={{ maxWidth: '1300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader content='Loading...'/></Placeholder.Graph>
      </div>
    )
  }
}

export default Heatmap
