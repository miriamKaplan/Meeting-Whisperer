import styled from 'styled-components';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: ${props => props.theme.fonts.size['3xl']};
  margin-bottom: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.primary};
`;

const SettingsCard = styled(Card)`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SettingSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingTitle = styled.h3`
  font-size: ${props => props.theme.fonts.size.lg};
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.primary};
`;

const SettingDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.md};
  line-height: 1.5;
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fonts.size.base};
  font-family: ${props => props.theme.fonts.family.primary};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.border.focus};
  }
`;

const SaveButton = styled(Button)`
  margin-top: ${props => props.theme.spacing.xl};
`;

export const SettingsPage = () => {
  return (
    <PageContainer>
      <Title>Settings</Title>
      
      <SettingsCard>
        <SettingSection>
          <SettingTitle>🔑 OpenAI API Key</SettingTitle>
          <SettingDescription>
            Your OpenAI API key for transcription and AI processing
          </SettingDescription>
          <Input type="password" placeholder="sk-..." />
        </SettingSection>

        <SettingSection>
          <SettingTitle>🎯 Jira Integration</SettingTitle>
          <SettingDescription>
            Configure Jira to automatically create tasks from action items
          </SettingDescription>
          <Input type="text" placeholder="Jira URL" style={{ marginBottom: '12px' }} />
          <Input type="email" placeholder="Email" style={{ marginBottom: '12px' }} />
          <Input type="password" placeholder="API Token" />
        </SettingSection>

        <SettingSection>
          <SettingTitle>💬 Teams/Slack Webhook</SettingTitle>
          <SettingDescription>
            Post meeting summaries to your team channels
          </SettingDescription>
          <Input type="text" placeholder="Webhook URL" />
        </SettingSection>

        <SaveButton variant="primary" fullWidth>
          Save Settings
        </SaveButton>
      </SettingsCard>
    </PageContainer>
  );
};
