# AI Chat Assistant Frontend

A modern, responsive React chat interface that connects to your deployed serverless chat API.

## Features

- 🎨 **Modern UI**: Built with Material-UI for a clean, professional look
- 💬 **Real-time Chat**: Send messages and receive AI responses
- 🔄 **Session Management**: Automatic session ID generation and management
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- ⚡ **Fast & Smooth**: Optimized performance with smooth animations
- 🛡️ **Error Handling**: Comprehensive error handling and user feedback
- ⌨️ **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line
- 🔢 **Character Counter**: Shows message length and limits
- 🎯 **Auto-scroll**: Automatically scrolls to latest messages

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Your deployed serverless chat API

### Installation

1. **Clone or navigate to the frontend directory:**
   ```bash
   cd chat-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the API endpoint:**
   
   The app is pre-configured to use your deployed API. If you need to change the endpoint, edit `src/config.js`:
   ```javascript
   API_BASE_URL: 'https://your-api-gateway-url.amazonaws.com/prod'
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

### Environment Variables

Create a `.env` file in the root directory to override default settings:

```env
REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com/prod
```

### API Configuration

Edit `src/config.js` to customize:

- API endpoints
- Message limits
- UI behavior
- Error messages

## Usage

### Basic Chat

1. **Start a conversation**: Type your message in the input field
2. **Send messages**: Press Enter or click the send button
3. **New line**: Press Shift+Enter for multi-line messages
4. **New chat**: Click the refresh icon to start a fresh conversation

### Features

- **Session Management**: Each browser tab gets a unique session ID
- **Message History**: View your conversation history in the current session
- **Error Handling**: Clear error messages for network issues, rate limits, etc.
- **Loading States**: Visual feedback while waiting for AI responses

## API Integration

The frontend connects to your serverless chat API with these endpoints:

- **POST /chat**: Send a message and receive AI response
- **GET /health**: Check API health status

### Request Format

```json
{
  "sessionId": "session-1234567890-abc123",
  "message": "Hello, AI!"
}
```

### Response Format

```json
{
  "reply": "Hello! How can I help you today?",
  "sessionId": "session-1234567890-abc123",
  "responseTime": 1500,
  "tokens": 25
}
```

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

### Deploy to Static Hosting

You can deploy the built files to:

- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload the `build` folder to an S3 bucket
- **GitHub Pages**: Use `npm run deploy` (requires gh-pages package)

### Environment-Specific Builds

For different environments, create separate `.env` files:

- `.env.development` - Development settings
- `.env.production` - Production settings

## Customization

### Styling

- **Theme**: Modify Material-UI theme in `src/App.js`
- **CSS**: Edit `src/App.css` for custom styles
- **Colors**: Update the primary color in the theme

### Features

- **Message Formatting**: Add markdown support
- **File Upload**: Implement file sharing
- **Voice Messages**: Add audio recording
- **User Authentication**: Add login/logout functionality

## Troubleshooting

### Common Issues

1. **API Connection Error**
   - Check if your serverless API is deployed and running
   - Verify the API URL in `src/config.js`
   - Check CORS settings on your API

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

3. **Performance Issues**
   - Optimize bundle size with code splitting
   - Implement message pagination for long conversations

### Debug Mode

Enable debug logging by setting:

```javascript
// In src/config.js
DEBUG: true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review the API documentation
3. Open an issue on GitHub

---

**Happy chatting! 🤖💬**
