/**
 * injectable classes must provide a static `dependencies` method
 *
 * the dependencies are in turn other injectable classes or symbols that can be resolved to instances
 */
export interface Injectable {
	new (...xs: any[]): any;
	dependencies?: () => Array<any> | ReadonlyArray<any>;
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
 * You can manually register injectables using `DIContainer.add`. This is primarily useful for registering injectables that are constructed asynchronously.
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
 * 	}
 *
 * 	static dependencies() {
 * 		return [
 * 			SomeRepository,
 * 		];
 * 	}
 * }
 *
 * const container = new DIContainer();
 * const service = container.construct(SomeService);
 *
 * @example
 * const container = new DIContainer();
 * container.provide(SomeRepository, () => 'arbitrary');
 * const service = container.construct(SomeService);
 * // service.repo === 'arbitrary';
 */
export class DIContainer {
	private instances: Map<any, any>;
	private providers: Map<any, () => any>;

	constructor() {
		this.instances = new Map();
		this.providers = new Map();
	}

	/**
	 * register an instance in the container to be used while constructing
	 *
	 * @param key the key to look up to reference the instance. Usually, you want the pointer to the instance's class itself.
	 * @param value the instance you want to register
	 * @returns DIContainer (supports method chaining)
	 */
	add(key: any, value: any): DIContainer {
		this.instances.set(key, value);
		return this;
	}

	/**
	 * register a provider function in the container to be used while constructing
	 *
	 * if a provider exists for a requested key, the provider will be called instead of the regular construction logic
	 *
	 * @param key the key to look up to reference the provider
	 * @param value the provider function you want to register
	 * @returns DIContainer (supports method chaining)
	 */
	provide(key: any, value: () => any): DIContainer {
		this.providers.set(key, value);
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
			else if (this.providers.has(object))
				return this.constructViaProvider(object);
			else
				return this.constructViaDependencies(object);
		} catch (e) {
			throw new ConstructionError(object, e as Error);
		}
	}

	private constructViaProvider(key: any): any {
		const instance = this.providers.get(key)();
		this.add(key, instance);
		return instance;
	}

	private constructViaDependencies<T extends Injectable>(object: T): InstanceType<T> {
		const dependencies: any[] =
		object.dependencies
			? object.dependencies().map((x: any) => this.construct(x))
			: [];
		const instance = new object(...dependencies);
		this.add(object, instance);
		return instance;
	}
}

export class ConstructionError extends Error {
	constructor(x: any, cause: Error) {
		const reference =
			x === null || x === undefined
			? x
			: x.name !== undefined
			? x.name
			: x.toString()
		super('Error constructing ' + reference, { cause });
	}
}
