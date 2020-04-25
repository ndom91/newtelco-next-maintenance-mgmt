import React from 'react'
import Router from 'next/router'
import algoliasearch from 'algoliasearch'
import Autocomplete from 'algolia-react-autocomplete'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './search.css'
import {
  faAngleRight,
  faClock,
  faEthernet,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons'
import {
  faClock as faClockRegular
} from '@fortawesome/free-regular-svg-icons'

const SearchInput = props => {
  const toCamelCase = (str) => {
    return str.split(' ').map(function (word, index) {
      return ' ' + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }).join('')
  }

  const algoliaClient = algoliasearch(
    'O7K4XJKBHU',
    '769a2cd0f2b32f30d4dc9ab78a643c0d'
  )

  const indexes = [
    {
      source: algoliaClient.initIndex('maintenance'),
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
                        <FontAwesomeIcon icon={faMapMarkerAlt} className='search-list-icons' width='0.6em' style={{ color: 'secondary', margin: '0px 5px' }} />
                        <span style={{ fontSize: '80%' }} dangerouslySetInnerHTML={{ __html: toCamelCase(suggestion.location) }} />
                      </span>
                    ) : (
                      null
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '80%' }}>
                  {suggestion.startDateTime
                    ? (
                      <span>
                        <FontAwesomeIcon icon={faClock} className='search-list-icons' width='0.8em' style={{ color: 'secondary', margin: '-2px 5px 0px 0px' }} />
                        <span dangerouslySetInnerHTML={{ __html: suggestion.startDateTime.substr(0, suggestion.startDateTime.length - 3) }} />
                      </span>
                    ) : (
                      null
                    )}
                  {suggestion.endDateTime
                    ? (
                      <span>
                        <FontAwesomeIcon icon={faClockRegular} className='search-list-icons' width='0.8em' style={{ color: 'secondary', margin: '-2px 3px 0px 0px' }} />
                        <span dangerouslySetInnerHTML={{ __html: suggestion.endDateTime.substr(0, suggestion.endDateTime.length - 3) }} />
                      </span>
                    ) : (
                      null
                    )}
                </div>
                {suggestion.derenCID
                  ? (
                    <div style={{ fontSize: '80%', display: 'flex', alignItems: 'flex-start' }}>
                      <FontAwesomeIcon icon={faEthernet} className='search-list-icons' width='0.8em' style={{ color: 'secondary', margin: '3px 5px 0px 0px' }} />
                      <span dangerouslySetInnerHTML={{ __html: suggestion.derenCID }} />
                      {suggestion.betroffeneCIDs
                        ? (
                          <>
                            <FontAwesomeIcon icon={faAngleRight} className='search-icon' width='0.5em' style={{ color: 'secondary', margin: '2px 5px' }} />
                            <span style={{ textOverflow: 'ellipsis', maxWidth: `calc( 300px - ${suggestion.derenCID.length}px * 4 )`, overflow: 'hidden', whiteSpace: 'nowrap', marginBottom: '-5px', display: 'inline-block' }} dangerouslySetInnerHTML={{ __html: newtelcoCID }} />
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

  const handleSearchSelection = selection => {
    const newLocation = `/maintenance?id=${selection.id}`
    Router.push(newLocation)
  }

  return (
    <Autocomplete
      indexes={indexes}
      onSelectionChange={handleSearchSelection}
    >
      <input
        key='input'
        type='search'
        id='aa-search-input'
        className='rs-input'
        placeholder='Search'
        name='search'
        autoComplete='off'
        // onClick={this.selectSearchInput}
        // onFocus={this.handleSearchFocus}
        // onBlur={this.handleSearchBlur}
      />
    </Autocomplete>
  )
}

export default SearchInput
