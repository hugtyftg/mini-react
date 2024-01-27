import React from './core/React';
let num = 10;
let showNum: boolean = false;
let showComponent: boolean = false;
function Count() {
  console.log('count');

  const update = React.update();
  return (
    <div
      className="count"
      style={{
        fontStyle: 'italic',
        textAlign: 'center',
      }}
    >
      count:{showNum && num}
      <button
        onClick={() => {
          num++;
          showNum = !showNum;
          update();
        }}
      >
        click
      </button>
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
  console.log('app');
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
      {/* <Count /> */}
    </div>
  );
}

export default App;
