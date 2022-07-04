const queues: any[] = [];
let isFlushPending = false;
const p = Promise.resolve();

export function queueJobs(job) {
  if (!queues.includes(job)) {
    queues.push(job);
  }
  queueFlush();
}

export function nextTick(fn) {
  return fn ? p.then(fn) : p;
}

function queueFlush() {
  if (isFlushPending) return;
  isFlushPending = true;
  nextTick(flushJobs);
}
function flushJobs(): any {
  isFlushPending = false;
  let job;
  while ((job = queues.shift())) {
    job && job();
  }
}
