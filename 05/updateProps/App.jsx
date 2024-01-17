import React from './core/React';

// const App = React.createElement(
//   'div',
//   { class: 'app', style: { color: 'red' } },
//   'this is app div'
// );
let count = 10;
let props = { id: '1111' };
function Count() {
  const clickHandler = () => {
    count++;
    props = {};
    React.update();
  };
  return (
    <div {...props}>
      Count: {count}
      <button onClick={clickHandler}>click me</button>
    </div>
  );
}
// 自动识别jsx语法
function App() {
  return (
    <div className="app" style={{ color: 'red' }}>
      hi mini react
      <Count />
    </div>
  );
}
export default App;
