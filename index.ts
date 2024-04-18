export interface Injectable {
	new (...xs: any[]): any;
	dependencies?: () => Array<any> | ReadonlyArray<any>;
}

export class DIContainer {
	private instances: Map<any, any>;

	constructor() {
		this.instances = new Map();
	}

	register(key: any, value: any): DIContainer {
		this.instances.set(key, value);
		return this;
	}

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
