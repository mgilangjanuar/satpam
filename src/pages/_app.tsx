import Shell, { MenuItem, ShellContext } from '@/components/shell'
import { User, UserContext } from '@/contexts/user'
import { f } from '@/lib/fetch'
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect, useState } from 'react'

import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light')
  const [user, setUser] = useState<UserContext | null>(null)
  const [completeGetUser, setCompleteGetUser] = useState(true)
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [menuHeader, setMenuHeader] = useState<MenuItem[]>([])

  useEffect(() => {
    setCompleteGetUser(true)
    f.get('/api/auth/me')
    .then(({ user }) => {
      setUser(user)
      setCompleteGetUser(false)
    })
    .catch(() => {
      setUser(null)
      setCompleteGetUser(false)
    })
  }, [])

  useEffect(() => {
    if (!user) {
      setMenuHeader([
        { label: 'Login', href: '/auth/login' }
      ])
    } else {
      setMenuHeader([
        { label: 'Profile', href: '/profile' }
      ])
    }
  }, [user])

  return <>
    <Head>
      <title>Satpam | A secure and trusted password manager and 2FA</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <meta name="description" content="Satpam is a secure and trusted password manager and 2FA" />
    </Head>

    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={val => setColorScheme(val || (colorScheme === 'dark' ? 'light' : 'dark'))}>
      <MantineProvider withNormalizeCSS withGlobalStyles theme={{ colorScheme }}>

        <Notifications position="top-right" notificationMaxHeight="100%" />

        <User.Provider value={{ user, setUser, completeGetUser }}>
          <ShellContext.Provider value={{ menu, setMenu, menuHeader, setMenuHeader }}>
            <Shell menu={menu} menuHeader={menuHeader}>
              <Component {...pageProps} />
            </Shell>
          </ShellContext.Provider>
        </User.Provider>

      </MantineProvider>
    </ColorSchemeProvider>
  </>
}
