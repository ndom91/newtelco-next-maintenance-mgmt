import React from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DarkmodeSwitch from './darkmode'
import algoliasearch from 'algoliasearch'
import Autocomplete from 'algolia-react-autocomplete'
import 'algolia-react-autocomplete/build/css/index.css'
import {
  faPowerOff,
  faAngleRight,
  faClock,
  faEthernet,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons'
import {
  faClock as faClockRegular
} from '@fortawesome/free-regular-svg-icons'
import {
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Badge,
  Button,
  InputGroup,
  Collapse
} from 'shards-react'

const toCamelCase = (str) => {
  return str.split(' ').map(function (word, index) {
    return ' ' + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }).join('')
}

class Header extends React.Component {
  constructor (props) {
    super(props)

    this.client = algoliasearch(
      'O7K4XJKBHU',
      '769a2cd0f2b32f30d4dc9ab78a643c0d'
    )

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
      <Navbar type='dark' theme={this.props.night ? 'dark' : 'secondary'} expand='md'>
        <NavbarBrand href='/'>

          <svg version='1.0' className='nt-header-logo' xmlns='http://www.w3.org/2000/svg' width='48px' height='48px' viewBox='0 0 1280 1280' preserveAspectRatio='xMidYMid meet'>
            <g id='layer101' fill='var(--white)' stroke='none'>
              <path d='M40 625 l0 -345 79 0 c73 0 81 2 98 24 10 14 52 73 93 131 41 58 92 129 113 157 l37 52 0 -183 0 -182 88 3 87 3 3 334 c2 261 -1 336 -10 343 -7 4 -45 8 -85 8 l-72 0 -33 -47 c-18 -27 -36 -52 -40 -58 -14 -17 -152 -208 -173 -240 l-20 -30 -5 185 -5 185 -77 3 -78 3 0 -346z' />
              <path d='M867 964 c-4 -4 -7 -126 -7 -271 l0 -263 -105 0 -105 0 0 -75 0 -75 298 2 297 3 0 70 0 70 -107 3 -108 3 -2 267 -3 267 -75 3 c-42 1 -79 0 -83 -4z' />
            </g>
          </svg>
        </NavbarBrand>
        <NavbarToggler onClick={this.toggleNavbar} />

        <Collapse open={this.state.collapseOpen} navbar>

          <Nav navbar>
            <NavItem>
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
                <NavLink>
                  <span className='menu-label'>Home</span>
                </NavLink>
              </Link>
            </NavItem>
            <NavItem style={{ position: 'relative' }}>
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
                <NavLink>
                  <Badge className='unread-badge' pill>
                    {this.props.unread}
                  </Badge>
                  <span style={{ position: 'relative', zIndex: '2' }} className='menu-label'>Inbox</span>
                </NavLink>
              </Link>
            </NavItem>
            <NavItem>
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
                <NavLink>
                  <span className='menu-label'>History</span>
                </NavLink>
              </Link>
            </NavItem>
            <NavItem>
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
                <NavLink>
                  <span className='menu-label'>Settings</span>
                </NavLink>
              </Link>
            </NavItem>
          </Nav>
          <Nav style={{ justifyContent: 'flex-end' }} navbar className='ml-auto'>
            <div>
              <InputGroup id='search-group' size='sm' seamless>
                <Autocomplete
                  indexes={this.indexes}
                  onSelectionChange={this.handleSearchSelection}
                >
                  <input
                    key='input'
                    type='search'
                    id='aa-search-input'
                    className='aa-input-search nav-search'
                    placeholder='Search...'
                    name='search'
                    autoComplete='off'
                    onClick={this.selectSearchInput}
                    onFocus={this.handleSearchFocus}
                    onBlur={this.handleSearchBlur}
                  />
                  <svg className='aa-input-icon' viewBox='654 -372 1664 1664'>
                    <path d='M1806,332c0-123.3-43.8-228.8-131.5-316.5C1586.8-72.2,1481.3-116,1358-116s-228.8,43.8-316.5,131.5  C953.8,103.2,910,208.7,910,332s43.8,228.8,131.5,316.5C1129.2,736.2,1234.7,780,1358,780s228.8-43.8,316.5-131.5  C1762.2,560.8,1806,455.3,1806,332z M2318,1164c0,34.7-12.7,64.7-38,90s-55.3,38-90,38c-36,0-66-12.7-90-38l-343-342  c-119.3,82.7-252.3,124-399,124c-95.3,0-186.5-18.5-273.5-55.5s-162-87-225-150s-113-138-150-225S654,427.3,654,332  s18.5-186.5,55.5-273.5s87-162,150-225s138-113,225-150S1262.7-372,1358-372s186.5,18.5,273.5,55.5s162,87,225,150s113,138,150,225  S2062,236.7,2062,332c0,146.7-41.3,279.7-124,399l343,343C2305.7,1098.7,2318,1128.7,2318,1164z' />
                  </svg>
                </Autocomplete>
                <Button id='search-btn' className='search-btn' outline onClick={this.toggleSearchBar} />
              </InputGroup>
              <InputGroup style={{ zIndex: '10000' }}>
                <NavItem style={{ display: 'flex', alignItems: 'center' }}>
                  <DarkmodeSwitch value={this.props.night} onChange={this.props.toggleNight} />
                </NavItem>
              </InputGroup>
            </div>
          </Nav>
        </Collapse>
        <style jsx>{`
            @media only screen and (max-width: 500px) {
              :global(#search-group) {
                margin: 10px 0;
                display: flex;
                justify-content: space-between;
              }
              :global(.logout-btn) {
              }
              :global(.logout-btn-wrapper) {
                display: flex;
                justify-content: flex-end;
              }
              :global(#signout button) {
                margin-bottom: 4px;
              }
              :global(#signout) {
                position: absolute;
                top: 0;
                right: 0;
                text-align: center;
                border: 2px solid #67B246;
                padding: 4px;
                width: 42px;
                border-radius: 10px;
              }
              :global(#aa-search-input) {
                padding-left: 40px !important;
                width: 110% !important;
                background-color: var(--primary-bg);
                color: var(--font-color);
                border: 2px solid #67B246;
                cursor: text;
                transition-delay: 0s !important;
              }
              :global(.input-group-text) {
                max-height: 60px;
              }
              :global(.darkmode-wrapper) {
                position: absolute;
                top: -60px;
                right: -5px;
              }
              :global(.nav.nav-pills) {
                flex-direction: column;
                align-items: flex-end;
              }
              :global(.unread-badge) {
                padding: 11px;
                font-size: 135%;
              }
            }
            :global(#search-group) {
              z-index: 9999;
              justify-content: space-between;
              position: absolute;
              height: 50px;
              width: 100px;
              margin-left: 170px;
              top: 78%;
              right: 0rem;
              transform: translate(-50%, -50%);
            }
            :global(.nav-search) {
              box-sizing: border-box;
              width: 25px;
              height: 25px;
              padding: 0px;
              border: 4px solid #ffffff;
              border-radius: 50%;
              background: none;
              color: #fff;
              font-size: 16px;
              font-weight: 400;
              font-family: Roboto;
              outline: 0;
              transition: width 0.4s ease-in-out, border-radius 0.8s ease-in-out,
                padding 0.2s;
              transition-delay: 0.4s;
              transform: translate(-100%, -30%);
            }

            :global(.search-btn) {
              background: none;
              position: absolute;
              top: 0px;
              left: 0;
              height: 50px;
              width: 50px;
              padding: 0;
              border-radius: 100%;
              outline: 0;
              border: 0;
              color: inherit;
              cursor: pointer;
              transition: 0.2s ease-in-out;
              transform: translate(-100%, -50%);
            }

            :global(.search-btn:before) {
              content: "";
              position: absolute;
              width: 14px;
              height: 4px;
              background-color: #fff;
              transform: rotate(45deg);
              margin-top: 14px;
              margin-left: 17px;
              transition: 0.2s ease-in-out;
            }

            :global(.close) {
              transition: 0.4s ease-in-out;
              transition-delay: 0.4s;
            }

            :global(.close:before) {
              content: "";
              position: absolute;
              width: 27px;
              height: 4px;
              margin-top: 6px;
              margin-left: -13px;
              background-color: #fff;
              transform: rotate(45deg);
              transition: 0.2s ease-in-out;
            }

            :global(.close:after) {
              content: "";
              position: absolute;
              width: 27px;
              height: 4px;
              background-color: #fff;
              margin-top: 6px;
              margin-left: -13px;
              cursor: pointer;
              transform: rotate(-45deg);
            }

            :global(.square) {
              box-sizing: border-box;
              padding: 0 40px 0 10px;
              width: 300px;
              height: 50px;
              border: 4px solid #ffffff;
              border-radius: 10px;
              background: none;
              color: #fff;
              font-family: Roboto;
              font-size: 16px;
              font-weight: 400;
              outline: 0;
              transition: width 0.4s ease-in-out, border-radius 0.1s ease-in-out,
                padding 0.2s;
              transition-delay: 0.4s, 0s, 0.4s;
              transform: translate(-100%, -35%);
            }
            :global(.visible) {
              visibility: visible !important;
              display: inline-block !important;
            }
          :global(.nt-header-logo) {
            transition: all 350ms ease-in-out;
          }
          :global(.nt-header-logo:hover) {
            filter: drop-shadow( 0 0 10px rgba(103, 178, 70, 1));
          }
          :global(.search-list-icons) {
            margin: 0px;
            margin-right: 3px;
          }
          :global(.search-btn, .search-btn:hover, .search-btn:active, .search-btn:focus) {
            border: none;
            font-size: 1.1rem;
            box-shadow: none !important;
            color: var(--white);
            background-color: transparent !important;
          }
          :global(.algolia-react-autocomplete) {
            width: auto;
          }
          :global(.aa-dropdown-menus) {
            visibility: ${this.state.hideResults ? 'hidden' : 'visible'};
            z-index: 99999;
          }
          :global(.aa-dropdown-menu) {
            margin-top: 0px;
            display: block;
            left: 0px;
            top: 45px;
            border-radius: 5px 5px 0 0;
            overflow: hidden;
            height: auto;
            max-height: 500px;
            width: 310px;
            transition: max-width 1s;
          }
          :global(.aa-suggestion:hover) {
            box-shadow: 0 0 10px 1px #67B246;
            color: #5a6169;
          }
          :global(.aa-suggestion) {
            margin-top: 7px;
            margin-bottom: 7px;
          }
          :global(.aa-suggestions) {
            position: absolute;
            display: block;
            height: fit-content;
            background: #ececec;
            z-index: 100;
            max-height: 500px;
            overflow-y: scroll;
            box-shadow: 8px 0 8px -8px, 0 8px 8px -8px, -8px 0 8px -8px;
            box-shadow: 0px 11px 28px 4px rgba(50, 50, 50, 0.95);
            box-shadow: 0px 10px 35px 2px rgba(0, 0, 0, 0.75);
            top: 32px;
            right: 317px;
            border-radius: 0 0 5px 5px;
          }
          :global(.aa-suggestions-category) {
            visibility: hidden;
            display: none !important;
          }
          :global(.aa-suggestions-results) {
            color: #67B246;
          }
          :global(.aa-dropdown-menu > div) {
            display: block;
            width: 92%;
            vertical-align: top;
          }
          :global(.aa-suggestion em) {
            color: #67B246;
          }
          :global(.unread-badge) {
            position: absolute;
            top: -2px;
            right: 2px;
            z-index: 1;
            color: var(--unread-color);
            background-color: var(--third-bg);
            opacity: 0.5;
          }
          :global(.input-group-search) {
            font-size: 18px !important;
          }
          :global(.search-icon) {
            pointer-events: none !important;
          }
          :global(.nav-search::placeholder) {
            color: transparent;
          }
          :global(.nav-search:hover) {
            cursor: pointer;
          }
          .menu-label {
            font-family: Poppins, Helvetica;
            font-weight: 300;
            cursor: pointer;
          }
          #signout {
            display: inline-block;
          }
          .lagout-btn-wrapper {
            padding: 5px;
            border: 1px solid #B22222;
            border-radius: 5px;
          }
          .logout-btn {
            cursor: pointer;
            background: none;
            border: none;
            color: var(--white);
            outline: none;
            opacity: 0.5;
            transition: all 350ms ease-in-out;
          }
          .logout-btn:hover,
          .logout-btn:focus {
            opacity: 0.8;
            transition: all 350ms ease-in-out;
          }
          .logout {
          }
        `}
        </style>
      </Navbar>
    )
  }
}

export default Header
