import { Anchor, Box, Container, Image, Stack, Text, Title, rem } from '@mantine/core'

export default function Home() {
  return <Container fluid>
    <Stack mih="80vh" align="center" justify="center">
      <Box maw={720} w="100%">
        <Title ta="center">
          A Secure Authenticator and Trusted Password Manager
        </Title>
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
          Satpam uses public key cryptography to save your credentials <Text component="strong">securely</Text>.
        </Text>
        <Text color="dimmed" ta="center" mt="sm">
          We use public key cryptography to encrypt your credentials. Your credentials are encrypted with your public key and only you can decrypt them with your private key.
        </Text>
      </Box>
      <Box maw={1080} w="100%">
        <Anchor href="/flow_keypair.png" target="_blank">
          <Image
            mt="xl"
            src="/flow_keypair.png"
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
        <Anchor href="/flow_encrypt.png" target="_blank">
          <Image
            mt="xl"
            src="/flow_encrypt.png"
            alt="encryption flow" />
        </Anchor>
      </Box>
    </Stack>
  </Container>
}
