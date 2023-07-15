export { default as callBatchingMiddleware } from './callBatchingMiddleware';

declare module 'moleculer' {
	interface ActionSchemaAutoBatchingOptions {
		/**
		 * Should the key be hashed for the DataLoader cache
		 * Set to true if the key is an object
		 * @default false
		 */
		hashKey?: boolean;
		/**
		 * The maximum number of parallel calls to the action
		 * @default 4
		 */
		maxParallelism?: number;
		/**
		 * The maximum number of keys to pass to the action in a single call
		 * @default 250
		 */
		maxBatchSize?: number;
	}

	interface ActionSchemaAutoBatching {
		batchParam: string;
		options?: ActionSchemaAutoBatchingOptions;
	}

	interface ActionSchema {
		/** Definitions to allow for automatic batching of action calls */
		autoBatching?: ActionSchemaAutoBatching;
	}

	interface CallingOptions {
		/**
		 * Skip automatic batching of action call
		 * @default false
		 */
		skipBatching?: boolean;
	}
}
