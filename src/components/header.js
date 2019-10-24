import React from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DarkmodeSwitch from './darkmode'
import algoliasearch from 'algoliasearch'
import Autocomplete from 'algolia-react-autocomplete'
import 'algolia-react-autocomplete/build/css/index.css'
import {
  faPowerOff,
  faSearch,
  faAngleRight,
  faClock,
  faEthernet
} from '@fortawesome/free-solid-svg-icons'
import {
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Badge,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Collapse
} from 'shards-react'

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
            const newtelcoCID = suggestion.betroffeneCIDs || ''
            return (
              <span>
                <div> <b style={{ fontWeight: '900' }}>{suggestion.id}</b> - {suggestion.name}</div>
                <div style={{ fontSize: '80%' }}>
                  <FontAwesomeIcon icon={faClock} className='search-list-icons' width='0.8em' style={{ color: 'secondary', margin: '3px 5px' }} />{suggestion.startDateTime} - {suggestion.endDateTime}
                </div>
                <div style={{ fontSize: '80%' }}>
                  <FontAwesomeIcon icon={faEthernet} className='search-list-icons' width='0.8em' style={{ color: 'secondary', margin: '3px 5px' }} />
                  {suggestion.derenCID}
                  {suggestion.betroffeneCIDs
                    ? (
                      <>
                        <FontAwesomeIcon icon={faAngleRight} className='search-icon' width='0.5em' style={{ color: 'secondary', margin: '3px 5px' }} />
                        <span>{newtelcoCID.substr(0, 20)}</span>
                      </>
                    ) : (
                      null
                    )}
                </div>
              </span>
            )
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

  handleSearchFocus = () => {
    this.removeClass('.nav-search', 'blur')
    this.addClass('.nav-search', 'delay')
    this.setState({
      hideResults: false
    })
  }

  handleSearchBlur = () => {
    setTimeout(() => {
      this.addClass('.nav-search', 'blur')
      this.removeClass('.nav-search', 'delay')
      this.setState({
        hideResults: true
      })
    }, 1000)
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

          <svg version='1.0' xmlns='http://www.w3.org/2000/svg' width='48px' height='48px' viewBox='0 0 1280 1280' preserveAspectRatio='xMidYMid meet'>
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
            <InputGroup id='search-group' style={{ width: '100%', alignItems: 'center' }} size='sm' seamless>
              <InputGroupAddon type='prepend'>
                <InputGroupText className='input-group-search'>
                  <FontAwesomeIcon icon={faSearch} className='search-icon' width='1em' style={{ color: 'secondary' }} />
                </InputGroupText>
              </InputGroupAddon>
              <Autocomplete
                indexes={this.indexes}
                onSelectionChange={this.props.handleSearchSelection}
              >
                <input
                  key='input'
                  type='search'
                  id='aa-search-input'
                  className='aa-input-search nav-search blur'
                  placeholder='Search...'
                  name='search'
                  autoComplete='off'
                  onFocus={this.handleSearchFocus}
                  onBlur={this.handleSearchBlur}
                />
                <svg className='aa-input-icon' viewBox='654 -372 1664 1664'>
                  <path d='M1806,332c0-123.3-43.8-228.8-131.5-316.5C1586.8-72.2,1481.3-116,1358-116s-228.8,43.8-316.5,131.5  C953.8,103.2,910,208.7,910,332s43.8,228.8,131.5,316.5C1129.2,736.2,1234.7,780,1358,780s228.8-43.8,316.5-131.5  C1762.2,560.8,1806,455.3,1806,332z M2318,1164c0,34.7-12.7,64.7-38,90s-55.3,38-90,38c-36,0-66-12.7-90-38l-343-342  c-119.3,82.7-252.3,124-399,124c-95.3,0-186.5-18.5-273.5-55.5s-162-87-225-150s-113-138-150-225S654,427.3,654,332  s18.5-186.5,55.5-273.5s87-162,150-225s138-113,225-150S1262.7-372,1358-372s186.5,18.5,273.5,55.5s162,87,225,150s113,138,150,225  S2062,236.7,2062,332c0,146.7-41.3,279.7-124,399l343,343C2305.7,1098.7,2318,1128.7,2318,1164z' />
                </svg>
              </Autocomplete>
              <NavItem>
                <NavLink>
                  <form id='signout' method='post' action='/auth/signout' onSubmit={this.handleSignOutSubmit}>
                    <input name='_csrf' type='hidden' value={this.props.session.csrfToken} />
                    <div className='logout-btn-wrapper'>
                      <button className='logout-btn' type='submit'>
                        <FontAwesomeIcon width='1.125em' className='menu-icon logout' icon={faPowerOff} />
                      </button>
                    </div>
                  </form>
                </NavLink>
              </NavItem>
              <NavItem>
                <DarkmodeSwitch value={this.props.night} onChange={this.props.toggleNight} />
              </NavItem>
            </InputGroup>
          </Nav>
        </Collapse>
        {/* html {
            background-color: #e6e4e8;
          } */}
        <style jsx>{`
            @media only screen and (max-width: 500px) {
              :global(#search-group) {
                margin: 10px 0;
              }
              :global(.logout-btn) {
                margin-left: 10px;
              }
            }
          :global(.search-list-icons) {
            margin: 0px;
            margin-right: 3px;
          }
          :global(.algolia-react-autocomplete) {
            width: auto;
          }
          :global(.aa-dropdown-menus) {
            visibility: ${this.state.hideResults ? 'hidden' : 'visible'};
          }
          :global(.aa-dropdown-menu) {
            margin-top: 0px;
            position: absolute;
            left: 0px;
            top: 45px;
            border-radius: 5px 5px 0 0;
            width: 310px;
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
            background: #ececec;
            z-index: 100;
            max-height: 500px;
            overflow-y: scroll;
            box-shadow: 8px 0 8px -8px, 0 8px 8px -8px, -8px 0 8px -8px;
            box-shadow: 0px 11px 28px 4px rgba(50, 50, 50, 0.95);
            box-shadow: 0px 10px 35px 2px rgba(0, 0, 0, 0.75);
            top: 0px;
            border-radius: 5px;
          }
          :global(.aa-suggestions-category) {
            visibility: hidden;
          }
          :global(.aa-suggestions-results) {
            color: #67B246;
          }
          :global(.aa-dropdown-menu > div) {
            display: block;
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
          :global(.nav-link) {
            text-decoration: none !important;
          }
          :global(.input-group-prepend) {
            pointer-events: none !important;
          }
          :global(.input-group-search) {
            pointer-events: none !important;
            font-size: 18px !important;
          }
          :global(.search-icon) {
            pointer-events: none !important;
          }
          :global(.nav-search::placeholder) {
            color: transparent;
          }
          :global(.delay) {
            transition-delay: 1s !important;
          }
          :global(.nav-search) {
            transition: width 0.3s 0s ease;
          }
          :global(.nav-search.blur) {
            height: 42px;
            outline: none;
            border-radius: 7px;
            color: rgba(0,0,0,0);
            padding-left: 0px !important;
            padding-right: 0px !important;
            width: 45px !important;
            overflow: hidden;
            background: transparent;
            border: 0px;

            transition: width 1s 1s ease;
            transition-delay: 1s !important;

            -webkit-backface-visibility: hidden;
          }
          :global(.nav-search:hover) {
            transition-delay: 0s !important;
            cursor: pointer;
          }
          :global(.nav-search:focus) {
            padding-left: 40px !important;
            width: 310px !important;
            background-color: var(--primary-bg);
            color: var(--font-color);
            border: 2px solid #67B246;
            cursor: text;
            box-shadow: 0 0 5px 2px rgba(103, 178, 70, 0.54);
            transition-delay: 0s !important;
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
            margin-bottom: 6px;
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
