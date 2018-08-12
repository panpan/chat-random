import React from 'react';
import PropTypes from 'prop-types';
import socketIOClient from 'socket.io-client';
import shortid from 'shortid';

import '../styles/Chat.css';

export default class Chat extends React.Component {
  socket = process.env.NODE_ENV === 'production'
    ? socketIOClient.connect()
    : socketIOClient('localhost:3000');

  static propTypes = { username: PropTypes.string.isRequired };

  state = {
    inputText: '',
    messages: [],
  }

  componentDidMount() {
    const { username } = this.props;
    this.socket.emit('join', username);
    this.socket.on('message', this.receiveMessage);
  }

  componentDidUpdate() {
    this.scrollToEnd();
  }

  componentWillUnmount() {
    this.socket.off('message');
  }

  receiveMessage = message => {
    const { messages } = this.state;
    this.setState({ messages: [...messages, message] });
  }

  scrollToEnd = () => {
    this.msgs.scrollTo(0, this.msgs.scrollHeight);
  }

  handleChange = e => {
    this.setState({ inputText: e.target.value });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { username } = this.props;
    const { inputText } = this.state;
    const text = inputText.trim();
    if (text === '/hop') {
      this.handleHop();
    } else if (text.startsWith('/delay ')) {
      this.handleDelay(text);
    } else if (text) {
      this.sendMessage({ username, text });
    }
    this.setState({ inputText: '' });
  };

  handleHop = () => {
    const { username } = this.props;
    this.setState({ messages: [] }, () => this.socket.emit('hop', username));
  }

  handleDelay = text => {
    const { username } = this.props;
    const delay = Number(text.split(' ')[1]);
    if (!Number.isNaN(delay)) {
      const delayedText = text.split(' ').slice(2).join(' ');
      setTimeout(() => this.sendMessage({ username, text: delayedText }), delay * 1000);
    } else {
      this.sendMessage({ username, text });
    }
  }

  sendMessage = message => this.socket.emit('message', message);

  render() {
    const { inputText, messages } = this.state;

    return (
      <div className='chat'>
        <h1>&#9787;</h1>

        <div className='messages' ref={msgs => { this.msgs = msgs; }}>
          {messages.map((message, idx) => (
            <p key={shortid.generate()}>
              {message.username ? (
                <span>
                  {message.username !== messages[idx - 1].username && <span className='username'>{message.username}: </span>}
                  {message.text}
                </span>
              ) : <span className='server-msg'>{message.text}</span>
              }
            </p>
          ))}
        </div>

        <form onSubmit={this.handleSubmit} autoComplete='off'>
          <label htmlFor='message'>message</label>
          <input
            type='text'
            id='message'
            value={inputText}
            onChange={this.handleChange}
          />
          <input type='submit' value='send' />
        </form>
      </div>
    );
  }
}
