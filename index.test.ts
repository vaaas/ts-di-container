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
});
