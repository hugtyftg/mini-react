import React from './core/React';

// const App = React.createElement(
//   'div',
//   { class: 'app', style: { color: 'red' } },
//   'this is app div'
// );
// 自动识别jsx语法
const App = (
  <div className="app" style={{ color: 'red' }}>
    this is app div
  </div>
);
export default App;
