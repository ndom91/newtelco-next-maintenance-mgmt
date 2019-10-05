const FontFaceObserver = require('fontfaceobserver')

const Fonts = () => {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css?family=Roboto:500,700,Poppins:100,300'
  link.rel = 'stylesheet'

  document.head.appendChild(link)

  const Roboto = new FontFaceObserver('Roboto')
  const Poppins = new FontFaceObserver('Poppins')

  Poppins.load().then(() => {
    document.documentElement.classList.add('Poppins')
  })
  Roboto.load().then(() => {
    document.documentElement.classList.add('Roboto')
  })
}

export default Fonts
