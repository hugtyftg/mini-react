import React from './core/React';
let countFoo = 1;
let showCount = false;
function Foo() {
  console.log('foo run');
  const update = React.update();
  function handleClick() {
    countFoo++;
    update();
    showCount = !showCount;
  }
  return (
    <div>
      <h1>Foo</h1>
      {countFoo}
      {showCount && 1}

      <button onClick={handleClick}>click</button>
    </div>
  );
}
let countBar = 1;
function Bar() {
  console.log('bar run');
  const update = React.update();
  function handleClick() {
    countBar++;
    update();
  }
  return (
    <div>
      <h1>Bar</h1>
      {countBar}
      <button onClick={handleClick}>click</button>
    </div>
  );
}
let countRoot = 1;
// 自动识别jsx语法
function App() {
  console.log('app run');
  const update = React.update();
  function handleClick() {
    countRoot++;
    update();
  }
  return (
    <div>
      hi-mini-react count: {countRoot}
      <button onClick={handleClick}>click</button>
      <Foo />
      <Bar />
    </div>
  );
}
export default App;
