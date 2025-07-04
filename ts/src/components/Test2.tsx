import React from '../core/React';
const { useState, useRef, useEffect } = React;

const Test2 = () => {
  const [value, setValue] = useState('defaultValue');
  const btnRef = useRef(0);
  const changeHandler = (event) => {
    setValue(event.target.value);
  };
  useEffect(() => {
    console.log(btnRef.current);
    // 初次执行时创建，仅用当时的闭包
    const clickHandler = () => {
      console.log(value);
    };

    btnRef.current.addEventListener('click', clickHandler);

    return () => {
      btnRef.current.removeEventListener('click', clickHandler);
    };
  }, []);
  return (
    <>
      <input value={value} onChange={changeHandler} />
      <button ref={btnRef}>test</button>
    </>
  );
};

export default Test2;
