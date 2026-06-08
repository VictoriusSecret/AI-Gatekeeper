import './globals.css'

export const metadata = {
  title: 'AI Gatekeeper',
  description: 'Decision-support for business problem evaluation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="app-shell">
        {children}
        <footer className="no-print" style={{
          borderTop: '1px solid #e2e8f0',
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: '#9ca3af',
          letterSpacing: '0.02em',
        }}>
          AI Gatekeeper &nbsp;·&nbsp; Built by Sarah Douglas &nbsp;·&nbsp;
          github.com/VictoriusSecret &nbsp;·&nbsp; linkedin.com/in/sarahbdouglas/
        </footer>
      </body>
    </html>
  )
}
