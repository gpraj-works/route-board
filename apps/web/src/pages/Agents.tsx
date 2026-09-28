import React, { useState } from 'react'
import { Button, Container, Stack } from '@mantine/core'
import { Permission } from '@whosonsite/shared'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../app/theme/ThemeContext'
import { useCan } from '../components/auth/RequirePermission'
import { PageHeader } from '../components/common/PageHeader'
import { AgentFormModal } from '../components/agents/Form'
import { AgentList } from '../components/agents/List'

export const Agents: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const canCreateAgent = useCan(Permission.AGENTS_CREATE)
  const [createModalOpened, setCreateModalOpened] = useState(false)

  return (
    <Container fluid p={0}>
      <Stack gap="sm">
        <PageHeader
          title={t('nav.agents', 'Field Agents')}
          subtitle={t(
            'agents.subtitle',
            'Real-time agent availability, status tracking, and location dispatch readiness'
          )}
          actions={
            canCreateAgent ? (
              <Button
                leftSection={<Plus size={16} />}
                color={primaryColor}
                onClick={() => setCreateModalOpened(true)}
              >
                {t('common.new', 'New')}
              </Button>
            ) : undefined
          }
        />

        <AgentList />

        <AgentFormModal opened={createModalOpened} onClose={() => setCreateModalOpened(false)} />
      </Stack>
    </Container>
  )
}

export default Agents
