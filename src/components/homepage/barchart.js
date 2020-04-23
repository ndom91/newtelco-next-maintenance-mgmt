import React from 'react'
import fetch from 'isomorphic-unfetch'
import moment from 'moment-timezone'
import Chart from 'react-apexcharts'

class BarChart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      series: [],
      options: {
        chart: {
          type: 'donut',
          width: 350,
          // zoom: {
          //   enabled: false
          // },
          // toolbar: {
          //   show: false
          // }
        },
        dataLabels: {
          enabled: false
        },
        // tooltip: {
        //   shared: true
        // },
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
        // xaxis: {
        //   axisTicks: {
        //     show: false
        //   },
        //   tooltip: {
        //     enabled: false
        //   },
        //   categories: ['a', 'b', 'c', 'd', 'lol'],
        //   labels: {
        //     style: {
        //       fontSize: '12px'
        //     }
        //   }
        // },
        plotOptions: {
          pie: {
            donut: {
              size: '55%',
              labels: {
                show: true
              }
            },
            total: {
              show: true,
              showAlways: true
            }
          }
        },
        title: {
          text: 'Maintenances Completed',
          align: 'left',
          offsetX: 14
        }
      }
    }
  }

  componentDidMount() {
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
          // console.log(userSeries)
          const barSeries = []
          const barCategories = []
          userSeries.forEach(user => {
            const username = user[0].user
            fetch(`${protocol}//${host}/api/homepage/week?person=${username}`)
              .then(res => res.json())
              .then(peopleData => {
                if (peopleData) {
                  // console.log(peopleData)
                  barCategories.push(username)
                  // barSeries.push({ label: username, value: peopleData.totalCount.maints })
                  barSeries.push(peopleData.totalCount.maints)
                }
              })
              .catch(err => console.error(err))
          })
          // const opts = this.state.options
          // opts.xaxis.categories = barCategories
          this.setState({
            series: barSeries,
            // options: opts,
            loading: false
          })
        }
      })
      .catch(err => console.error(err))
  }

  render() {
    const {
      options,
      series,
      loading
    } = this.state

    console.log(series)
    if (!loading) {
      return <Chart options={options} series={series} type='donut' width={400} />
    } else {
      return <span>Loading...</span>
    }
  }
}

export default BarChart
