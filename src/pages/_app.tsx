import Shell, { MenuItem, ShellContext } from '@/components/shell'
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useState } from 'react'

import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light')
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [menuHeader, setMenuHeader] = useState<MenuItem[]>([
    { label: 'Login', href: '/auth/login' },
  ])

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

        <ShellContext.Provider value={{ menu, setMenu, menuHeader, setMenuHeader }}>
          <Shell menu={menu} menuHeader={menuHeader}>
            <Component {...pageProps} />
          </Shell>
        </ShellContext.Provider>

      </MantineProvider>
    </ColorSchemeProvider>
  </>
}
