import './globals.css'

export const metadata = {
  title: 'AI Gatekeeper',
  description: 'Decision-support for business problem evaluation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="app-shell">{children}</body>
    </html>
  )
}
