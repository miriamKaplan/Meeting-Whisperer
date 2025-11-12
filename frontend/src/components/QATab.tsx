import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
`;

const QAList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;

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

const QuestionCard = styled.div`
  background: #faf9f8;
  border-radius: 8px;
  border: 1px solid #e1dfdd;
  padding: 16px 20px;
  margin-bottom: 16px;
  transition: all 0.2s;

  &:hover {
    border-color: #5B5FC7;
    box-shadow: 0 2px 8px rgba(91, 95, 199, 0.15);
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
`;

const Avatar = styled.div<{ color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
`;

const QuestionContent = styled.div`
  flex: 1;
`;

const QuestionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
`;

const AuthorName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #252423;
`;

const Timestamp = styled.span`
  font-size: 12px;
  color: #8A8886;
`;

const QuestionText = styled.div`
  font-size: 14px;
  color: #252423;
  line-height: 1.5;
  margin-bottom: 12px;
`;

const QuestionActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ActionButton = styled.button<{ $isActive?: boolean }>`
  background: none;
  border: none;
  color: ${props => props.$isActive ? '#5B5FC7' : '#605E5C'};
  cursor: pointer;
  font-size: 13px;
  font-weight: ${props => props.$isActive ? '600' : '500'};
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f3f2f1;
    color: #5B5FC7;
  }
`;

const AnswerSection = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e1dfdd;
  background: white;
  padding: 12px;
  border-radius: 6px;
`;

const AnswerLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #5B5FC7;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AnswerText = styled.div`
  font-size: 14px;
  color: #252423;
  line-height: 1.5;
`;

const InputSection = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e1dfdd;
  background: white;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const TextArea = styled.textarea`
  flex: 1;
  border: 1px solid #e1dfdd;
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;
  color: #252423;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #5B5FC7;
  }

  &::placeholder {
    color: #a19f9d;
  }
`;

const SendButton = styled.button`
  background: #5B5FC7;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #4A4FB0;
  }

  &:active {
    background: #3A3F9A;
  }

  &:disabled {
    background: #e1dfdd;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8A8886;
  text-align: center;
  padding: 48px 24px;

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

interface QAItem {
  id: string;
  author: string;
  question: string;
  timestamp: string;
  likes: number;
  hasAnswer: boolean;
  answer?: string;
}

interface QATabProps {
  transcript: any[];
}

const getAuthorColor = (author: string): string => {
  const colors = ['#5B5FC7', '#00897B', '#6264A7', '#C239B3', '#00B7C3', '#8764B8'];
  const index = author.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const getAuthorInitials = (author: string): string => {
  const words = author.trim().split(' ');
  if (words.length >= 2) return words[0][0] + words[1][0];
  return author.substring(0, 2);
};

export const QATab: React.FC<QATabProps> = ({ transcript }) => {
  const [questions, setQuestions] = useState<QAItem[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [likedQuestions, setLikedQuestions] = useState<Set<string>>(new Set());

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;

    const question: QAItem = {
      id: Date.now().toString(),
      author: 'You',
      question: newQuestion,
      timestamp: new Date().toISOString(),
      likes: 0,
      hasAnswer: false
    };

    // Add question to list
    setQuestions(prev => [...prev, question]);

    // Call backend to get AI answer
    try {
      const response = await fetch('http://localhost:8000/api/qa/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newQuestion,
          transcript: transcript.map(item => ({
            speaker: item.speaker,
            text: item.text,
            timestamp: item.timestamp || new Date().toISOString()
          }))
        })
      });

      const result = await response.json();

      if (result.answer) {
        // Update question with answer
        setQuestions(prev =>
          prev.map(q =>
            q.id === question.id
              ? { ...q, hasAnswer: true, answer: result.answer }
              : q
          )
        );
      }
    } catch (err) {
      console.error('Failed to get Q&A answer:', err);
    }

    setNewQuestion('');
  };

  const handleLike = (id: string) => {
    setLikedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        setQuestions(qs => qs.map(q => q.id === id ? { ...q, likes: q.likes - 1 } : q));
      } else {
        newSet.add(id);
        setQuestions(qs => qs.map(q => q.id === id ? { ...q, likes: q.likes + 1 } : q));
      }
      return newSet;
    });
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <Container>
      <QAList>
        {questions.length === 0 ? (
          <EmptyState>
            <div className="icon">❓</div>
            <h3>No questions yet</h3>
            <p>Ask a question about the meeting and get AI-powered answers</p>
          </EmptyState>
        ) : (
          questions.map(item => (
            <QuestionCard key={item.id}>
              <QuestionHeader>
                <Avatar color={getAuthorColor(item.author)}>
                  {getAuthorInitials(item.author)}
                </Avatar>
                <QuestionContent>
                  <QuestionMeta>
                    <AuthorName>{item.author}</AuthorName>
                    <Timestamp>{formatTime(item.timestamp)}</Timestamp>
                  </QuestionMeta>
                  <QuestionText>{item.question}</QuestionText>
                  <QuestionActions>
                    <ActionButton
                      $isActive={likedQuestions.has(item.id)}
                      onClick={() => handleLike(item.id)}
                    >
                      👍 {item.likes > 0 && item.likes}
                    </ActionButton>
                    <ActionButton>
                      💬 Reply
                    </ActionButton>
                  </QuestionActions>
                </QuestionContent>
              </QuestionHeader>

              {item.hasAnswer && item.answer && (
                <AnswerSection>
                  <AnswerLabel>🤖 AI Answer</AnswerLabel>
                  <AnswerText>{item.answer}</AnswerText>
                </AnswerSection>
              )}
            </QuestionCard>
          ))
        )}
      </QAList>

      <InputSection>
        <InputContainer>
          <TextArea
            placeholder="Ask a question about the meeting..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitQuestion();
              }
            }}
          />
          <SendButton onClick={handleSubmitQuestion} disabled={!newQuestion.trim()}>
            Send
          </SendButton>
        </InputContainer>
      </InputSection>
    </Container>
  );
};
