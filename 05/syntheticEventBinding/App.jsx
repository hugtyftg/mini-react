import React from './core/React';

// const App = React.createElement(
//   'div',
//   { class: 'app', style: { color: 'red' } },
//   'this is app div'
// );
function Btn() {
  const clickHandler = () => {
    console.log('1111');
  };
  return <button onClick={clickHandler}>click me</button>;
}
function Count({ num }) {
  return (
    <div className="count" style={{ color: 'blue' }}>
      Count: {num}
      <Btn />
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
