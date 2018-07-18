import React from 'react';

import Welcome from './Welcome';
import Chat from './Chat';
import '../styles/App.css';

export default class App extends React.Component {
  state = { username: '' };

  setUsername = username => {
    this.setState({ username });
  }

  render() {
    const { username } = this.state;

    return (
      <div>
        {username
          ? <Chat username={username} />
          : <Welcome setUsername={this.setUsername} />}
      </div>
    );
  }
}
