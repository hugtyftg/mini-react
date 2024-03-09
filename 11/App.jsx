import React from './core/React';
// useEffect调用时机是React渲染真实DOM之后，并且浏览器完成重新绘制之前
// cleanup在调用useEffect之前进行调用，mini react限制当deps为空的时候不会调用返回的cleanup
function Foo() {
  console.log('foo function component');
  const [count, setCount] = React.useState(0);
  const [bar, setBar] = React.useState('bar');
  const ref = React.useRef(0);
  console.log('ref:', ref.current);

  function changeRef() {
    ref.current = 2;
    console.log('changing ref will not cause UI updation', ref.current);
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

  let memo = React.useMemo(() => {
    return 'memo:' + count;
  }, [count]);
  // ref.current是不可变值，不可以作为useEffect的依赖数组
  React.useEffect(() => {
    console.log('ref in effect', ref.current);
  }, [ref.current]);
  console.log(memo);
  return (
    <div>
      <h1>Foo</h1>
      <div>{bar}</div>
      {count}
      <button
        onClick={() => {
          setCount((count) => count + 1);
        }}
      >
        change count state
      </button>
      <button
        onClick={() => {
          setBar((bar) => bar + 'bar');
        }}
      >
        change bar state
      </button>

      <button onClick={changeRef}>change ref</button>
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
