/**
 * injectable classes must provide a static `dependencies` method
 *
 * the dependencies are in turn other injectable classes
 */
export interface Injectable {
	new (...xs: any[]): any;
	dependencies?: () => Array<Injectable> | ReadonlyArray<Injectable>;
}

/**
 * Dependency Injection Container - use `DIContainer.construct` to create an instance of an object, automatically wiring dependencies into its `constructor`.
 *
 * Injectable classes objects must provide the `dependencies` static method that returns an array of Injectables that will be passed onto the constructor after initialisation.
 *
 * Every constructed instance will be registered in the container, so it is only initialised once (Singletons).
 *
 * Only synchronous construction is supported.
 *
 * You can manually register injectables using `DIContainer.register`. This is primarily useful for registering injectables that are constructed asynchronously.
 *
 * @see Injectable
 * @see https://en.wikipedia.org/wiki/Dependency_injection
 * @see https://stackoverflow.com/questions/50718586/what-is-a-di-container
 *
 * @example
 * class SomeRepository {
 * 	constructor() {} // no dependencies
 * }
 *
 * class SomeService {
 * 	constructor(repo: SomeRepository) {
 * 		this.repo = repo;
 *    }
 *
 * 	static dependencies() {
 * 		return [
 * 			SomeRepository,
 * 		];
 * 	}
 * }
 *
 * const container = new DIContainer();
 * const servicie = container.construct(SomeService);
 */
export class DIContainer {
	private instances: Map<any, InstanceType<Injectable>>;

	constructor() {
		this.instances = new Map();
	}

	/**
	 * register an instance in the container to be used while constructing
	 *
	 * @param key the key to look up to reference the instance. Usually, you want the pointer to the instance's class itself.
	 * @param value the instance you want to register
	 * @returns DIContainer (supports method chaining)
	 */
	register(key: any, value: InstanceType<Injectable>): DIContainer {
		this.instances.set(key, value);
		return this;
	}

	/**
	 * construct an instance of an object, automatically wiring dependencies into its `constructor`
	 *
	 * note that dependencies must be returned by its static `dependencies` method, otherwise none will be wired
	 *
	 * @param object the class to be instantiated
	 * @returns an instance of that class
	 * @throws ConstructionError if construction fails for any reason
	 */
	construct<T extends Injectable>(object: T): InstanceType<T> {
		try {
			if (this.instances.has(object))
				return this.instances.get(object);
			const dependencies: any[] =
				object.dependencies
				? object.dependencies().map((x: any) => this.construct(x))
				: [];
			const instance = new object(...dependencies);
			this.register(object, instance);
			return instance;
		} catch (e) {
			throw new ConstructionError(object, e as Error);
		}
	}
}

export class ConstructionError extends Error {
	constructor(x: Injectable, cause: Error) {
		super('Error constructing ' + x.name, { cause });
	}
}
