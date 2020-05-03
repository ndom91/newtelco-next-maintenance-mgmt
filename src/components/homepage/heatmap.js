import React from 'react'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import ReactTooltip from 'react-tooltip'
import CalendarHeatmap from 'react-calendar-heatmap'
import {
  Placeholder
} from 'rsuite'

const Heatmap = () => {
  const { data } = useSWR(
    `/api/maintenances/heatmap`,
    (...args) => fetch(...args).then(res => res.json()),
    { suspense: false, revalidateOnFocus: false }
  )

  if (data && data.maintenances) {
    return (
      <div style={{ width: '100%' }}>
        {!data 
        ? (
          <Placeholder.Graph active />
        ) : (
          <>
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
          </>
        )}
      </div>
    )
  } else {
    return (
      <Placeholder.Graph height='250' width='100%' />
    )
  }
}

export default Heatmap
