import React from 'react'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import { Bar } from '@nivo/bar'
import { Panel, Loader, Icon } from 'rsuite'

const BarChart = () => {
  const { data } = useSWR(
    '/api/homepage/perperson',
    (...args) => fetch(...args).then(res => res.json()),
    { suspense: false, revalidateOnFocus: false }
  )

  if (data) {
    const Users = data.query.sort((a, b) => { return (a.value < b.value) ? -1 : 0 })
    return (
      <Panel bordered header={<div style={{ display: 'flex', justifyContent: 'space-between' }}>Totals<Icon icon='bar-chart' style={{ color: 'var(--primary)' }} size='lg' /></div>} style={{ height: '100%' }}>
        <Bar
          width={300}
          height={250}
          layout='horizontal'
          margin={{ top: 26, right: 20, bottom: 26, left: 60 }}
          data={Users}
          keys={['value']}
          indexBy='person'
          colors={{ scheme: 'yellow_green' }}
          colorBy='index'
          enableGridX={false}
          enableGridY={false}
          axisBottom={false}
          padding={0.3}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.4]] }}
          isInteractive={false}
          animate
          motionStiffness={170}
          motionDamping={26}
        />
      </Panel>
    )
  } else {
    return (
      <Panel bordered header={<div style={{ display: 'flex', justifyContent: 'space-between' }}>Totals<Icon icon='bar-chart' style={{ color: 'var(--primary)' }} size='lg' /></div>} style={{ height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '200px' }}>
          <Loader />
        </div>
      </Panel>
    )
  }
}

export default BarChart
