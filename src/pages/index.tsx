import { Anchor, Box, Container, Footer, Group, Image, Paper, Stack, Text, Title, UnstyledButton, createStyles, keyframes, useMantineColorScheme } from '@mantine/core'
import { IconBrandGithub, IconChevronDown } from '@tabler/icons-react'
import Link from 'next/link'

const useStyle = createStyles({
  'downArrow': {
    animation: `${keyframes({
      'from, 20%, 53%, 80%, to': { transform: 'translate3d(0, 0, 0)' },
      '40%, 43%': { transform: 'translate3d(0, -1.875rem, 0)' },
      '70%': { transform: 'translate3d(0, -0.9375rem, 0)' },
      '90%': { transform: 'translate3d(0, -0.25rem, 0)' },
    })} 3s ease-in-out infinite`
  }
})

export default function Home() {
  const { colorScheme } = useMantineColorScheme()
  const { classes } = useStyle()

  return <Container fluid>
    <Stack mih="80vh" align="center" justify="center">
      <Box maw={720} w="100%">
        <Title ta="center" fw="normal">
          A Secure Authenticator and Trusted Password Manager
        </Title>
      </Box>
      <Box mt="xl" className={classes.downArrow}>
        <IconChevronDown size={48} />
      </Box>
    </Stack>
    <Stack mih="80vh" align="center" justify="center">
      <Box maw={920} w="100%">
        <Text size={28} ta="center">
          Satpam saves your <Text component="strong">encrypted</Text> credentials.
        </Text>
        <Text color="dimmed" ta="center" mt="sm">
          We really care about your security. That&apos;s why we use the latest encryption technology to keep your credentials safe.
        </Text>
      </Box>
      <Box maw={1080} w="100%">
        <Anchor href="/ss_inspect.png" target="_blank">
          <Image
            mt="xl"
            src="/ss_inspect.png"
            alt="secure encrypted credentials" />
        </Anchor>
      </Box>
    </Stack>
    <Stack mih="80vh" align="center" justify="center">
      <Box maw={920} w="100%">
        <Text size={28} ta="center">
          Satpam uses key pair to save your credentials <Text component="strong">securely</Text>.
        </Text>
        <Text color="dimmed" ta="center" mt="sm">
          We use public key cryptography to encrypt your credentials. Your credentials are encrypted with your public key and only you can decrypt them with your private key.
        </Text>
      </Box>
      <Box maw={1080} w="100%">
        <Anchor href={`/flow_keypair_${colorScheme}.png`} target="_blank">
          <Image
            mt="xl"
            src={`/flow_keypair_${colorScheme}.png`}
            alt="keypair encryption" />
        </Anchor>
      </Box>
    </Stack>
    <Stack mih="80vh" align="center" justify="center">
      <Box maw={920} w="100%">
        <Text size={28} ta="center">
          Satpam stores your credentials with <Text component="strong">multiple layers</Text> of encryption.
        </Text>
        <Text color="dimmed" ta="center" mt="sm">
          We use multiple layers of encryption to store your credentials. Your credentials are encrypted with your public key and the server&apos;s secret key. Only you can decrypt your credentials.
        </Text>
      </Box>
      <Box maw={1080} w="100%">
        <Anchor href={`/flow_encrypt_${colorScheme}.png`} target="_blank">
          <Image
            mt="xl"
            src={`/flow_encrypt_${colorScheme}.png`}
            alt="encryption flow" />
        </Anchor>
      </Box>
    </Stack>
    <Stack mih="80vh" align="center" justify="center">
      <Box maw={920} w="100%">
        <Text size={28} ta="center">
          Still doubt? <Text component="strong">Check our source code</Text>.
        </Text>
        <Text color="dimmed" ta="center" mt="sm">
          Yup, Satpam is open-source software developed by <Anchor href="https://appledore.dev" target="_blank">@mgilangjanuar</Anchor>. You can check our source code on GitHub and deploy your own Satpam instance.
        </Text>
      </Box>
      <Box maw={480} w="100%">
        <UnstyledButton w="100%" component={Link} href="https://github.com/mgilangjanuar/satpam" target="_blank">
          <Paper p="lg" withBorder>
            <Group noWrap>
              <IconBrandGithub size={28} />
              <Text size="lg" truncate>github.com/mgilangjanuar/satpam</Text>
            </Group>
          </Paper>
        </UnstyledButton>
      </Box>
    </Stack>
    <Footer height={60} pos="relative" mb={-68}>
      <Stack justify="center" align="center" h={60}>
        <Text size="sm" color="dimmed">
          Satpam by <Anchor href="https://appledore.dev" target="_blank">@mgilangjanuar</Anchor> &copy; {new Date().getFullYear()}
        </Text>
      </Stack>
    </Footer>
  </Container>
}
