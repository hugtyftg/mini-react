// jsx pragma是一种编译器预处理指令，告诉编译器应该用什么方式处理该文件。'use strict'也是一种pragma
// customize jsx pragma有两种方式
// 1.配置Babel plugin options
// 2.手动在每个模块开头添加jsx pragma comment
/**@jsx CReact.createElement */
import CReact from './core/React.js';

// const App = React.createElement('div', { id: 'app' }, 'mini react application');
const App = <h1>hi mini react</h1>;
const AppOne = () => {
  return <h1>hi mini react</h1>;
};
console.log(AppOne);
// () => {
//   return /* @__PURE__ */ React.createElement("h1", null, "hi mini react");
// }
// () => {
//   return /* @__PURE__ */ CReact.createElement("h1", null, "hi mini react");
// }
export default App;
