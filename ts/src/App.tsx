import React from './core/React';
let num = 10;
let showFoo = true;
function Count() {
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
function App() {
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
    </div>
  );
}

export default App;
