import './globals.css';

export const metadata = {
  title: 'Ultimate Game Database',
  description: 'Search for games, view rules, create scoresheets, and more!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
