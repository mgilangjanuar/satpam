import '@/styles/globals.css'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import type { AppProps } from 'next/app'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <Head>
      <title>Satpam | A secure and trusted password manager and 2FA</title>
      <meta name="description" content="Generated by create next app" />
    </Head>
    <MantineProvider withCSSVariables withGlobalStyles>
      <Notifications position="top-right" notificationMaxHeight="100%" />
      <Component {...pageProps} />
    </MantineProvider>
  </>
}
