import React from './core/React';
let showBar = false;
function Counter() {
  const foo = (
    <div>
      foo
      <div>child1</div>
      <div>child2</div>
    </div>
  );
  const bar = <div>bar</div>;
  function handleShowbar() {
    showBar = !showBar;
    React.update();
  }
  return (
    <div>
      Counter
      {showBar && bar}
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
