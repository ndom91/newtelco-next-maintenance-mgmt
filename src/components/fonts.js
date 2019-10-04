const FontFaceObserver = require('fontfaceobserver')

const Fonts = () => {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css?family=Poppins:100,300,Lato:300,400,700,900'
  link.rel = 'stylesheet'

  document.head.appendChild(link)

  const Lato = new FontFaceObserver('Lato')
  const Poppins = new FontFaceObserver('Poppins')

  Poppins.load().then(() => {
    document.documentElement.classList.add('Poppins')
  })
  Lato.load().then(() => {
    document.documentElement.classList.add('Lato')
  })
}

export default Fonts
