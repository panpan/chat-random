import React from 'react';
import PropTypes from 'prop-types';

import '../styles/Welcome.css';

export default class Welcome extends React.Component {
  static propTypes = { setUsername: PropTypes.func.isRequired };

  state = { input: '' };

  handleChange = e => {
    this.setState({ input: e.target.value });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { input } = this.state;
    const username = input.trim();

    if (username) {
      const { setUsername } = this.props;
      setUsername(username);
    }
  }

  render() {
    const { input } = this.state;

    return (
      <div className='welcome'>
        <h1>welcome to random chat!</h1>
        <p>enter a username to begin:</p>

        <form onSubmit={this.handleSubmit} autoComplete='off'>
          <label htmlFor='username'>username</label>
          <input
            type='text'
            id='username'
            value={input}
            onChange={this.handleChange}
          />
          <input type='submit' value='submit' />
        </form>
      </div>
    );
  }
}
