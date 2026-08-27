import './Footer.css'
import type { Profile } from '../types'

interface FooterProps {
  profile: Profile | null
}

export function Footer({ profile }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__text">
          © {new Date().getFullYear()}{' '}
          <span className="gradient-text">{profile?.name ?? '鲍传宇'}</span> · Built with{' '}
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
