import React from './core/React';
let showComponent: boolean = false;
function Count() {
  // 只更新一次，批处理机制
  console.log('count component');
  // 惰性初始化
  const [num, setNum] = React.useState(() => 0);
  const [str, setStr] = React.useState('str');
  // const ref = React.useRef(true);
  function clickHandler() {
    // setNum((num: number) => num + 1);
    // setNum((num: number) => num + 1);
    // setNum((num: number) => num + 1);
    // 异步批处理+闭包
    setStr((str: string) => str + 'str');
    setNum(num + 1);
    setNum(num + 1);
    setNum(num + 1);
    // ref.current的改变不引起视图的重新渲染
    // ref.current = false;
  }
  React.useEffect(() => {
    console.log('init effect');
    return () => {
      console.log('cleanup 1');
    };
  }, []);
  React.useEffect(() => {
    console.log('num update effect');
    return () => {
      console.log('cleanup 2');
    };
  }, [num]);
  return (
    <div
      className="count"
      style={{
        fontStyle: 'italic',
        textAlign: 'center',
      }}
    >
      count:{num}
      <br />
      str:{str}
      <br />
      <button onClick={clickHandler}>click</button>
    </div>
  );
}
function Foo() {
  return <div className="foo">foo component</div>;
}
function Bar() {
  return <div className="bar">bar component</div>;
}
function App() {
  console.log('app component');
  const update = React.update();
  return (
    <div id="app">
      <h1
        style={{
          color: 'white',
          backgroundColor: 'lightblue',
          textAlign: 'center',
          fontSize: '50px',
        }}
      >
        mini react
      </h1>
      <p style={{ textAlign: 'center', fontSize: '20px' }}>
        typescript version
      </p>
      <div
        className="sub-components"
        style={{
          textAlign: 'center',
        }}
      >
        {showComponent && <Foo />}
        {showComponent && <Bar />}
        {'aa'}
      </div>

      <button
        onClick={() => {
          showComponent = !showComponent;
          update();
        }}
      >
        show two components
      </button>
      <Count />
    </div>
  );
}

export default App;
