import React, { Component } from 'react';
import { connect } from 'react-redux';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      position: { x: 0, y: 0 },
      isDragging: false
    }
  }

  componentDidMount() {
    this.demoBox.onmousedown = (e) => {
      this.setState({ isDragging: true });

      e.preventDefault();
    };

    document.onmousemove = (e) => {
      if (!this.state.isDragging) {
        return;
      }

      this.props.dispatch({ type: 'MOVE_BOX', payload: { x: e.clientX, y: e.clientY } });
    };

    document.onmouseup = (e) => {
      this.setState({ isDragging: false });
    }
  }

  onChangeMessageClick() {
    this.props.dispatch({ type: 'UPDATE_MESSAGE', payload: 'It changed!' });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          The message is: "{this.props.message}". Shiny!
        </p>
        <div>
          <button onClick={this.onChangeMessageClick.bind(this)}>Change the message!</button>
        </div>
        <div id="demo-box" ref={(box) => this.demoBox = box}
             style={{ left: this.props.boxPosition.x, top: this.props.boxPosition.y }}/>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  message: state.message,
  boxPosition: state.boxPosition
});

export default connect(mapStateToProps)(App);
