import React from './core/React';
let countFoo = 1;
// useEffect调用时机是React渲染真实DOM之后，并且浏览器完成重新绘制之前
// cleanup在调用useEffect之前进行调用，mini react限制当deps为空的时候不会调用返回的cleanup
function Foo() {
  console.log('foo');
  const [count, setCount] = React.useState(0);
  const [bar, setBar] = React.useState('bar');
  function handleClick() {
    setCount((count) => count + 1);
    setBar((bar) => bar + 'bar');
    // setBar((bar) => 'bar');
  }
  React.useEffect(() => {
    console.log('init');
    return () => {
      console.log('cleanup 1');
    };
  }, []);
  React.useEffect(() => {
    console.log('update', count);
    return () => {
      console.log('cleanup 2');
    };
  }, [count]);
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
