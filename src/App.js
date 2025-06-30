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
  SmartToy as AIIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from './config';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  // Generate session ID on component mount
  useEffect(() => {
    const newSessionId = `${config.SESSION_ID_PREFIX}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    setSessionId(newSessionId);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: config.AUTO_SCROLL_BEHAVIOR });
  }, [messages]);

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
        content: response.data.reply,
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
          <AIIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Chat Assistant
          </Typography>
          <Chip 
            label={`Session: ${sessionId.substring(0, 8)}...`} 
            size="small" 
            variant="outlined" 
            sx={{ color: 'white', borderColor: 'white' }}
          />
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
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AIIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Welcome to AI Chat Assistant
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start a conversation by typing a message below
                </Typography>
              </Box>
            )}

            <List sx={{ p: 0 }}>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
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
                      <AIIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    )}
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        backgroundColor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                        color: message.sender === 'user' ? 'white' : 'text.primary',
                        borderRadius: 2,
                        wordBreak: 'break-word'
                      }}
                    >
                      <Typography variant="body1">
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
            </List>

            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <div ref={messagesEndRef} />
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
