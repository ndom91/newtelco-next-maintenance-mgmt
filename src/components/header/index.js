import React from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DarkmodeSwitch from '../darkmode'
import algoliasearch from 'algoliasearch'
import Autocomplete from 'algolia-react-autocomplete'
import {
  faAngleRight,
  faClock,
  faEthernet,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons'
import {
  faClock as faClockRegular
} from '@fortawesome/free-regular-svg-icons'

import {
  Header,
  Nav,
  Navbar,
  Icon,
  Badge
} from 'rsuite'

const toCamelCase = (str) => {
  return str.split(' ').map(function (word, index) {
    return ' ' + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }).join('')
}

class MaintHeader extends React.Component {
  constructor (props) {
    super(props)

    this.client = algoliasearch(
      'O7K4XJKBHU',
      '769a2cd0f2b32f30d4dc9ab78a643c0d'
    )
      // TODO: refactor search out of header
    this.indexes = [
      {
        source: this.client.initIndex('maintenance'),
        displayKey: 'name',
        templates: {
          suggestion: (suggestion) => {
            if (suggestion._highlightResult) {
              Object.keys(suggestion._highlightResult).forEach(function (key, index) {
                if (suggestion._highlightResult[key].matchLevel && suggestion._highlightResult[key].matchLevel !== 'none') {
                  suggestion[key] = suggestion._highlightResult[key].value
                }
              })
            }
            const newtelcoCID = suggestion.betroffeneCIDs || ''
            if (suggestion) {
              return (
                <span>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      <b style={{ fontSize: '90%', fontWeight: '900' }}><span dangerouslySetInnerHTML={{ __html: suggestion.id }} /></b> - <span style={{ fontSize: '90%' }} dangerouslySetInnerHTML={{ __html: suggestion.name }} />
                    </span>
                    {suggestion.location
                      ? (
                        <span>
                          <FontAwesomeIcon icon={faMapMarkerAlt} className='search-list-icons' width='0.6em' style={{ color: 'secondary', margin: '3px 5px' }} />
                          <span style={{ fontSize: '70%' }} dangerouslySetInnerHTML={{ __html: toCamelCase(suggestion.location) }} />
                        </span>
                      ) : (
                        null
                      )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '80%' }}>
                    {suggestion.startDateTime
                      ? (
                        <span>
                          <FontAwesomeIcon icon={faClock} className='search-list-icons' width='0.8em' style={{ color: 'secondary', margin: '3px 5px 3px 0px' }} />
                          <span dangerouslySetInnerHTML={{ __html: suggestion.startDateTime.substr(0, suggestion.startDateTime.length - 3) }} />
                        </span>
                      ) : (
                        null
                      )}
                    {suggestion.endDateTime
                      ? (
                        <span>
                          <FontAwesomeIcon icon={faClockRegular} className='search-list-icons' width='0.8em' style={{ color: 'secondary', margin: '6px 3px' }} />
                          <span dangerouslySetInnerHTML={{ __html: suggestion.endDateTime.substr(0, suggestion.endDateTime.length - 3) }} />
                        </span>
                      ) : (
                        null
                      )}
                  </div>
                  {suggestion.derenCID
                    ? (
                      <div style={{ fontSize: '80%' }}>
                        <FontAwesomeIcon icon={faEthernet} className='search-list-icons' width='0.8em' style={{ color: 'secondary', margin: '3px 5px 3px 0px' }} />
                        <span dangerouslySetInnerHTML={{ __html: suggestion.derenCID }} />
                        {suggestion.betroffeneCIDs
                          ? (
                            <>
                              <FontAwesomeIcon icon={faAngleRight} className='search-icon' width='0.5em' style={{ color: 'secondary', margin: '3px 5px' }} />
                              <span dangerouslySetInnerHTML={{ __html: newtelcoCID.substr(0, 20) }} />
                            </>
                          ) : (
                            null
                          )}
                      </div>
                    ) : (
                      null
                    )}
                </span>
              )
            } else {
              return null
            }
          }
        }
      }
    ]

    this.toggleNavbar = this.toggleNavbar.bind(this)
    this.toggle = this.toggle.bind(this)

    this.state = {
      collapseOpen: false,
      selection: null,
      open: false,
      hideResults: true,
      night: false
    }
  }

  addClass = (elements, myClass) => {
    if (!elements) { return }
    if (typeof (elements) === 'string') {
      elements = document.querySelectorAll(elements)
    } else if (elements.tagName) { elements = [elements] }
    for (var i = 0; i < elements.length; i++) {
      if ((' ' + elements[i].className + ' ').indexOf(' ' + myClass + ' ') < 0) {
        elements[i].className += ' ' + myClass
      }
    }
  }

  removeClass = (elements, myClass) => {
    if (!elements) { return }
    if (typeof (elements) === 'string') {
      elements = document.querySelectorAll(elements)
    } else if (elements.tagName) { elements = [elements] }
    var reg = new RegExp('(^| )' + myClass + '($| )', 'g')
    for (var i = 0; i < elements.length; i++) {
      elements[i].className = elements[i].className.replace(reg, ' ')
    }
  }

  toggle () {
    this.setState({
      open: !this.state.open
    })
  }

  toggleNavbar () {
    this.setState({
      ...this.state,
      ...{
        collapseOpen: !this.state.collapseOpen
      }
    })
  }

  toggleSearchBar = () => {
    const input = document.getElementById('aa-search-input')
    const searchBtn = document.getElementById('search-btn')
    searchBtn.classList.toggle('close')
    input.value = ''
    if (input.classList.contains('square')) {
      this.removeClass('.aa-dropdown-menus', 'visible')
    }
    input.classList.toggle('square')
  }

  handleSearchFocus = () => {
    this.addClass('.aa-dropdown-menus', 'visible')
  }

  handleSearchSelection = selection => {
    this.removeClass('.aa-dropdown-menus', 'visible')
    const newLocation = `/maintenance?id=${selection.id}`
    Router.push(newLocation)
  }

  selectSearchInput = () => {
    const input = document.getElementById('aa-search-input')
    input.select()
  }

  onToggleNight = () => {
    this.setState({
      night: !this.state.night
    })
  }

  render () {
    return (
      <Header>
        <Navbar appearance='default'>
          <Navbar.Header>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', marginLeft: '10px', marginRight: '10px' }}>
            <svg version='1.0' xmlns='http://www.w3.org/2000/svg' width='48px' height='48px' viewBox='0 0 1280 1280' preserveAspectRatio='xMidYMid meet'>
              <g id='layer101' fill='#a6a6a6' stroke='none'>
                <path d='M40 625 l0 -345 79 0 c73 0 81 2 98 24 10 14 52 73 93 131 41 58 92 129 113 157 l37 52 0 -183 0 -182 88 3 87 3 3 334 c2 261 -1 336 -10 343 -7 4 -45 8 -85 8 l-72 0 -33 -47 c-18 -27 -36 -52 -40 -58 -14 -17 -152 -208 -173 -240 l-20 -30 -5 185 -5 185 -77 3 -78 3 0 -346z' />
                <path d='M867 964 c-4 -4 -7 -126 -7 -271 l0 -263 -105 0 -105 0 0 -75 0 -75 298 2 297 3 0 70 0 70 -107 3 -108 3 -2 267 -3 267 -75 3 c-42 1 -79 0 -83 -4z' />
              </g>
            </svg>
            </div>
          </Navbar.Header>
          <Navbar.Body>
            <Nav>
              <Nav.Item icon={<Icon icon='home' />}>
                <Link
                  href={{
                    pathname: '/',
                    query: {
                      night: this.props.night
                    }
                  }}
                  as='/'
                  passHref
                >
                  <span>Home</span>
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link
                  href={{
                    pathname: '/inbox',
                    query: {
                      night: this.props.night
                    }
                  }}
                  as='/inbox'
                  passHref
                >
                  <span>
                    <Badge style={{ position: 'absolute', top: '10px', right: '5px', background: '#67B246' }} content={this.props.unread} />
                    Inbox
                  </span>
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link
                  href={{
                    pathname: '/history',
                    query: {
                      night: this.props.night
                    }
                  }}
                  as='/history'
                  passHref
                >
                  <span>History</span>
                </Link>
              </Nav.Item>
              {/* <Nav.Item>
                <Link
                  href={{
                    pathname: '/companies',
                    query: {
                      night: this.props.night
                    }
                  }}
                  as='/history'
                  passHref
                >
                  <span>Companies</span>
                </Link>
              </Nav.Item> */}
            </Nav>
            <Nav pullRight>
              <Nav.Item icon={<Icon icon='cog' />}>
                <Link
                  href={{
                    pathname: '/settings',
                    query: {
                      tab: 'companies',
                      night: this.props.night
                    }
                  }}
                  as='/settings'
                  passHref
                >
                  <span>Settings</span>
                </Link>
              </Nav.Item>
            </Nav>
          </Navbar.Body>
        </Navbar>
      </Header>
    )
  }
}

export default MaintHeader
