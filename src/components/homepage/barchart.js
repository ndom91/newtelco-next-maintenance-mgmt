import React from 'react'
import fetch from 'isomorphic-unfetch'
import useSWR from 'swr'
import Chart from 'react-apexcharts'
import {
  Panel,
  Placeholder
} from 'rsuite'

const options = {
  chart: {
    type: 'area',
    height: 350,
    stacked: false,
    zoom: {
      enabled: true
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
  responsive: [{
    breakpoint: 480,
    options: {
      legend: {
        position: 'bottom',
        offsetX: -10,
        offsetY: 0
      }
    }
  }],
  plotOptions: {
    bar: {
      horizontal: false
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
  title: {
    text: 'Maintenances Completed',
    align: 'left',
    offsetX: 14,
    style: {
      fontFamily: 'Fira Sans',
      fontWeight: 200
    }
  },
  legend: {
    show: false,
    position: 'top',
    horizontalAlign: 'right',
    offsetY: -30
  },
  theme: {
    palette: 'palette4' // upto palette10
  }
}

const NTChart = () => {
  const host = window.location.host
  const protocol = window.location.protocol
  const { data } = useSWR(
    `${protocol}//${host}/api/homepage/barchart`,
    (...args) => fetch(...args).then(res => res.json()),
    { suspense: true, revalidateOnFocus: false }
  )
  const userSeries = []
  const returnSeries = []
  if (data.query) {
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
  }

  return <Chart options={options} series={returnSeries} type='area' width={600} height={320} />
}

const BarChart = () => {
  return (
    <React.Suspense fallback={<Placeholder.Graph active height='320' width='600' />}>
      <Panel header={null} bordered>
        <NTChart />
      </Panel>
    </React.Suspense>
  )
}

export default BarChart
