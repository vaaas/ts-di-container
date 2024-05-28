import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { ConstructionError, DIContainer } from './index.ts';

describe('ConstructionError', () => {
	it('creates an error with cause', () => {
		const cause = new Error('a cause');
		class Injectable {}
		const error = new ConstructionError(Injectable, cause);
		assert.equal(error.message, 'Error constructing Injectable');
		assert.equal(error.cause, cause);
	});

	it('creates errors for symbols', () => {
		const error = new ConstructionError(Symbol('test'), new Error('a cause'));
		assert.equal(error.message, 'Error constructing Symbol(test)');
	});

	it('creates errors for objects', () => {
		const error = new ConstructionError({}, new Error('a cause'));
		assert.equal(error.message, 'Error constructing [object Object]');
	});

	it('creates errors for null', () => {
		const error = new ConstructionError(null, new Error('a cause'));
		assert.equal(error.message, 'Error constructing null');
	});

	it('creates errors for undefined', () => {
		const error = new ConstructionError(undefined, new Error('a cause'));
		assert.equal(error.message, 'Error constructing undefined');
	});
});

describe('DIContainer', () => {
	class NoDependencies {}

	class HasDefaults {
		readonly a: boolean;
		readonly b: boolean;

		constructor(a=true, b=false) {
			this.a = a;
			this.b = b;
		}

		static dependencies() {
			return [];
		}
	}

	class DefaultsAndDependencies {
		readonly a: NoDependencies;
		readonly b: HasDefaults;
		readonly c: boolean;

		constructor(a: NoDependencies, b: HasDefaults, c = true) {
			this.a = a;
			this.b = b;
			this.c = c;
		}

		static dependencies() {
			return [
				NoDependencies,
				HasDefaults,
			];
		}
	}

	it('creates an instance of a class without dependencies', () => {
		const container = new DIContainer();
		const result = container.construct(NoDependencies);
		assert.equal(result instanceof NoDependencies, true);
	});

	it('creates an instance of a class with default values', () => {
		const container = new DIContainer();
		const result = container.construct(HasDefaults);
		assert.equal(result instanceof HasDefaults, true);
	});

	it('creates an instance of a class with defaults and dependencies', () => {
		const container = new DIContainer();
		const result = container.construct(DefaultsAndDependencies);
		assert.equal(result instanceof DefaultsAndDependencies, true);
	});

	it('creates an instance via a provider', () => {
		const RequestRandomNumber = Symbol();
		const result = new DIContainer()
			.provide(RequestRandomNumber, () => 4)
			.construct(RequestRandomNumber as any);
		assert.equal(result, 4);
	});

	it('overrides default construction with a provider', () => {
		const result = new DIContainer()
			.provide(NoDependencies, () => 'hello, world')
			.construct(DefaultsAndDependencies);
		assert.equal(result instanceof DefaultsAndDependencies, true);
		assert.equal(result.a, 'hello, world');
	});
});
