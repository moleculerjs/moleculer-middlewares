import { mockDeep } from 'jest-mock-extended';
import type { ActionSchema, Context, EndpointList } from 'moleculer';
import callBatchingMiddleware from '../callBatchingMiddleware';

describe('call', () => {
	const next = jest.fn();

	test('should return next with original arguments if skipBatching is true', async () => {
		next.mockResolvedValueOnce('result1');
		next.mockResolvedValueOnce('result2');

		const action = { endpoints: [{ action: {} }] } as EndpointList;
		const parentCtx = mockDeep<Context>();
		parentCtx.broker.registry.actions.get.mockReturnValueOnce(action);

		const actionName = 'test';
		const params = { test: 'test' };
		const opts = { skipBatching: true, parentCtx };

		const [result1, result2] = await Promise.all([
			callBatchingMiddleware.call(next)(actionName, params, opts),
			callBatchingMiddleware.call(next)(actionName, params, opts),
		]);

		expect(result1).toBe('result1');
		expect(result2).toBe('result2');
		expect(parentCtx.broker.registry.actions.get).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalledTimes(2);
		expect(next).toHaveBeenCalledWith(actionName, params, opts);
	});

	test('should return next with original arguments if parentCtx is undefined', async () => {
		next.mockResolvedValueOnce('result1');
		next.mockResolvedValueOnce('result2');

		const actionName = 'test';
		const params = { test: 'test' };
		const opts = {};

		const [result1, result2] = await Promise.all([
			callBatchingMiddleware.call(next)(actionName, params, opts),
			callBatchingMiddleware.call(next)(actionName, params, opts),
		]);

		expect(result1).toBe('result1');
		expect(result2).toBe('result2');
		expect(next).toHaveBeenCalledTimes(2);
		expect(next).toHaveBeenCalledWith(actionName, params, opts);
	});

	test('should return next with original arguments if action is not configured for automatic batching', async () => {
		next.mockResolvedValueOnce('result1');
		next.mockResolvedValueOnce('result2');

		const action = { endpoints: [{ action: {} }] } as EndpointList;
		const parentCtx = mockDeep<Context>();
		parentCtx.broker.registry.actions.get.mockReturnValueOnce(action);

		const actionName = 'test';
		const params = { test: 'test' };
		const opts = { parentCtx };

		const [result1, result2] = await Promise.all([
			callBatchingMiddleware.call(next)(actionName, params, opts),
			callBatchingMiddleware.call(next)(actionName, params, opts),
		]);

		expect(result1).toBe('result1');
		expect(result2).toBe('result2');
		expect(next).toHaveBeenCalledTimes(2);
		expect(next).toHaveBeenCalledWith(actionName, params, opts);
	});

	test('should return next with original arguments if params is not batchable', async () => {
		next.mockResolvedValueOnce('result1');
		next.mockResolvedValueOnce('result2');

		const action = {
			endpoints: [{ action: { autoBatching: { batchParam: 'foo' } } } as ActionSchema],
		} as EndpointList;

		const parentCtx = mockDeep<Context>();
		parentCtx.broker.registry.actions.get.mockReturnValue(action);

		const actionName = 'test';
		const params = { test: 'test' };
		const opts = { parentCtx };

		const [result1, result2] = await Promise.all([
			callBatchingMiddleware.call(next)(actionName, params, opts),
			callBatchingMiddleware.call(next)(actionName, params, opts),
		]);

		expect(result1).toBe('result1');
		expect(result2).toBe('result2');
		expect(next).toHaveBeenCalledTimes(2);
		expect(next).toHaveBeenCalledWith(actionName, params, opts);
	});

	test('should call next in batch mode with original arguments if context is different', async () => {
		next.mockResolvedValueOnce(['result1']);
		next.mockResolvedValueOnce(['result2']);

		const action = {
			endpoints: [{ action: { autoBatching: { batchParam: 'test' } } } as ActionSchema],
		} as EndpointList;

		const parentCtx1 = mockDeep<Context>();
		const parentCtx2 = mockDeep<Context>();
		parentCtx1.broker.registry.actions.get.mockReturnValueOnce(action);
		parentCtx2.broker.registry.actions.get.mockReturnValueOnce(action);

		const actionName = 'test';
		const params = { test: 'test' };
		const opts1 = { parentCtx: parentCtx1 };
		const opts2 = { parentCtx: parentCtx2 };

		const [result1, result2] = await Promise.all([
			callBatchingMiddleware.call(next)(actionName, params, opts1),
			callBatchingMiddleware.call(next)(actionName, params, opts2),
		]);

		expect(result1).toBe('result1');
		expect(result2).toBe('result2');
		expect(next).toHaveBeenCalledTimes(2);
		expect(next).toHaveBeenCalledWith(actionName, { test: ['test'] }, opts1);
		expect(next).toHaveBeenCalledWith(actionName, { test: ['test'] }, opts2);
	});

	test('should call next in batch mode with original arguments if non-batching argument properties are different', async () => {
		next.mockResolvedValueOnce(['result1']);
		next.mockResolvedValueOnce(['result2']);

		const action = {
			endpoints: [{ action: { autoBatching: { batchParam: 'test' } } } as ActionSchema],
		} as EndpointList;

		const parentCtx = mockDeep<Context>();
		parentCtx.broker.registry.actions.get.mockReturnValue(action);

		const actionName = 'test';
		const params1 = { test: 'test1', other1: 'other1' };
		const params2 = { test: 'test2', other2: 'other2' };
		const opts = { parentCtx };

		const [result1, result2] = await Promise.all([
			callBatchingMiddleware.call(next)(actionName, params1, opts),
			callBatchingMiddleware.call(next)(actionName, params2, opts),
		]);

		expect(result1).toBe('result1');
		expect(result2).toBe('result2');
		expect(next).toHaveBeenCalledTimes(2);
		expect(next).toHaveBeenCalledWith(actionName, { test: ['test1'], other1: 'other1' }, opts);
		expect(next).toHaveBeenCalledWith(actionName, { test: ['test2'], other2: 'other2' }, opts);
	});

	test('should call next in batch mode with original arguments if non-batching argument values are different', async () => {
		next.mockResolvedValueOnce(['result1']);
		next.mockResolvedValueOnce(['result2']);

		const action = {
			endpoints: [{ action: { autoBatching: { batchParam: 'test' } } } as ActionSchema],
		} as EndpointList;

		const parentCtx = mockDeep<Context>();
		parentCtx.broker.registry.actions.get.mockReturnValue(action);

		const actionName = 'test';
		const params1 = { test: 'test1', other: 'other1' };
		const params2 = { test: 'test2', other: 'other2' };
		const opts = { parentCtx };

		const [result1, result2] = await Promise.all([
			callBatchingMiddleware.call(next)(actionName, params1, opts),
			callBatchingMiddleware.call(next)(actionName, params2, opts),
		]);

		expect(result1).toBe('result1');
		expect(result2).toBe('result2');
		expect(next).toHaveBeenCalledTimes(2);
		expect(next).toHaveBeenCalledWith(actionName, { test: ['test1'], other: 'other1' }, opts);
		expect(next).toHaveBeenCalledWith(actionName, { test: ['test2'], other: 'other2' }, opts);
	});

	test('should call next in batch mode with original arguments if meta is different', async () => {
		next.mockResolvedValueOnce(['result1']);
		next.mockResolvedValueOnce(['result2']);

		const action = {
			endpoints: [{ action: { autoBatching: { batchParam: 'test' } } } as ActionSchema],
		} as EndpointList;

		const parentCtx = mockDeep<Context>();
		parentCtx.broker.registry.actions.get.mockReturnValue(action);

		const actionName = 'test';
		const params = { test: 'test' };
		const opts1 = { parentCtx };
		const meta2 = { foo: 'bar' };
		const opts2 = { parentCtx, meta: meta2 };

		const [result1, result2] = await Promise.all([
			callBatchingMiddleware.call(next)(actionName, params, opts1),
			callBatchingMiddleware.call(next)(actionName, params, opts2),
		]);

		expect(result1).toBe('result1');
		expect(result2).toBe('result2');
		expect(next).toHaveBeenCalledTimes(2);
		expect(next).toHaveBeenCalledWith(actionName, { test: ['test'] }, opts1);
		expect(next).toHaveBeenCalledWith(actionName, { test: ['test'] }, opts2);
	});

	test('should call next in batch mode with original arguments if action name is different', async () => {
		next.mockResolvedValueOnce(['result1']);
		next.mockResolvedValueOnce(['result2']);

		const action = {
			endpoints: [{ action: { autoBatching: { batchParam: 'test' } } } as ActionSchema],
		} as EndpointList;

		const parentCtx = mockDeep<Context>();
		parentCtx.broker.registry.actions.get.mockReturnValue(action);

		const actionName1 = 'test1';
		const actionName2 = 'test2';
		const params = { test: 'test' };
		const opts = { parentCtx };

		const [result1, result2] = await Promise.all([
			callBatchingMiddleware.call(next)(actionName1, params, opts),
			callBatchingMiddleware.call(next)(actionName2, params, opts),
		]);

		expect(result1).toBe('result1');
		expect(result2).toBe('result2');
		expect(next).toHaveBeenCalledTimes(2);
		expect(next).toHaveBeenCalledWith(actionName1, { test: ['test'] }, opts);
		expect(next).toHaveBeenCalledWith(actionName2, { test: ['test'] }, opts);
	});

	test('should return next with batched parameters if context is the same', async () => {
		next.mockResolvedValue(['result1', 'result2']);

		const action = {
			endpoints: [{ action: { autoBatching: { batchParam: 'test' } } } as ActionSchema],
		} as EndpointList;

		const parentCtx = mockDeep<Context>();
		parentCtx.broker.registry.actions.get.mockReturnValue(action);

		const actionName = 'test';
		const params1 = { test: 'test1' };
		const params2 = { test: 'test2' };
		const opts = { parentCtx };

		const [result1, result2] = await Promise.all([
			callBatchingMiddleware.call(next)(actionName, params1, opts),
			callBatchingMiddleware.call(next)(actionName, params2, opts),
		]);

		expect(result1).toBe('result1');
		expect(result2).toBe('result2');
		expect(next).toHaveBeenCalledTimes(1);
		expect(next).toHaveBeenCalledWith(actionName, { test: ['test1', 'test2'] }, opts);
	});

	test('should return next with batched parameters if context is the same and batchParam is an array', async () => {
		next.mockResolvedValue(['result1', 'result2', 'result3', 'result4']);

		const action = {
			endpoints: [{ action: { autoBatching: { batchParam: 'test' } } } as ActionSchema],
		} as EndpointList;

		const parentCtx = mockDeep<Context>();
		parentCtx.broker.registry.actions.get.mockReturnValue(action);

		const actionName = 'test';
		const params1 = { test: ['test1', 'test2'] };
		const params2 = { test: ['test3', 'test4'] };
		const opts = { parentCtx };

		const [result1, result2] = await Promise.all([
			callBatchingMiddleware.call(next)(actionName, params1, opts),
			callBatchingMiddleware.call(next)(actionName, params2, opts),
		]);

		expect(result1).toEqual(['result1', 'result2']);
		expect(result2).toEqual(['result3', 'result4']);
		expect(next).toHaveBeenCalledTimes(1);
		expect(next).toHaveBeenCalledWith(
			actionName,
			{ test: ['test1', 'test2', 'test3', 'test4'] },
			opts,
		);
	});

	test('should return next with batched parameters if context is the same and non-batching argument values are the same', async () => {
		next.mockResolvedValueOnce(['result1', 'result2']);

		const action = {
			endpoints: [{ action: { autoBatching: { batchParam: 'test' } } } as ActionSchema],
		} as EndpointList;

		const parentCtx = mockDeep<Context>();
		parentCtx.broker.registry.actions.get.mockReturnValue(action);

		const actionName = 'test';
		const params1 = { test: 'test1', other: 'other' };
		const params2 = { test: 'test2', other: 'other' };
		const opts = { parentCtx };

		const [result1, result2] = await Promise.all([
			callBatchingMiddleware.call(next)(actionName, params1, opts),
			callBatchingMiddleware.call(next)(actionName, params2, opts),
		]);

		expect(result1).toBe('result1');
		expect(result2).toBe('result2');
		expect(next).toHaveBeenCalledTimes(1);
		expect(next).toHaveBeenCalledWith(
			actionName,
			{ test: ['test1', 'test2'], other: 'other' },
			opts,
		);
	});

	test('should return next with cached parameters if context is the same', async () => {
		next.mockResolvedValue(['result']);

		const action = {
			endpoints: [{ action: { autoBatching: { batchParam: 'test' } } } as ActionSchema],
		} as EndpointList;

		const parentCtx = mockDeep<Context>();
		parentCtx.broker.registry.actions.get.mockReturnValue(action);

		const actionName = 'test';
		const params1 = { test: 'test' };
		const params2 = { test: 'test' };
		const opts = { parentCtx };

		const [result1, result2] = await Promise.all([
			callBatchingMiddleware.call(next)(actionName, params1, opts),
			callBatchingMiddleware.call(next)(actionName, params2, opts),
		]);

		expect(result1).toBe('result');
		expect(result2).toBe('result');
		expect(next).toHaveBeenCalledTimes(1);
		expect(next).toHaveBeenCalledWith(actionName, { test: ['test'] }, opts);
	});

	test('should return next with cached hashed parameters if context is the same', async () => {
		next.mockResolvedValue(['result']);

		const action = {
			endpoints: [
				{
					action: { autoBatching: { batchParam: 'test', options: { hashKey: true } } },
				} as ActionSchema,
			],
		} as EndpointList;

		const parentCtx = mockDeep<Context>();
		parentCtx.broker.registry.actions.get.mockReturnValue(action);

		const actionName = 'test';
		const params1 = { test: { prop: 'test' } };
		const params2 = { test: { prop: 'test' } };
		const opts = { parentCtx };

		const [result1, result2] = await Promise.all([
			callBatchingMiddleware.call(next)(actionName, params1, opts),
			callBatchingMiddleware.call(next)(actionName, params2, opts),
		]);

		expect(result1).toBe('result');
		expect(result2).toBe('result');
		expect(next).toHaveBeenCalledTimes(1);
		expect(next).toHaveBeenCalledWith(actionName, { test: [{ prop: 'test' }] }, opts);
	});
});
