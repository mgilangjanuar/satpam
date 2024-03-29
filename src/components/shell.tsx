import { ActionIcon, AppShell, Burger, Button, ButtonProps, Group, Header, MediaQuery, Navbar, Stack, Text, ThemeIcon, Title, UnstyledButton, UnstyledButtonProps, rem, useMantineColorScheme } from '@mantine/core'
import { IconMoon, IconSun } from '@tabler/icons-react'
import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'
import { MouseEventHandler, ReactNode, createContext, isValidElement, useState } from 'react'

export interface MenuItem {
  label?: string,
  href?: string,
  icon?: ReactNode,
  onClick?: () => void,
  element?: ReactNode
}

function HeaderButtonLink(props: ButtonProps & LinkProps & { icon?: ReactNode }) {
  const location = useRouter()
  const isActive = location.pathname === props.href

  return <Button
    variant="subtle"
    color={isActive ? 'blue' : 'gray'}
    {...props}
    component={Link}
    href={props.href || '#'}
    {...props.icon ? {
      leftIcon: <ThemeIcon
        variant="light"
        color={isActive ? "blue" : "gray"}>
        {props.icon }
      </ThemeIcon>
    } : {} } />
}

function NavbarButtonLink(props: UnstyledButtonProps & LinkProps & { icon?: ReactNode }) {
  const location = useRouter()
  const isActive = location.pathname === props.href

  return <UnstyledButton
    sx={(theme) => ({
      display: 'block',
      width: '100%',
      padding: theme.spacing.xs,
      borderRadius: theme.radius.sm,
      color: isActive ? theme.colors.blue[
        theme.colorScheme === 'dark' ? 3 : 7
      ] : theme.colors.gray[
        theme.colorScheme === 'dark' ? 4 : 6
      ],
      '&:hover': {
        backgroundColor:
          theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
      },
    })}
    {...props}
    component={Link}
    href={props.href || '#'}
    onClick={props.onClick as MouseEventHandler<HTMLAnchorElement | HTMLButtonElement> || undefined}>
    {props.icon ? <Group spacing="sm">
      <ThemeIcon
        variant="light"
        radius="md"
        color={isActive ? "blue" : "gray"}>
        {props.icon}
      </ThemeIcon>
      {props.children}
    </Group> : props.children}
  </UnstyledButton>
}

export default function Shell({ children, menu, menuHeader }: { children: React.ReactNode, menu?: MenuItem[], menuHeader?: MenuItem[] }) {
  const [opened, setOpened] = useState(false)
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  return <AppShell
    navbarOffsetBreakpoint="sm"
    asideOffsetBreakpoint="sm"
    header={<Header height={rem(60)} px="md">
      <Stack h={rem(60)} justify="center">
        <Group position="apart">
          <Group>
            {menu?.length ? <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm" />
            </MediaQuery> : <></>}
            <UnstyledButton component={Link} href="/">
              <Title order={2}>Satpam</Title>
            </UnstyledButton>
          </Group>
          <Group>
            {menuHeader?.map((item, i) => {
              if (item.element && isValidElement(item.element)) {
                return item.element
              } else if (item.href || item.onClick) {
                return <HeaderButtonLink
                  key={i}
                  href={item.href || '#'}
                  onClick={e => {
                    if (item.onClick) {
                      e.preventDefault()
                      item.onClick()
                    }
                  }}
                  icon={item.icon}>
                  <Text>{item.label}</Text>
                </HeaderButtonLink>
              } else {
                return <></>
              }
            })}
            <ActionIcon onClick={() => toggleColorScheme()}>
              <ThemeIcon variant="outline" radius="md" color="gray">
                {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
              </ThemeIcon>
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Header>}
    navbar={menu?.length ?
      <Navbar hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 300 }} p="md">
        <Navbar.Section grow>
          {menu.map((item, i) => {
            if (item.element && isValidElement(item.element)) {
              return item.element
            } else if (item.href || item.onClick) {
              return <NavbarButtonLink
                key={i}
                href={item.href || '#'}
                onClick={() => {
                  setOpened(false)
                  item.onClick?.()
                }}
                {...item.icon ? { icon: item.icon } : {} }>
                <Text>{item.label}</Text>
              </NavbarButtonLink>
            } else {
              return <></>
            }
          })}
        </Navbar.Section>
        <Navbar.Section>
          <Group position="center" mt="lg">
            <Text color="dimmed" size="xs">Satpam &copy; {new Date().getFullYear()}</Text>
          </Group>
        </Navbar.Section>
      </Navbar>
    : undefined}>
    {children}
  </AppShell>
}

export const ShellContext = createContext<{
  menu: MenuItem[],
  setMenu: (menu: MenuItem[]) => void,
  menuHeader: MenuItem[],
  setMenuHeader: (menu: MenuItem[]) => void
}>({
  menu: [],
  setMenu: () => {},
  menuHeader: [],
  setMenuHeader: () => {}
})