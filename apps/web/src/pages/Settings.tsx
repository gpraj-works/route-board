import React, { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  ColorSwatch,
  Container,
  Divider,
  Group,
  Paper,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title
} from '@mantine/core'
import { Permission, ThemeColorType } from '@whosonsite/shared'
import { Building2, Check, CreditCard, Moon, Palette, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAppTheme } from '../app/theme/ThemeContext'
import { useAuth } from '../components/auth/AuthContext'
import { useCan } from '../components/auth/RequirePermission'
import { PageHeader } from '../components/common/PageHeader'

const SWATCH_HEX_MAP: Record<ThemeColorType, string> = {
  teal: '#12b886',
  indigo: '#4c6ef5',
  blue: '#228be6',
  violet: '#7950f2',
  orange: '#fd7e14',
  green: '#40c057'
}

export const Settings: React.FC = () => {
  const { t } = useTranslation()
  const { colorScheme, toggleColorScheme, primaryColor, setPrimaryColor, themeColors } =
    useAppTheme()
  const { company } = useAuth()

  const canCompanyUpdate = useCan(Permission.COMPANY_UPDATE)
  const canBillingView = useCan(Permission.BILLING_VIEW)

  const [activeTab, setActiveTab] = useState<string>('theme')

  return (
    <Container fluid p={0}>
      <Stack gap="xs">
        <PageHeader
          title={t('nav.settings', 'Settings')}
          subtitle={t(
            'settings.subtitle',
            'Theme appearance, company profile, and organization preferences'
          )}
        />

        <Tabs value={activeTab} onChange={(val) => val && setActiveTab(val)}>
          <Paper p="xs" radius="md" withBorder mb="xs">
            <Tabs.List>
              <Tabs.Tab value="theme" leftSection={<Palette size={16} />}>
                {t('theme.title', 'Appearance')}
              </Tabs.Tab>

              {canCompanyUpdate && (
                <Tabs.Tab value="company" leftSection={<Building2 size={16} />}>
                  {t('company.tabTitle', 'Company Profile')}
                </Tabs.Tab>
              )}

              {canBillingView && (
                <Tabs.Tab value="billing" leftSection={<CreditCard size={16} />}>
                  {t('billing.tabTitle', 'Subscription')}
                </Tabs.Tab>
              )}
            </Tabs.List>
          </Paper>

          {/* Theme Tab */}
          <Tabs.Panel value="theme">
            <Card radius="md" withBorder p="lg">
              <Stack gap="md">
                <Title order={4}>{t('theme.title', 'Appearance')}</Title>
                <Text size="sm" c="dimmed">
                  {t('theme.desc', 'Customize WhosOnSite visual mode and brand color palette')}
                </Text>

                <Divider my="xs" />

                <div>
                  <Text size="sm" fw={600} mb="xs">
                    {t('theme.colorScheme', 'Color Scheme')}
                  </Text>
                  <Group gap="md">
                    <Button
                      variant={colorScheme === 'light' ? 'filled' : 'default'}
                      color={primaryColor}
                      leftSection={<Sun size={18} />}
                      onClick={toggleColorScheme}
                    >
                      {t('theme.lightMode', 'Light Mode')}
                    </Button>

                    <Button
                      variant={colorScheme === 'dark' ? 'filled' : 'default'}
                      color={primaryColor}
                      leftSection={<Moon size={18} />}
                      onClick={toggleColorScheme}
                    >
                      {t('theme.darkMode', 'Dark Mode')}
                    </Button>
                  </Group>
                </div>

                <Divider my="xs" />

                <div>
                  <Text size="sm" fw={600} mb="xs">
                    {t('theme.primaryColor', 'Company Accent Color')}
                  </Text>
                  <Group gap="sm" mt="xs">
                    {themeColors.map((color) => (
                      <ColorSwatch
                        key={color}
                        color={SWATCH_HEX_MAP[color]}
                        component="button"
                        type="button"
                        onClick={() => setPrimaryColor(color)}
                        style={{ color: '#fff', cursor: 'pointer', border: 'none' }}
                        aria-label={`${color} color swatch`}
                      >
                        {primaryColor === color && <Check size={16} />}
                      </ColorSwatch>
                    ))}
                  </Group>
                </div>
              </Stack>
            </Card>
          </Tabs.Panel>

          {/* Company Profile Tab (Owner Only) */}
          {canCompanyUpdate && (
            <Tabs.Panel value="company">
              <Card radius="md" withBorder p="lg">
                <Stack gap="md">
                  <div>
                    <Title order={4}>{t('company.detailsTitle', 'Company Details')}</Title>
                    <Text size="sm" c="dimmed">
                      {t(
                        'company.detailsDesc',
                        'Organization metadata and headquarters contact information'
                      )}
                    </Text>
                  </div>

                  <Divider my="xs" />

                  <Stack gap="sm" style={{ maxWidth: 540 }}>
                    <TextInput
                      label={t('company.nameLabel', 'Company Name')}
                      value={company?.name || ''}
                      readOnly
                    />

                    <TextInput
                      label={t('company.emailLabel', 'Dispatch Email')}
                      value={company?.email || 'N/A'}
                      readOnly
                    />

                    <TextInput
                      label={t('company.phoneLabel', 'Dispatch Phone')}
                      value={company?.phone || 'N/A'}
                      readOnly
                    />

                    <TextInput
                      label={t('company.addressLabel', 'Headquarters Address')}
                      value={company?.address || 'N/A'}
                      readOnly
                    />
                  </Stack>
                </Stack>
              </Card>
            </Tabs.Panel>
          )}

          {/* Billing Tab (Owner Only) */}
          {canBillingView && (
            <Tabs.Panel value="billing">
              <Card radius="md" withBorder p="lg">
                <Stack gap="md">
                  <Group justify="space-between">
                    <div>
                      <Title order={4}>{t('billing.tabHeading', 'Plan & Invoicing')}</Title>
                      <Text size="sm" c="dimmed">
                        {t('billing.overviewDesc', 'Subscription tier and license seats overview')}
                      </Text>
                    </div>
                    <Badge color="green" size="md" variant="light">
                      Professional
                    </Badge>
                  </Group>

                  <Divider my="xs" />

                  <Text size="sm">
                    {t(
                      'billing.cardText',
                      'Your company has an active Professional subscription with unlimited dispatch licenses.'
                    )}
                  </Text>

                  <Group mt="xs">
                    <Button color={primaryColor} component={Link} to="/subscription">
                      {t('billing.viewFullBilling', 'View Full Billing Page')}
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Tabs.Panel>
          )}
        </Tabs>
      </Stack>
    </Container>
  )
}

export default Settings
