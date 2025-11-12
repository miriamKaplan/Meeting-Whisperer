import React from 'react';
import styled from 'styled-components';

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #e1dfdd;
  background: white;
  padding: 0 24px;
  gap: 8px;
`;

const Tab = styled.button<{ $isActive: boolean }>`
  background: none;
  border: none;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: ${props => props.$isActive ? '600' : '400'};
  color: ${props => props.$isActive ? '#5B5FC7' : '#605E5C'};
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  border-bottom: 2px solid ${props => props.$isActive ? '#5B5FC7' : 'transparent'};
  margin-bottom: -2px;

  &:hover {
    color: #252423;
    background: #f3f2f1;
  }

  &:active {
    background: #e1dfdd;
  }
`;

const TabBadge = styled.span`
  background: #C4314B;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 6px;
  min-width: 18px;
  display: inline-block;
  text-align: center;
`;

interface TabItem {
  id: string;
  label: string;
  badge?: number;
}

interface TeamsTabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TeamsTabNavigation: React.FC<TeamsTabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  return (
    <TabsContainer>
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          $isActive={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
          {tab.badge !== undefined && tab.badge > 0 && (
            <TabBadge>{tab.badge}</TabBadge>
          )}
        </Tab>
      ))}
    </TabsContainer>
  );
};
