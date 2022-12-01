import workerJS from "file-loader?name=[name].js!@/prototypes/functions/execute/worker.js";

/**
 * @see https://stackoverflow.com/questions/10653809/making-webworkers-a-safe-environment/10796616
 */
export function _execute(script: string, variables: { [key: string]: unknown; } = {}) {
	return new Promise((resolve, reject) => {
		// cache
		let timeout: NodeJS.Timeout

		const worker = new Worker(workerJS);

		worker.addEventListener("message", (event) => {
			if (event.data instanceof Error) {
				return reject();
			}
			else {
				worker.terminate();
				clearTimeout(timeout);
				return resolve(event.data);
			}
		});

		worker.postMessage({ script: script, variables: variables });

		timeout = setTimeout(() => { worker.terminate(); return reject(); }, 1000 * 60);
	});
}

Object.defineProperty(window, "execute", { value: _execute });
