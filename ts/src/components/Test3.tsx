import React from '../core/React';

function Foo() {
  React.useEffect(() => {
    console.log('foo');
  }, []);
  return <div>foo</div>;
}
function Bar() {
  React.useEffect(() => {
    console.log('bar');
  }, []);
  return <div>bar</div>;
}
export { Foo, Bar };
