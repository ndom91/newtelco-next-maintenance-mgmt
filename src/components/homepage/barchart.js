import React from 'react'
import fetch from 'isomorphic-unfetch'
import moment from 'moment-timezone'
import Chart from 'react-apexcharts'

class BarChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      series: [],
      options: {
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
          offsetX: 14
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          offsetY: -30
        },
        theme: {
          palette: 'palette4' // upto palette10
        }
      }
    }
  }

  componentDidMount () {
    const host = window.location.host
    const protocol = window.location.protocol
    fetch(`${protocol}//${host}/api/homepage/barchart`)
      .then(res => res.json())
      .then(data => {
        if (data.query) {
          const userSeries = []
          const series = []
          const users = Array.from(new Set(data.query.map(obj => JSON.stringify(({ user: obj.user }))))).map(JSON.parse)

          users.forEach(user => {
            const userData = data.query
              .filter(x => x.user === user.user)
              .sort((a, b) => {
                // if (a.year > b.year) return -1
                // else if (a.year < b.year) return 1
                // else {
                //   if (a.month > b.month) return -1
                //   else if (a.month < b.month) return 1
                //   else return 0
                // }
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
            series.push({ data: data, name: user[0].user })
          })
          this.setState({
            series: series
          })
        }
      })
      .catch(err => console.error(err))
  }

  render () {
    const {
      options,
      series
    } = this.state

    return <Chart options={options} series={series} type='area' width={600} height={320} />
  }
}

export default BarChart
