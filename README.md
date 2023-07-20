# typeorm-test-helper

typeorm-test-helper is a library designed to facilitate the process of managing test databases. It allows users to seamlessly set up, interact with, and tear down databases using TypeORM. This library aims to streamline testing services that interact with databases.

## Installation

```
npm install typeorm-test-helper
```

## Usage

To use the library, import the `StorageBuilder` class and instantiate it. Pass in your storage service constructor, a configuration object, and your database configuration:

```typescript
import { StorageBuilder } from 'typeorm-test-helper';

let storageBuilder = new StorageBuilder<MyStorageService>(MyStorageService, config, dbConfig);
```

You can then use your `StorageBuilder` instance to set up the test database:

```typescript
await storageBuilder.setup();
```

To get your storage service instance:

```typescript
let myStorageService = storageBuilder.getStorageService();
```

When you're finished, tear down the test database:

```typescript
await storageBuilder.teardown();
```

## Configuration

The `StorageBuilder` class constructor requires four parameters:

- `storageServiceConstructor`: A constructor function for your storage service class. This should be a new instance of your storage service class, which will be initialized with a `DataSource` and your provided configuration.

- `config`: A configuration object for your database connection, containing properties like host, port, username, password.

- `databaseType`: A string indicating the type of database being used. Options include 'postgres', 'mysql', 'mariadb', 'sqlite', 'mssql', and 'oracle'.

- `entities`: An array of Functions. Each function should represent a entity class that will be used by TypeORM.

Example of a `StorageBuilder` instance:

```typescript
let storageBuilder = new StorageBuilder<MyStorageService>(MyStorageService, config, 'postgres', [MyEntity1, MyEntity2]);
```

The `config` object should contain all necessary configurations for your storage service. The `entities` array should include all the entity classes that your application uses, ensuring they are provided dynamically while using the library.

The created `StorageBuilder` instance can then be used to manage your test databases.

## Notes

- This library assumes you have PostgreSQL installed and running on your machine.

- The library creates and deletes databases as needed for testing. The test database's name is automatically generated to prevent collisions.

- Ensure that the PostgreSQL system connection details are correctly provided in the `dbConfig` object.

- Make sure to provide the entities used by TypeORM dynamically when using the library.

## Contributing

We welcome contributions to improve this library. Feel free to submit issues and pull requests.


## Accessing and Using Repositories

After setting up the `StorageBuilder`, you can access your TypeORM repositories, allowing you to perform operations such as creating, reading, updating, and deleting records.

Here's an example:

```typescript
// Get the DataSource from the storage builder
const appDataSource = storageBuilder.getAppDataSource();

// Use the DataSource's manager to get your repositories
const userRepository = appDataSource.manager.getRepository(User);
// Now you can use the repository to interact with the database
const newUser = userRepository.create({ /* your user data here */ });
await userRepository.save(newUser);
```

The repositories returned by `getRepository` are instances of TypeORM's `Repository` class. You can use these to perform a variety of operations on the corresponding tables in the database. You can find more information on how to use repositories in the [TypeORM documentation](https://typeorm.io/#/working-with-repository).

Remember to replace `User` with your own entity class. Ensure that this class is part of the `entities` array in your database connection options.