import React, { useState } from 'react'
import { Alert, Button, Group, Modal, Select, Stack, Text } from '@mantine/core'
import { UserDto, UserRole } from '@whosonsite/shared'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppTheme } from '../../app/theme/ThemeContext'
import { useAuth } from '../auth/AuthContext'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useUpdateUser } from './queries'

interface RoleChangeModalProps {
  user: UserDto | null
  opened: boolean
  onClose: () => void
}

export const RoleChangeModal: React.FC<RoleChangeModalProps> = ({ user, opened, onClose }) => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { user: currentUser } = useAuth()
  const updateUserMutation = useUpdateUser()

  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || UserRole.AGENT)
  const [prevUser, setPrevUser] = useState<UserDto | null>(user)

  if (user !== prevUser) {
    setPrevUser(user)
    setSelectedRole(user?.role || UserRole.AGENT)
  }

  if (!user) return null

  const isCurrentUserOwner = currentUser?.role === UserRole.OWNER

  const roleOptions = [
    ...(isCurrentUserOwner ? [{ value: UserRole.OWNER, label: t('role.owner', 'Owner') }] : []),
    { value: UserRole.ADMIN, label: t('role.admin', 'Admin') },
    { value: UserRole.STAFF, label: t('role.staff', 'Staff') },
    { value: UserRole.AGENT, label: t('role.agent', 'Agent') }
  ]

  const isTransferringOwnership = selectedRole === UserRole.OWNER && user.role !== UserRole.OWNER

  const handleSubmit = async () => {
    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        input: { role: selectedRole }
      })
      onClose()
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('people.changeRoleTitle', 'Change Member Role')}
      centered
      radius="md"
    >
      <Stack gap="sm">
        <ApiErrorAlert error={updateUserMutation.error} />

        <Text size="sm">
          {t('people.changingRoleFor', 'Updating access permissions for')}{' '}
          <b>{user.name || user.email}</b>.
        </Text>

        <Select
          label={t('people.newRoleLabel', 'Select New Role')}
          data={roleOptions}
          value={selectedRole}
          onChange={(val) => val && setSelectedRole(val as UserRole)}
        />

        {isTransferringOwnership && (
          <Alert
            icon={<AlertTriangle size={16} />}
            title={t('people.ownershipTransferTitle', 'Transfer Ownership Warning')}
            color="red"
            variant="light"
          >
            {t(
              'people.ownershipTransferWarning',
              'Transferring company ownership will promote this user to Owner and demote your account to Admin. This action cannot be undone by an Admin.'
            )}
          </Alert>
        )}

        <Group justify="flex-end" gap="xs" mt="md">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            color={isTransferringOwnership ? 'red' : primaryColor}
            loading={updateUserMutation.isPending}
            onClick={handleSubmit}
          >
            {isTransferringOwnership
              ? t('people.confirmTransfer', 'Transfer Ownership')
              : t('common.save', 'Save Changes')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
