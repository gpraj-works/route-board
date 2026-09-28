import React, { useState } from 'react'
import { Button, Group, Modal, PasswordInput, Select, Stack, TextInput } from '@mantine/core'
import { createUserSchema, UserRole } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'
import { useAppTheme } from '../../app/theme/ThemeContext'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useCreateUser } from './queries'

interface UserFormModalProps {
  opened: boolean
  onClose: () => void
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ opened, onClose }) => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const createUserMutation = useCreateUser()

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>(UserRole.AGENT)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const roleOptions = [
    { value: UserRole.ADMIN, label: t('role.admin', 'Admin') },
    { value: UserRole.STAFF, label: t('role.staff', 'Staff') },
    { value: UserRole.AGENT, label: t('role.agent', 'Agent') }
  ]

  const handleClose = () => {
    setEmail('')
    setName('')
    setPassword('')
    setRole(UserRole.AGENT)
    setFormErrors({})
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    const payload = {
      email,
      name: name || undefined,
      password: password || undefined,
      role
    }

    const parseResult = createUserSchema.safeParse(payload)
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {}
      for (const err of parseResult.error.errors) {
        const fieldName = String(err.path[0])
        fieldErrors[fieldName] = err.message
      }
      setFormErrors(fieldErrors)
      return
    }

    try {
      await createUserMutation.mutateAsync(parseResult.data)
      handleClose()
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('people.addMemberTitle', 'Add Team Member')}
      centered
      radius="md"
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="sm">
          <ApiErrorAlert error={createUserMutation.error} />

          <TextInput
            label={t('people.emailLabel', 'Email Address')}
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={formErrors.email}
          />

          <TextInput
            label={t('people.nameLabel', 'Full Name')}
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={formErrors.name}
          />

          <Select
            label={t('people.roleLabel', 'Role')}
            data={roleOptions}
            value={role}
            onChange={(val) => val && setRole(val as UserRole)}
            error={formErrors.role}
          />

          <PasswordInput
            label={t('people.passwordLabel', 'Temporary Password (optional)')}
            placeholder="Min. 8 characters (defaults to password123)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={formErrors.password}
          />

          <Group justify="flex-end" gap="xs" mt="md">
            <Button variant="default" onClick={handleClose}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" color={primaryColor} loading={createUserMutation.isPending}>
              {t('people.createMemberSubmit', 'Create Member')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
