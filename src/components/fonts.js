const FontFaceObserver = require('fontfaceobserver')

const Fonts = () => {
  const link = document.createElement('link')
  link.href =
    'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@200;400&family=Chivo:wght@300;400;700&display=swap'
  link.rel = 'stylesheet'

  document.head.appendChild(link)

  const Fira = new FontFaceObserver('Fira Sans')
  const Chivo = new FontFaceObserver('Chivo')

  Fira.load().then(() => {
    document.documentElement.classList.add('FiraSans')
  })
  Chivo.load().then(() => {
    document.documentElement.classList.add('Chivo')
  })
}

export default Fonts
