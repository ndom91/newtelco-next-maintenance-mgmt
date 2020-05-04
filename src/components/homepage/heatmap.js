import React from 'react'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import ReactTooltip from 'react-tooltip'
import CalendarHeatmap from 'react-calendar-heatmap'

const Heatmap = () => {
  const { data } = useSWR(
    `/api/maintenances/heatmap`,
    (...args) => fetch(...args).then(res => res.json()),
    { suspense: true, revalidateOnFocus: false }
  )

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
}

export default Heatmap
