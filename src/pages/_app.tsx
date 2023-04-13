import Shell, { ShellContext } from '@/components/shell'
import { UserContext } from '@/contexts/user'
import { useProtectedPages } from '@/hooks/useProtectedPages'
import { useSetupStates } from '@/hooks/useSetupStates'
import { useUpdateHeader } from '@/hooks/useUpdateHeader'
import { useUpdateMenu } from '@/hooks/useUpdateMenu'
import { useUser } from '@/hooks/useUser'
import { ColorSchemeProvider, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import type { AppProps } from 'next/app'
import Head from 'next/head'

import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const {
    colorScheme,
    setColorScheme,
    user,
    setUser,
    completeGetUser,
    setCompleteGetUser,
    menu,
    setMenu,
    menuHeader,
    setMenuHeader
  } = useSetupStates()

  useUser({ setUser, setCompleteGetUser })
  useUpdateMenu({ setMenu })
  useUpdateHeader({ user, setMenuHeader })
  useProtectedPages({ user, completeGetUser })

  return <>
    <Head>
      <title>Satpam | A Secure Authenticator and Trusted Password Manager</title>
      <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, user-scalable=no" />
      <link rel="icon" href="/favicon.ico" />
      <meta name="description" content="Satpam is a secure authenticator and trusted password manager" />
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
