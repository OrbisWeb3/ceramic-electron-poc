// [uuid]: { resolve, reject }
const CALLBACKS = {};

const registerCallback = (request_id, executionTimeout = 0) => {
  let resolve, reject, timeout;

  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  if (executionTimeout) {
    timeout = setTimeout(
      () =>
        reject(
          `Reached max execution time for request (${request_id}). Timeout: ${executionTimeout}s.`
        ),
      executionTimeout * 1000
    );
  }

  CALLBACKS[request_id] = { resolve, reject };

  return [promise, timeout];
};

const handleDeeplinkCallback = (_url, context) => {
  const url = new URL(_url);
  const rid = url.searchParams.get("request_id");

  if (!rid) {
    return;
  }

  const callback = CALLBACKS[rid];
  if (!callback) {
    return;
  }

  callback.resolve({
    request_id: rid,
    response: url.searchParams.get("response"),
  });
};

module.exports = { handleDeeplinkCallback, registerCallback };
