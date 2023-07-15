import DataLoader from 'dataloader';
import type { CallMiddlewareHandler, Context } from 'moleculer';
import type { NotUndefined } from 'object-hash';
import hash from 'object-hash';
import pLimit from 'p-limit';

const dataLoaderMap = new WeakMap<
	Context,
	Map<string, DataLoader<NotUndefined, unknown, string>>
>();

/** Determine if the provided parameters match a batchable signature */
const isBatchableParams = <TKey extends string | number | symbol>(
	params: unknown,
	batchParam: TKey,
): params is { [key in TKey]: NotUndefined } =>
	typeof params === 'object' &&
	params != null &&
	batchParam in params &&
	(params as { [key in TKey]: unknown })[batchParam] != null;

/** Get the DataLoader map for the provided context */
const getContextMap = (ctx: Context) => {
	let contextMap = dataLoaderMap.get(ctx);
	if (contextMap == null) {
		contextMap = new Map();
		dataLoaderMap.set(ctx, contextMap);
	}
	return contextMap;
};

const callBatchingMiddleware = {
	call(next: CallMiddlewareHandler): CallMiddlewareHandler {
		return async (actionName, params, opts) => {
			if (opts.parentCtx == null || (opts.skipBatching != null && opts.skipBatching)) {
				// automatic batching is skipped for this call
				return next(actionName, params, opts);
			}

			const endpoint = opts.parentCtx.broker.registry.actions.get(actionName)?.endpoints[0];
			const actionSchema = endpoint != null && 'action' in endpoint ? endpoint.action : null;

			if (actionSchema?.autoBatching == null) {
				// the action is not configured for automatic batching
				return next(actionName, params, opts);
			}

			const {
				batchParam,
				options: { hashKey = false, maxParallelism = 4, maxBatchSize = 250 } = {},
			} = actionSchema.autoBatching;

			if (!isBatchableParams(params, batchParam)) {
				// the parameter structure does not contain the proper signature for batching
				return next(actionName, params, opts);
			}

			const { [batchParam]: batchParamValue, ...nonBatchingParams } = params;

			const contextMap = getContextMap(opts.parentCtx);
			// DataLoader instances are unique by the action name, the non-batching parameters, and the options meta
			const loaderKey = hash({ actionName, params: nonBatchingParams, meta: opts.meta });

			let loader: DataLoader<NotUndefined, unknown, string>;
			if (contextMap.has(loaderKey)) {
				loader = contextMap.get(loaderKey)!;
			} else {
				const limit = pLimit(maxParallelism);
				loader = new DataLoader<NotUndefined, unknown, string>(
					(keys) =>
						limit(() => next(actionName, { [batchParam]: keys, ...nonBatchingParams }, opts)),
					{ maxBatchSize, ...(hashKey && { cacheKeyFn: (key) => hash(key) }) },
				);
				contextMap.set(loaderKey, loader);
			}

			return Array.isArray(batchParamValue)
				? Promise.all(batchParamValue.map((key) => loader.load(key)))
				: loader.load(batchParamValue);
		};
	},
};

export default callBatchingMiddleware;
