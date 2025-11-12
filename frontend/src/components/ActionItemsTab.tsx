import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #faf9f8;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f3f2f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c8c6c4;
    border-radius: 4px;

    &:hover {
      background: #a19f9d;
    }
  }
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #252423;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #605E5C;
  margin: 0;
`;

const ActionItemCard = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid #e1dfdd;
  padding: 16px 20px;
  margin-bottom: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 16px;

  &:hover {
    border-color: #5B5FC7;
    box-shadow: 0 2px 8px rgba(91, 95, 199, 0.15);
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #5B5FC7;
  flex-shrink: 0;
`;

const ItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemText = styled.div`
  font-size: 14px;
  color: #252423;
  line-height: 1.5;
  margin-bottom: 8px;
`;

const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const PriorityBadge = styled.span<{ priority: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${props => {
    switch (props.priority.toLowerCase()) {
      case 'high':
        return `
          background: #FDE7E9;
          color: #C4314B;
        `;
      case 'medium':
        return `
          background: #FFF4E5;
          color: #F59E0B;
        `;
      case 'low':
        return `
          background: #E8F5E9;
          color: #2E7D32;
        `;
      default:
        return `
          background: #f3f2f1;
          color: #605E5C;
        `;
    }
  }}
`;

const AssigneeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 4px;
  background: #f3f2f1;
  font-size: 12px;
  color: #605E5C;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #605E5C;
  cursor: pointer;
  font-size: 18px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f3f2f1;
    color: #252423;
  }

  &:active {
    background: #e1dfdd;
  }
`;

const JiraButton = styled.button`
  background: #0052CC;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #0747A6;
  }

  &:active {
    background: #003C82;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #8A8886;
  text-align: center;
  background: white;
  border-radius: 8px;
  border: 2px dashed #e1dfdd;

  .icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #605E5C;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: #8A8886;
    margin: 0;
  }
`;

const GenerateButton = styled.button`
  background: #5B5FC7;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: background 0.2s;

  &:hover {
    background: #4A4FB0;
  }

  &:active {
    background: #3A3F9A;
  }
`;

interface ActionItem {
  text: string;
  assignee?: string | null;
  priority: string;
  completed?: boolean;
}

interface ActionItemsTabProps {
  actionItems: string[];
  onAddToJira?: (item: string, index: number) => void;
  onGenerateItems?: () => void;
}

const parseActionItem = (item: string): ActionItem => {
  // Parse format: "text (assignee) [priority]" or "text [priority]"
  const match = item.match(/^(.+?)(?:\s*\(([^)]+)\))?\s*\[([^\]]+)\](.*)$/);

  if (match) {
    return {
      text: match[1].trim(),
      assignee: match[2] || null,
      priority: match[3].toLowerCase(),
      completed: item.includes('✅')
    };
  }

  return {
    text: item,
    assignee: null,
    priority: 'medium',
    completed: item.includes('✅')
  };
};

export const ActionItemsTab: React.FC<ActionItemsTabProps> = ({
  actionItems,
  onAddToJira,
  onGenerateItems
}) => {
  if (actionItems.length === 0) {
    return (
      <Container>
        <EmptyState>
          <div className="icon">📋</div>
          <h3>No action items yet</h3>
          <p>Start recording and action items will be automatically generated</p>
          {onGenerateItems && (
            <GenerateButton onClick={onGenerateItems}>
              Generate Action Items
            </GenerateButton>
          )}
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <span>📋</span>
          Action Items
        </Title>
        <Subtitle>{actionItems.length} items identified from the meeting</Subtitle>
      </Header>

      {actionItems.map((item, index) => {
        const parsed = parseActionItem(item);

        return (
          <ActionItemCard key={index}>
            <Checkbox defaultChecked={parsed.completed} />
            <ItemContent>
              <ItemText>{parsed.text}</ItemText>
              <ItemMeta>
                <PriorityBadge priority={parsed.priority}>
                  {parsed.priority}
                </PriorityBadge>
                {parsed.assignee && (
                  <AssigneeBadge>
                    <span>👤</span>
                    {parsed.assignee}
                  </AssigneeBadge>
                )}
              </ItemMeta>
            </ItemContent>
            <ActionButtons>
              <IconButton title="Edit">✏️</IconButton>
              <IconButton title="Delete">🗑️</IconButton>
              {onAddToJira && (
                <JiraButton onClick={() => onAddToJira(item, index)}>
                  📋 Jira
                </JiraButton>
              )}
            </ActionButtons>
          </ActionItemCard>
        );
      })}
    </Container>
  );
};
