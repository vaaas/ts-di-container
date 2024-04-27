# Dependency Injection Container

Very simple and minimal DI Container in Typescript.

Use `DIContainer.construct` to create an instance of an object, automatically wiring dependencies into its `constructor`.

Injectable classes objects must provide the `dependencies` static method that returns an array of Injectables that will be passed onto the constructor after initialisation.

Every constructed instance will be registered in the container, so it is only initialised once (Singletons).

Only synchronous construction is supported.

You can manually register injectables using `DIContainer.register`. This is primarily useful for registering injectables that are constructed asynchronously.

# Example

```typescript
class SomeRepository {
	constructor() {} // no dependencies
}

class SomeService {
	constructor(repo: SomeRepository) {
		this.repo = repo;
   }

	static dependencies() {
		return [
			SomeRepository,
		];
	}
}

const container = new DIContainer();
const service = container.construct(SomeService);
```
