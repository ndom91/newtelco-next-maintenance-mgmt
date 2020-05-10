import React from 'react'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import { Panel, Loader, Placeholder } from 'rsuite'
import { ResponsiveCalendarCanvas } from '@nivo/calendar'

const Heatmap = () => {
  const { data } = useSWR(
    '/api/homepage/heatmap',
    (...args) => fetch(...args).then(res => res.json()),
    { revalidateOnFocus: false }
  )

  if (data) {
    return (
      <Panel header='Calendar' bordered style={{ width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '1100px', height: '400px' }}>
          <ResponsiveCalendarCanvas
            data={data.maintenances}
            from='2019-05-09'
            to='2020-05-09'
            minValue={0}
            maxValue={10}
            emptyColor='#eeeeee'
            colors={['#C6E2BA', '#8DC574', '#67B246', '#5A9C3D']}
            margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
            yearSpacing={40}
            monthBorderColor='#ffffff'
            dayBorderWidth={2}
            dayBorderColor='#ffffff'
          />
        </div>
      </Panel>
    )
  } else {
    return (
      <div style={{ height: '492px', width: '1200px', maxWidth: '1300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader />
      </div>
    )
  }
}

export default Heatmap
