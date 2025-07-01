import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from './config';
import './App.css';
import qurenoteLogo from './assets/qurenote.svg';

// Custom Qurenote Logo Component
const QurenoteLogo = ({ sx = {}, context = 'default' }) => {
  const getClassName = () => {
    switch (context) {
      case 'header':
        return 'qurenote-logo-header';
      case 'message':
        return 'qurenote-logo-message';
      default:
        return 'qurenote-logo';
    }
  };

  return (
    <Box
      component="img"
      src={qurenoteLogo}
      alt="Qurenote Logo"
      className={getClassName()}
      sx={{
        width: 24,
        height: 24,
        ...sx
      }}
    />
  );
};

// Custom Typing Indicator Component
const TypingIndicator = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Typography variant="body2" color="text.secondary">
      Typing{dots}
    </Typography>
  );
};

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Generate session ID on component mount
  useEffect(() => {
    const newSessionId = `${config.SESSION_ID_PREFIX}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    setSessionId(newSessionId);
  }, []);

  // Ensure messages container starts at top on initial load
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, []);

  // Handle scroll position to show/hide scroll button
  const handleScroll = () => {
    if (messagesContainerRef.current && messages.length > 0) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    } else {
      setShowScrollButton(false);
    }
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: config.AUTO_SCROLL_BEHAVIOR,
        block: 'end'
      });
    }
  }, [messages, isLoading]);

  const getErrorMessage = (error) => {
    if (error.response?.status === 429) {
      return config.ERROR_MESSAGES.RATE_LIMIT;
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return config.ERROR_MESSAGES.TIMEOUT;
    } else if (error.response?.status >= 500) {
      return config.ERROR_MESSAGES.API_ERROR;
    } else if (!error.response) {
      return config.ERROR_MESSAGES.NETWORK_ERROR;
    }
    return error.response?.data?.error || config.ERROR_MESSAGES.UNKNOWN;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || inputMessage.length > config.MAX_MESSAGE_LENGTH) return;

    const userMessage = {
      id: Date.now(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      console.log('Sending request to:', `${config.API_BASE_URL}/chat`);
      const response = await axios.post(`${config.API_BASE_URL}/chat`, {
        sessionId,
        message: inputMessage
      }, {
        timeout: 30000 // 30 second timeout
      });

      const aiMessage = {
        id: Date.now() + 1,
        content: response.data.response,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        response: err.response,
        config: err.config
      });
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
    const newSessionId = `${config.SESSION_ID_PREFIX}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    setSessionId(newSessionId);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <QurenoteLogo sx={{ mr: 2 }} context="header" />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Urgent Care of Kansas
          </Typography>
          
          <IconButton 
            color="inherit" 
            onClick={clearChat}
            sx={{ ml: 1 }}
            title="New Chat"
          >
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Chat Container */}
      <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 2 }}>
        <Paper 
          elevation={2} 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Messages Area */}
          <Box 
            ref={messagesContainerRef}
            className={`messages-container ${messages.length > 0 ? 'has-messages' : ''}`}
            sx={{ 
              flexGrow: 1, 
              overflow: 'auto', 
              p: 2,
              maxHeight: 'calc(100vh - 200px)',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '4px',
                '&:hover': {
                  background: '#a8a8a8',
                },
              },
              scrollbarWidth: 'thin',
              scrollbarColor: '#c1c1c1 #f1f1f1',
            }}
            onScroll={handleScroll}
          >
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4, minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <QurenoteLogo sx={{ fontSize: 64, width: 64, height: 64, mb: 2 }} context="default" />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Welcome to Urgent Care of Kansas AI Assistant.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start a conversation by typing a message below
                </Typography>
              </Box>
            )}

            <List sx={{ p: 0, minHeight: '100%' }}>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  className="message-enter"
                  sx={{
                    flexDirection: 'column',
                    alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    px: 0,
                    py: 1
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      maxWidth: '70%',
                      gap: 1
                    }}
                  >
                    {message.sender === 'ai' && (
                      <QurenoteLogo sx={{ mt: 0.5 }} context="message" />
                    )}
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        backgroundColor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                        color: message.sender === 'user' ? 'white' : 'text.primary',
                        borderRadius: 2,
                        wordBreak: 'break-word',
                        maxWidth: '100%'
                      }}
                    >
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          opacity: 0.7, 
                          display: 'block', 
                          mt: 0.5 
                        }}
                      >
                        {formatTime(message.timestamp)}
                      </Typography>
                    </Paper>
                    {message.sender === 'user' && (
                      <PersonIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    )}
                  </Box>
                </ListItem>
              ))}
              
              {/* Loading indicator as a message bubble */}
              {isLoading && (
                <ListItem
                  className="message-enter"
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    px: 0,
                    py: 1
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      maxWidth: '70%',
                      gap: 1
                    }}
                  >
                    <QurenoteLogo sx={{ mt: 0.5 }} context="message" />
                    <Paper
                      elevation={1}
                      className="typing-indicator"
                      sx={{
                        p: 2,
                        backgroundColor: 'grey.100',
                        borderRadius: 2,
                        minWidth: 80,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <CircularProgress size={16} />
                      <TypingIndicator />
                    </Paper>
                  </Box>
                </ListItem>
              )}
            </List>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <div ref={messagesEndRef} style={{ height: '1px' }} />
            
            {/* Scroll to bottom button */}
            {showScrollButton && messages.length > 0 && (
              <Box
                className="scroll-button"
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  right: 20,
                  zIndex: 1000,
                }}
              >
                <IconButton
                  onClick={scrollToBottom}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    boxShadow: 3,
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                  size="small"
                >
                  <ArrowDownIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Input Area */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                disabled={isLoading}
                variant="outlined"
                size="small"
                inputProps={{
                  maxLength: config.MAX_MESSAGE_LENGTH
                }}
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading || inputMessage.length > config.MAX_MESSAGE_LENGTH}
                sx={{ minWidth: 56 }}
              >
                <SendIcon />
              </Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Press Enter to send, Shift+Enter for new line
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {inputMessage.length}/{config.MAX_MESSAGE_LENGTH}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default App;
