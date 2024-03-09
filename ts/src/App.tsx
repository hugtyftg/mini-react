import React from './core/React';
let showComponent: boolean = false;
function Count() {
  // 只更新一次，批处理机制
  console.log('count component');
  // 惰性初始化
  const [num, setNum] = React.useState(() => 0);
  const [str, setStr] = React.useState('str');
  // const ref = React.useRef(true);
  // function clickHandler() {
  //   // setNum((num: number) => num + 1);
  //   // setNum((num: number) => num + 1);
  //   // setNum((num: number) => num + 1);
  //   // 异步批处理+闭包
  //   setStr((str: string) => str + 'str');
  //   setNum(num + 1);
  //   setNum(num + 1);
  //   setNum(num + 1);
  //   // ref.current的改变不引起视图的重新渲染
  //   // ref.current = false;
  // }
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
  const memoValue = React.useMemo(() => {
    return num + 1;
  }, [num]);
  console.log(memoValue);

  return (
    <div
      className="count"
      style={{
        width: '300px',
        height: '300px',
        backgroundColor: 'pink',
        textAlign: 'center',
        border: '1px solid black',
        margin: '30px auto',
      }}
    >
      <h2>Count Component</h2>
      count:{num}
      <br />
      str:{str}
      <br />
      {/* <button onClick={clickHandler}>click</button> */}
      <button
        onClick={() => {
          setNum(num + 1);
        }}
      >
        change num
      </button>
      <button
        onClick={() => {
          setStr((str: string) => str + 'str');
        }}
      >
        change str
      </button>
      <p>memorized value: {memoValue}</p>
    </div>
  );
}
function Foo() {
  return (
    <div
      className="foo"
      style={{
        width: '300px',
        backgroundColor: 'lightgray',
        textAlign: 'center',
        border: '1px solid black',
        margin: '10px auto',
      }}
    >
      foo component
    </div>
  );
}
function Bar() {
  return (
    <div
      className="bar"
      style={{
        width: '300px',
        backgroundColor: 'lightgreen',
        textAlign: 'center',
        border: '1px solid black',
        margin: '10px auto',
      }}
    >
      bar component
    </div>
  );
}
function App() {
  console.log('app component');
  const update = React.update();
  return (
    <div
      id="app"
      style={{
        textAlign: 'center',
        backgroundColor: 'lightblue',
        border: '1px solid black',
      }}
    >
      <h1
        style={{
          color: 'white',
          textAlign: 'center',
          fontSize: '50px',
        }}
      >
        App Component
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
