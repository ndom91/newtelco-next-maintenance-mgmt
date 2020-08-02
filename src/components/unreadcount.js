import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Store from './store'

const UnreadCount = () => {
  const [faviconEl, setFaviconEl] = useState({})
  const store = Store.useStore()

  const getFavicon = count => {
    const favicon = document.getElementById('favicon')
    if (favicon) {
      const faviconSize = 16

      const canvas = document.createElement('canvas')
      canvas.width = faviconSize
      canvas.height = faviconSize

      const context = canvas.getContext('2d')
      const img = document.createElement('img')
      img.src = favicon.href

      img.onload = () => {
        // Draw Original Favicon as Background
        context.drawImage(img, 0, 0, faviconSize, faviconSize)

        // Draw Notification Circle
        context.beginPath()
        context.arc(
          canvas.width - faviconSize / 3,
          6 + faviconSize / 3,
          faviconSize / 3,
          0,
          2 * Math.PI
        )
        context.fillStyle = '#FF0000'
        context.fill()

        // Draw Notification Number
        context.font = '9px "helvetica", sans-serif'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillStyle = '#FFFFFF'
        context.fillText(
          count,
          canvas.width - faviconSize / 3,
          6 + faviconSize / 3
        )

        // Replace favicon
        favicon.href = canvas.toDataURL('image/png')
        return favicon
      }
    }
  }

  store.on('count').subscribe(async count => {
    if (typeof window !== 'undefined' && count !== 0) {
      const fav = getFavicon(count)
      fav && setFaviconEl(fav)
    }
  })

  return <Head>{`${faviconEl}`}</Head>
}

export default UnreadCount
