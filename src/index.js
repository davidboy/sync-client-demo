import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

import { applyMiddleware, compose, createStore } from 'redux';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise';

import { SyncClient, createSynchronizedReducer } from 'paragon-sync-client';

const client = new SyncClient({
  room: 'blablabla',
  synchronizedActions: ['MOVE_BOX'],
  synchronizedState: ['box_position']
});

const middleware = compose(
  applyMiddleware(reduxThunk, promiseMiddleware, client.middleware),
  window.devToolsExtension ? window.devToolsExtension() : f => f
);

const DEFAULT_STATE = {
  message: 'Hello world',
  boxPosition: { x: 0, y: 0 }
};

const reducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'UPDATE_MESSAGE':
      return Object.assign({}, state, { message: action.payload });
    case 'MOVE_BOX':
      return Object.assign({}, state, { boxPosition: action.payload });
    default:
      return state;
  }
};

const store = createStore(createSynchronizedReducer(reducer), middleware);
client.synchronize(store);

client.on('connect', () => {
  if (client.hasMaster) {
    client.loadInitialStateFromMaster();
  }
});

ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));
registerServiceWorker();
