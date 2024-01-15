// jsx pragma是一种编译器预处理指令，告诉编译器应该用什么方式处理该文件。'use strict'也是一种pragma
// customize jsx pragma有两种方式
// 1.配置Babel plugin options
// 2.手动在每个模块开头添加jsx pragma comment
/**@jsx CReact.createElement */
import CReact from './core/React.js';
function Count() {
  return <div>Count</div>;
}
function CountContainer() {
  return (
    <div>
      Container Content:
      <Count />
    </div>
  );
}
const App = (
  <h1>
    hi mini react
    <CountContainer />
  </h1>
);

export default App;
