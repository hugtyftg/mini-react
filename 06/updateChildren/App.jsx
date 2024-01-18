import React from './core/React';
let showBar = false;
function Counter() {
  const foo = <div>foo</div>;
  const bar = <p>bar</p>;
  function handleShowbar() {
    showBar = !showBar;
    React.update();
  }
  return (
    <div>
      Counter
      <div>{showBar ? bar : foo}</div>
      <button onClick={handleShowbar}>showBar</button>
    </div>
  );
}
// 自动识别jsx语法
function App() {
  return (
    <div className="app" style={{ color: 'red' }}>
      hi mini react
      <Counter />
    </div>
  );
}
export default App;
