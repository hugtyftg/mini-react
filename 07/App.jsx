import React from './core/React';
let countFoo = 1;
function Foo() {
  console.log('foo');
  const [count, setCount] = React.useState(0);
  const [bar, setBar] = React.useState('bar');
  function handleClick() {
    // setCount((count) => count + 1);
    setBar((bar) => 'bar');
  }
  return (
    <div>
      <h1>Foo</h1>
      <div>{bar}</div>
      {count}
      <button onClick={handleClick}>click</button>
    </div>
  );
}

// 自动识别jsx语法
function App() {
  return (
    <div>
      hi-mini-react count
      <Foo />
    </div>
  );
}
export default App;
