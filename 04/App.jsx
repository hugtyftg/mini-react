import React from './core/React';

// const App = React.createElement(
//   'div',
//   { class: 'app', style: { color: 'red' } },
//   'this is app div'
// );
function Count({ num }) {
  return (
    <div className="count" style={{ color: 'blue' }}>
      Count: {num}
    </div>
  );
}
// 自动识别jsx语法
function App() {
  return (
    <div className="app" style={{ color: 'red' }}>
      this is app div
      <Count num={10} />
      <Count num={20} />
    </div>
  );
}
export default App;
