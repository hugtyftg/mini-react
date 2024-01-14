let taskId = 1;
function workLoop(deadline) {
  taskId++;
  let shouldYield = false;
  while (!shouldYield) {
    console.log(`taskId: ${taskId}`);

    // render dom during browser rest period

    // 剩余时间小于1ms的时候不再安排DOM渲染任务
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
