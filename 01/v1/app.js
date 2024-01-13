import React from './core/React.js';

const App = React.createElement(
  'div',
  {
    id: 'app',
    className: '1',
    style: {
      color: 'white',
      backgroundColor: 'gray',
      fontWeight: 'bolder',
      fontSize: '40px',
    },
  },
  'mini react application',
  '!!'
);

export default App;
