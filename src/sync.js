// const SERVER_MESSAGE_MARKER = '@@FROM_SERVER';
//
// const REDUX_INIT_ACTION = '@@INIT';
// const SET_STATE_ACTION = '@@SET_STATE';
//
// // A browser-compatible event emitter
// // stolen from https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
// const EventTarget = function () {
//   this.listeners = {};
// };
//
// EventTarget.prototype.listeners = null;
// EventTarget.prototype.addEventListener = function (type, callback) {
//   if (!(type in this.listeners)) {
//     this.listeners[type] = [];
//   }
//   this.listeners[type].push(callback);
// };
//
// EventTarget.prototype.on = EventTarget.prototype.addEventListener;
//
// EventTarget.prototype.removeEventListener = function (type, callback) {
//   if (!(type in this.listeners)) {
//     return;
//   }
//
//   let stack = this.listeners[type];
//   for (let i = 0, l = stack.length; i < l; i++) {
//     if (stack[i] === callback) {
//       stack.splice(i, 1);
//       return;
//     }
//   }
// };
//
// EventTarget.prototype.dispatchEvent = function (event) {
//   if (!(event.type in this.listeners)) {
//     return true;
//   }
//
//   let stack = this.listeners[event.type];
//   event.target = this;
//   for (let i = 0, l = stack.length; i < l; i++) {
//     stack[i].call(this, event);
//   }
//
//   return !event.defaultPrevented;
// };
//
// export default class SyncClient extends EventTarget {
//   constructor(port = 9090) {
//     super();
//
//     this._socket = new WebSocket('ws://localhost:' + port);
//
//     this._socket.onmessage = event => this.handleMessage(event.data);
//   }
//
//   synchronize(store, roomId) {
//     this._store = store;
//
//     this._socket.onopen = () => {
//       this._socket.send(JSON.stringify({ type: 'JOIN_ROOM', payload: roomId }));
//     }
//   }
//
//   loadInitialStateFromMaster() {
//     const message = { type: 'REQUEST_STATE' };
//
//     this._socket.send(JSON.stringify(message));
//   }
//
//   handleMessage(message) {
//     console.log(message);
//
//     const action = JSON.parse(message);
//
//     switch (action.type) {
//       case 'HEARTBEAT':
//         console.log(JSON.stringify(action.payload));
//         this._isMaster = action.payload.isMaster;
//         break;
//
//       case 'JOIN_SUCCESSFUL':
//         this._isMaster = action.payload.isMaster;
//         this.dispatchEvent({ type: 'connect' });
//
//         break;
//
//       case 'REMOTE_ACTION':
//         this.dispatchRemoteAction(action.payload);
//         break;
//
//       case 'REQUEST_STATE':
//         this.sendLocalStateToServer();
//         break;
//
//       case 'SET_STATE':
//         this.overwriteLocalState(action.payload);
//         break;
//
//       default:
//         console.log('Warning: unknown message type received from server');
//     }
//   }
//
//   dispatchRemoteAction(action) {
//     action[SERVER_MESSAGE_MARKER] = true;
//
//     console.log('RECEIVED', JSON.stringify(action));
//
//     this.dispatchEvent({ type: 'remoteAction', remoteAction: action });
//   }
//
//   sendLocalStateToServer() {
//     const packet = {
//       type: 'SET_STATE',
//       payload: this._store.getState()
//     };
//
//     this._socket.send(JSON.stringify(packet));
//   }
//
//   sendLocalActionToServer(action) {
//     if (action.type === REDUX_INIT_ACTION || action.type === SET_STATE_ACTION) return;
//     if (action[SERVER_MESSAGE_MARKER]) return;
//
//     console.log('SENDING', action);
//
//     const packet = {
//       type: 'SEND_ACTION',
//       payload: action
//     };
//
//     this._socket.send(JSON.stringify(packet));
//   }
//
//   overwriteLocalState(state) {
//     const action = {
//       type: SET_STATE_ACTION,
//       payload: state
//     };
//
//     this._store.dispatch(action);
//   }
//
//   get middleware() {
//     return store => next => action => {
//       this.sendLocalActionToServer(action);
//
//       const actionResult = next(action);
//
//       if (this._isMaster) {
//         this.sendLocalStateToServer();
//       }
//
//       return actionResult;
//     };
//   }
//
//   get isMaster() {
//     return this._isMaster;
//   }
//
//   get hasMaster() {
//     return !this.isMaster;
//   }
// }
//
// export function synchronizedReducer(appReducer) {
//   return (state, action) => {
//     if (action.type === SET_STATE_ACTION) {
//       return action.payload;
//     } else {
//       return appReducer(state, action);
//     }
//   };
// }