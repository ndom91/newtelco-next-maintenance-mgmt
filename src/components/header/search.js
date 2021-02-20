import React, { useState, useRef, useEffect } from 'react'
import Router from 'next/router'
import algoliasearch from 'algoliasearch'
import Autocomplete from 'algolia-react-autocomplete'
import './search.css'
import { DOMHelper } from 'rsuite'
const { addClass, removeClass } = DOMHelper

const SearchInput = props => {
  const searchInput = useRef()
  const toCamelCase = str => {
    return str
      .split(' ')
      .map(function (word, index) {
        return ' ' + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })
      .join('')
  }

  useEffect(() => {
    window.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleClickOutside = event => {
    if (searchInput && !searchInput.current.contains(event.target)) {
      addClass(document.querySelector('.aa-dropdown-menus'), 'hide-dropdown')
      removeClass(document.querySelector('.aa-dropdown-menus'), 'show-dropdown')
      addClass(document.getElementById('aa-search-input'), 'search-small')
      removeClass(document.getElementById('aa-search-input'), 'search-large')
    }
  }

  const restoreVisibility = () => {
    removeClass(document.querySelector('.aa-dropdown-menus'), 'hide-dropdown')
    addClass(document.querySelector('.aa-dropdown-menus'), 'show-dropdown')
    removeClass(document.getElementById('aa-search-input'), 'search-small')
    addClass(document.getElementById('aa-search-input'), 'search-large')
  }

  const algoliaClient = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APPKEY,
    process.env.NEXT_PUBLIC_ALGOLIA_APIKEY
  )

  const indexes = [
    {
      source: algoliaClient.initIndex('maintenance'),
      displayKey: 'name',
      templates: {
        suggestion: suggestion => {
          if (suggestion._highlightResult) {
            Object.keys(suggestion._highlightResult).forEach(function (
              key,
              index
            ) {
              if (
                suggestion._highlightResult[key].matchLevel &&
                suggestion._highlightResult[key].matchLevel !== 'none'
              ) {
                suggestion[key] = suggestion._highlightResult[key].value
              }
            })
          }
          const newtelcoCID = suggestion.betroffeneCIDs || ''
          return (
            <span>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  <b style={{ fontSize: '90%', fontWeight: '900' }}>
                    NT-
                    <span dangerouslySetInnerHTML={{ __html: suggestion.id }} />
                  </b>{' '}
                  -{' '}
                  <span
                    style={{ fontSize: '90%' }}
                    dangerouslySetInnerHTML={{ __html: suggestion.name }}
                  />
                </span>
                {suggestion.location && (
                  <span>
                    <svg
                      fill='none'
                      width='1.1em'
                      style={{ marginBottom: '-3px', marginRight: '-2px' }}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'></path>
                      <path d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'></path>
                    </svg>
                    <span
                      style={{ fontSize: '80%' }}
                      dangerouslySetInnerHTML={{
                        __html: toCamelCase(suggestion.location),
                      }}
                    />
                  </span>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '80%',
                }}
              >
                {suggestion.startDateTime && (
                  <span>
                    <svg
                      fill='none'
                      width='1.3em'
                      style={{ marginBottom: '-3px', marginRight: '2px' }}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'></path>
                    </svg>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: suggestion.startDateTime.substr(
                          0,
                          suggestion.startDateTime.length - 3
                        ),
                      }}
                    />
                  </span>
                )}
                {suggestion.endDateTime && (
                  <span>
                    <svg
                      fill='none'
                      width='1.3em'
                      style={{ marginBottom: '-3px', marginRight: '2px' }}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'></path>
                    </svg>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: suggestion.endDateTime.substr(
                          0,
                          suggestion.endDateTime.length - 3
                        ),
                      }}
                    />
                  </span>
                )}
              </div>
              {suggestion.derenCID && (
                <div
                  style={{
                    fontSize: '80%',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <svg
                    fill='none'
                    width='1.3em'
                    style={{ marginRight: '2px' }}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path>
                  </svg>
                  <span
                    dangerouslySetInnerHTML={{ __html: suggestion.derenCID }}
                  />
                  {suggestion.betroffeneCIDs && (
                    <>
                      <svg
                        fill='none'
                        width='0.5em'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path d='M9 5l7 7-7 7'></path>
                      </svg>
                      <span
                        style={{
                          textOverflow: 'ellipsis',
                          maxWidth: `calc( 300px - ${suggestion.derenCID.length}px * 4 )`,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          marginBottom: '-5px',
                          display: 'inline-block',
                        }}
                        dangerouslySetInnerHTML={{ __html: newtelcoCID }}
                      />
                    </>
                  )}
                </div>
              )}
            </span>
          )
        },
      },
    },
  ]

  const handleSearchSelection = selection => {
    const newLocation = `/maintenance?id=${selection.id
      .toString()
      .match(/\d+/g)
      .join('')}`
    Router.push(newLocation)
  }

  return (
    <div ref={searchInput} style={{ width: '400px' }}>
      <Autocomplete indexes={indexes} onSelectionChange={handleSearchSelection}>
        <input
          key='input'
          type='search'
          id='aa-search-input'
          className='rs-input'
          placeholder='Search'
          name='search'
          autoComplete='off'
          onFocus={restoreVisibility}
        />
      </Autocomplete>
    </div>
  )
}

export default SearchInput
