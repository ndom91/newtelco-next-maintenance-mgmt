import React from 'react'
import useSWR from 'swr'
import Chart from 'react-apexcharts'
import {
  Panel,
  Icon,
  Loader
} from 'rsuite'

const options = {
  chart: {
    type: 'area',
    height: 250,
    stacked: false,
    zoom: {
      enabled: false
    },
    toolbar: {
      show: false
    }
  },
  dataLabels: {
    enabled: false
  },
  markers: {
    size: 0
  },
  stroke: {
    curve: 'smooth'
  },
  tooltip: {
    shared: true
  },
  grid: {
    show: false
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 90, 100]
    }
  },
  yaxis: {
    show: false
  },
  xaxis: {
    type: 'datetime',
    axisTicks: {
      show: false
    },
    tooltip: {
      enabled: false
    }
  },
  legend: {
    show: false
  },
  theme: {
    palette: 'palette4' // upto palette10
  }
}

const AreaChart = () => {
  const { data } = useSWR(
    '/api/homepage/barchart',
    (...args) => fetch(...args).then(res => res.json()),
    { suspense: false, revalidateOnFocus: false }
  )

  if (data) {
    const userSeries = []
    const returnSeries = []
    const users = Array.from(new Set(data.query.map(obj => JSON.stringify(({ user: obj.user }))))).map(JSON.parse)
    users.forEach(user => {
      const userData = data.query
        .filter(x => x.user === user.user)
        .sort((a, b) => {
          return (a.year > b.year)
            ? -1
            : (a.year < b.year)
              ? 1
              : (a.week > b.week)
                ? -1
                : (a.week < b.week)
                  ? 1
                  : 0
        })
      userSeries.push(userData)
    })
    userSeries.forEach(user => {
      const data = user.map(user => [user.date, user.count])
      returnSeries.push({ data: data, name: user[0].user })
    })

    return (
      <Panel bordered header={<div style={{ display: 'flex', justifyContent: 'space-between' }}>Completed<Icon icon='tasks' style={{ color: 'var(--primary)' }} size='lg' /></div>} style={{ height: '100%' }}>
        <Chart options={options} series={returnSeries} type='area' width={400} height={220} />
      </Panel>
    )
  } else {
    return (
      <Panel bordered header={<div style={{ display: 'flex', justifyContent: 'space-between' }}>Completed<Icon icon='bar-chart' style={{ color: 'var(--primary)' }} size='lg' /></div>} style={{ height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '200px' }}>
          <Loader />
        </div>
      </Panel>
    )
  }
}

export default AreaChart
