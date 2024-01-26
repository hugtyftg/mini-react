import React from './core/React';
type CountType = {
  num: number;
};
function Count({ num }: CountType) {
  return (
    <div
      className="count"
      style={{
        fontStyle: 'italic',
        textAlign: 'center',
      }}
    >
      count:{num}
    </div>
  );
}
const App = (
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
    <p style={{ textAlign: 'center', fontSize: '20px' }}>typescript version</p>
    <Count num={10} />
  </div>
);

export default App;
