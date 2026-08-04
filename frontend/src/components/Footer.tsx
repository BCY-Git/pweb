import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__text">
          © {new Date().getFullYear()}{' '}
          <span className="gradient-text">Martin</span> · Built with{' '}
          <a href="https://nestjs.com/" target="_blank" rel="noopener noreferrer">
            NestJS
          </a>{' '}
          +{' '}
          <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
            React
          </a>
        </p>
        <p className="footer__sub mono">designed & built with care</p>
      </div>
    </footer>
  )
}
