import React from './core/React';
let num = 10;
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
      count:{num}
      <button
        onClick={() => {
          num++;
          update();
        }}
      >
        click
      </button>
    </div>
  );
}
function Foo() {
  console.log('foo');
  return <div className="foo">foo component</div>;
}
function App() {
  console.log('app');
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
      <Count />
      <Foo />
    </div>
  );
}

export default App;
