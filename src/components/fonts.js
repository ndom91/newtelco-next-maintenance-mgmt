const FontFaceObserver = require('fontfaceobserver')

const Fonts = () => {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css?family=Oswald:500,700,Poppins:100,300'
  link.rel = 'stylesheet'

  document.head.appendChild(link)

  const Oswald = new FontFaceObserver('Oswald')
  const Poppins = new FontFaceObserver('Poppins')

  Poppins.load().then(() => {
    document.documentElement.classList.add('Poppins')
  })
  Oswald.load().then(() => {
    document.documentElement.classList.add('Oswald')
  })
}

export default Fonts
