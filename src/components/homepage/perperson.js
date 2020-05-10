import React from 'react'
import fetch from 'isomorphic-unfetch'
import { Bar } from '@nivo/bar'
import useSWR from 'swr'
import { Panel, Loader, Icon } from 'rsuite'

const PerPerson = () => {
  const { data } = useSWR(
    '/api/homepage/perperson',
    (...args) => fetch(...args).then(res => res.json()),
    { suspense: false, revalidateOnFocus: false }
  )

  if (data) {
    return (
      <Panel bordered header={<div style={{ display: 'flex', justifyContent: 'space-between' }}>Totals<Icon icon='bar-chart' style={{ color: 'var(--primary)' }} size='lg' /></div>} style={{ height: '100%' }}>
        <Bar
          width={400}
          height={250}
          layout='horizontal'
          margin={{ top: 26, right: 120, bottom: 26, left: 60 }}
          data={data.query}
          keys={['value']}
          indexBy='person'
          colors={{ scheme: 'nivo' }}
          enableGridX={false}
          enableGridY={false}
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
      <div style={{ height: '342px', width: '449px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader />
      </div>
    )
  }
}

export default PerPerson
