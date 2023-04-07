import '@/styles/globals.css'
import { MantineProvider } from '@mantine/core'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <MantineProvider withCSSVariables withGlobalStyles>
    <Component {...pageProps} />
  </MantineProvider>
}
