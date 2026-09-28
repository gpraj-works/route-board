import React from 'react'
import { Avatar, Badge, Button, Card, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { AgentStatus } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAppTheme } from '../../../app/theme/ThemeContext'
import { useAgents } from '../../agents/queries'

export const FieldAgentsWidget: React.FC = () => {
  const { t } = useTranslation()
  const { primaryColor } = useAppTheme()
  const { data: agents = [], isLoading: isLoadingTechs } = useAgents()

  return (
    <Card radius="md" withBorder shadow="xs" p="md" style={{ height: '100%' }}>
      <Group justify="space-between" mb="sm">
        <Title order={5}>{t('dashboard.fieldAgents', 'Field Agents')}</Title>
        <Button size="xs" variant="subtle" color={primaryColor} component={Link} to="/agents">
          {t('dashboard.viewAllAgents', 'View All')}
        </Button>
      </Group>
      <Stack gap="xs">
        {isLoadingTechs ? (
          <Text size="xs" c="dimmed">
            {t('common.loading', 'Loading agents...')}
          </Text>
        ) : agents.length === 0 ? (
          <Text size="xs" c="dimmed">
            {t('dashboard.noAgentsMessage', 'No agents available.')}
          </Text>
        ) : (
          agents.slice(0, 4).map((tech) => (
            <Paper key={tech.id} p="xs" radius="sm" withBorder bg="var(--mantine-color-body)">
              <Group justify="space-between">
                <Group gap="xs">
                  <Avatar size="sm" radius="xl" color={primaryColor}>
                    {tech.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <Text size="xs" fw={600}>
                      {tech.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {tech.phone || t('dashboard.noPhone', 'No phone')}
                    </Text>
                  </div>
                </Group>
                <Badge
                  size="xs"
                  variant="light"
                  color={
                    tech.status === AgentStatus.AVAILABLE
                      ? 'green'
                      : tech.status === AgentStatus.BUSY
                        ? 'orange'
                        : 'gray'
                  }
                >
                  {tech.status}
                </Badge>
              </Group>
            </Paper>
          ))
        )}
      </Stack>
    </Card>
  )
}
