import Shell, { MenuItem, ShellContext } from '@/components/shell'
import { UserContext, UserContextAttributes } from '@/contexts/user'
import { useProtectedPages } from '@/hooks/useProtectedPages'
import { useUpdateHeader } from '@/hooks/useUpdateHeader'
import { useUser } from '@/hooks/useUser'
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useState } from 'react'

import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light')

  const [user, setUser] = useState<UserContextAttributes | null>(null)
  const [completeGetUser, setCompleteGetUser] = useState(false)

  const [menu, setMenu] = useState<MenuItem[]>([])
  const [menuHeader, setMenuHeader] = useState<MenuItem[]>([])

  useUser({ setUser, setCompleteGetUser })
  useUpdateHeader({ user, setMenuHeader })
  useProtectedPages({ user, completeGetUser })

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

        <UserContext.Provider value={{ user, setUser, completeGetUser }}>
          <ShellContext.Provider value={{ menu, setMenu, menuHeader, setMenuHeader }}>
            <Shell menu={menu} menuHeader={menuHeader}>
              <Component {...pageProps} />
            </Shell>
          </ShellContext.Provider>
        </UserContext.Provider>

      </MantineProvider>
    </ColorSchemeProvider>
  </>
}
