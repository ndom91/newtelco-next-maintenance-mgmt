import fetch from 'isomorphic-unfetch'
import Head from 'next/head'

const UnreadCount = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.host
    fetch(`https://api.${host}/inbox/count`, {
      method: 'get'
    })
      .then(resp => resp.json())
      .then(data => {
        if (data !== 'No unread emails') {
          const favicon = document.getElementById('favicon')
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
            context.arc(canvas.width - faviconSize / 4, faviconSize / 4, faviconSize / 4, 0, 2 * Math.PI)
            context.fillStyle = '#FF0000'
            context.fill()

            // Draw Notification Number
            // context.font = '9px "helvetica", sans-serif'
            // context.textAlign = 'center'
            // context.textBaseline = 'middle'
            // context.fillStyle = '#FFFFFF'
            // context.fillText(display, canvas.width - faviconSize / 3, faviconSize / 3)

            // Replace favicon
            favicon.href = canvas.toDataURL('image/png')
            console.log('Helmet')
            return (
              <>
                <Head>
                  <title>{`${favicon}`}</title>
                </Head>
                <div>test</div>
              </>
            )
          }
        }
      })
      .catch(err => console.error(`Error - ${err}`))
  } else {
    console.log('No Helmet')
    return null
  }
}

export default UnreadCount
