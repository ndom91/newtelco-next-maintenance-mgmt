const FontFaceObserver = require('fontfaceobserver')

const Fonts = () => {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css?family=Lato:300,400,700,900'
  link.rel = 'stylesheet'

  document.head.appendChild(link)

  const Lato = new FontFaceObserver('Lato')

  Lato.load().then(() => {
    document.documentElement.classList.add('Lato')
  })
}

export default Fonts