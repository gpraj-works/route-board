import React, { useMemo, useState } from 'react'
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Paper,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Tooltip
} from '@mantine/core'
import { formatDateTime, UserDto, UserRole, UserStatus } from '@whosonsite/shared'
import { KeyRound, Power, Search, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppTheme } from '../app/theme/ThemeContext'
import { useAuth } from '../components/auth/AuthContext'
import { PageHeader } from '../components/common/PageHeader'
import { ApiErrorAlert } from '../components/feedback/ApiErrorAlert'
import { ConfirmDialog } from '../components/feedback/ConfirmDialog'
import { RoleChangeModal } from '../components/people/RoleChangeModal'
import { UserFormModal } from '../components/people/UserFormModal'
import { useUsers, useUpdateUser } from '../components/people/queries'

export const People: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { user: currentUser } = useAuth()

  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [search, setSearch] = useState<string>('')
  const [createModalOpened, setCreateModalOpened] = useState<boolean>(false)
  const [roleChangeUser, setRoleChangeUser] = useState<UserDto | null>(null)
  const [userToToggleStatus, setUserToToggleStatus] = useState<UserDto | null>(null)

  const { data: users = [], isLoading, error } = useUsers()
  const updateUserMutation = useUpdateUser()

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesTab = activeTab === 'ALL' || u.role === activeTab.toLowerCase()
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q || u.email.toLowerCase().includes(q) || (u.name && u.name.toLowerCase().includes(q))
      return matchesTab && matchesSearch
    })
  }, [users, activeTab, search])

  const handleToggleStatus = async () => {
    if (!userToToggleStatus) return
    const newStatus =
      userToToggleStatus.status === UserStatus.ACTIVE ? UserStatus.DEACTIVATED : UserStatus.ACTIVE

    try {
      await updateUserMutation.mutateAsync({
        id: userToToggleStatus.id,
        input: { status: newStatus }
      })
      setUserToToggleStatus(null)
    } catch {
      // Error handled by mutation
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.OWNER:
        return 'red'
      case UserRole.ADMIN:
        return 'blue'
      case UserRole.STAFF:
        return 'violet'
      case UserRole.AGENT:
        return 'teal'
      default:
        return 'gray'
    }
  }

  return (
    <Container fluid p={0}>
      <Stack gap="xs">
        <PageHeader
          title={t('people.title', 'People & Team')}
          subtitle={t(
            'people.subtitle',
            'Manage company members, assign role permissions, and track active team seats'
          )}
          actions={
            <Button
              leftSection={<UserPlus size={16} />}
              color={primaryColor}
              onClick={() => setCreateModalOpened(true)}
            >
              {t('people.addMember', 'Add Member')}
            </Button>
          }
        />

        <ApiErrorAlert error={error} />

        {/* Filter Bar */}
        <Paper p="sm" radius="md" withBorder>
          <Group justify="space-between" align="center" wrap="wrap">
            <Tabs value={activeTab} onChange={(val) => val && setActiveTab(val)}>
              <Tabs.List>
                <Tabs.Tab value="ALL">
                  {t('common.all', 'All')} ({users.length})
                </Tabs.Tab>
                <Tabs.Tab value="ADMIN">
                  {t('role.admin', 'Admins')} (
                  {users.filter((u) => u.role === UserRole.ADMIN).length})
                </Tabs.Tab>
                <Tabs.Tab value="STAFF">
                  {t('role.staff', 'Staff')} (
                  {users.filter((u) => u.role === UserRole.STAFF).length})
                </Tabs.Tab>
                <Tabs.Tab value="AGENT">
                  {t('role.agent', 'Agents')} (
                  {users.filter((u) => u.role === UserRole.AGENT).length})
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <TextInput
              placeholder={t('people.searchPlaceholder', 'Search name or email...')}
              leftSection={<Search size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="xs"
              style={{ minWidth: 260 }}
            />
          </Group>
        </Paper>

        {/* Members Table */}
        <Card radius="md" withBorder shadow="xs" p={0}>
          <Table.ScrollContainer minWidth={700}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('people.member', 'Member')}</Table.Th>
                  <Table.Th>{t('people.role', 'Role')}</Table.Th>
                  <Table.Th>{t('people.status', 'Status')}</Table.Th>
                  <Table.Th>{t('people.fieldLink', 'Field Tech')}</Table.Th>
                  <Table.Th>{t('people.joinedDate', 'Joined')}</Table.Th>
                  <Table.Th w={120} ta="right">
                    {t('common.actions', 'Actions')}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {isLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={6} ta="center" py="xl">
                      <Text size="sm" c="dimmed">
                        {t('common.loading', 'Loading members...')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : filteredUsers.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6} ta="center" py="xl">
                      <Text size="sm" c="dimmed">
                        {t('people.noMembersFound', 'No members matching filter criteria.')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredUsers.map((member) => {
                    const isSelf = member.id === currentUser?.id
                    const isOwner = member.role === UserRole.OWNER

                    return (
                      <Table.Tr key={member.id}>
                        <Table.Td>
                          <Group gap="xs" wrap="nowrap">
                            <Avatar color={primaryColor} radius="xl" size="sm">
                              {(member.name || member.email).charAt(0).toUpperCase()}
                            </Avatar>
                            <div>
                              <Group gap={6} wrap="nowrap">
                                <Text size="sm" fw={700}>
                                  {member.name || '—'}
                                </Text>
                                {isSelf && (
                                  <Badge size="xs" variant="outline" color="gray">
                                    {t('people.youBadge', 'You')}
                                  </Badge>
                                )}
                              </Group>
                              <Text size="xs" c="dimmed">
                                {member.email}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="sm" color={getRoleBadgeColor(member.role)} variant="light">
                            {t(`role.${member.role}`, member.role.toUpperCase())}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            size="sm"
                            color={member.status === UserStatus.ACTIVE ? 'green' : 'gray'}
                            variant="dot"
                          >
                            {t(`status.${member.status}`, member.status.toUpperCase())}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {member.agentLinked ? (
                            <Badge size="xs" color="teal" variant="light">
                              {t('people.linkedTech', 'Linked Agent')}
                            </Badge>
                          ) : (
                            <Text size="xs" c="dimmed">
                              —
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {formatDateTime(member.createdAt)}
                          </Text>
                        </Table.Td>
                        <Table.Td ta="right">
                          <Group gap="xs" justify="flex-end" wrap="nowrap">
                            <Tooltip label={t('people.changeRole', 'Change Role')}>
                              <ActionIcon
                                variant="light"
                                color="blue"
                                size="sm"
                                disabled={isOwner && currentUser?.role !== UserRole.OWNER}
                                onClick={() => setRoleChangeUser(member)}
                              >
                                <KeyRound size={14} />
                              </ActionIcon>
                            </Tooltip>

                            <Tooltip
                              label={
                                isSelf
                                  ? t('people.cannotDeactivateSelf', 'Cannot deactivate yourself')
                                  : isOwner
                                    ? t(
                                        'people.cannotDeactivateOwner',
                                        'Owner cannot be deactivated'
                                      )
                                    : member.status === UserStatus.ACTIVE
                                      ? t('people.deactivate', 'Deactivate Member')
                                      : t('people.activate', 'Activate Member')
                              }
                            >
                              <ActionIcon
                                variant="light"
                                color={member.status === UserStatus.ACTIVE ? 'red' : 'green'}
                                size="sm"
                                disabled={isSelf || isOwner}
                                onClick={() => setUserToToggleStatus(member)}
                              >
                                <Power size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    )
                  })
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>

        <UserFormModal opened={createModalOpened} onClose={() => setCreateModalOpened(false)} />

        <RoleChangeModal
          user={roleChangeUser}
          opened={Boolean(roleChangeUser)}
          onClose={() => setRoleChangeUser(null)}
        />

        <ConfirmDialog
          opened={Boolean(userToToggleStatus)}
          onClose={() => setUserToToggleStatus(null)}
          onConfirm={handleToggleStatus}
          title={
            userToToggleStatus?.status === UserStatus.ACTIVE
              ? t('people.deactivateTitle', 'Deactivate Member')
              : t('people.activateTitle', 'Activate Member')
          }
          message={
            userToToggleStatus?.status === UserStatus.ACTIVE
              ? t(
                  'people.deactivateMessage',
                  'Are you sure you want to deactivate this member? They will no longer be able to log in or access company dispatch data.'
                )
              : t(
                  'people.activateMessage',
                  'Are you sure you want to re-activate this member account?'
                )
          }
          confirmLabel={
            userToToggleStatus?.status === UserStatus.ACTIVE
              ? t('people.deactivateConfirm', 'Deactivate')
              : t('people.activateConfirm', 'Activate')
          }
          confirmColor={userToToggleStatus?.status === UserStatus.ACTIVE ? 'red' : 'green'}
          isLoading={updateUserMutation.isPending}
          error={updateUserMutation.error}
        />
      </Stack>
    </Container>
  )
}

export default People
