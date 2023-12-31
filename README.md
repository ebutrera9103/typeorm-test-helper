# typeorm-test-helper

typeorm-test-helper is a library designed to facilitate the process of managing test databases. It allows users to seamlessly set up, interact with, and tear down databases using TypeORM. This library aims to streamline testing services that interact with databases.

## Installation

```bash
npm install typeorm-test-helper
```

## Usage

To use the library, import the `StorageBuilder` class and instantiate it. Pass in your storage service constructor and an array of database configurations:

```typescript
import { StorageBuilder } from 'typeorm-test-helper';

let storageBuilder = new StorageBuilder<MyStorageService>(
    MyStorageService,
    [
        {config: dbConfig1, databaseType: 'postgres', entities: [MyEntity1, MyEntity2], systemDatabase: 'postgres', migrationsPath: '/path/to/your/migrations'},
        {config: dbConfig2, databaseType: 'mysql', entities: [MyEntity3, MyEntity4], systemDatabase: 'mysql', migrationsPath: '/path/to/your/migrations'}
    ]
);
```

You can then use your `StorageBuilder` instance to set up the test database:

```typescript
await storageBuilder.setup();
```

To get your storage service instances:

```typescript
let myStorageServices = storageBuilder.getStorageServices();
```

When you're finished, tear down the test database:

```typescript
await storageBuilder.teardown();
```

## Configuration

The `StorageBuilder` class constructor requires two parameters:

- `storageServiceConstructor`: A constructor function for your storage service class. This should be a new instance of your storage service class, which will be initialized with a `DataSource` and your provided configuration.

- `databaseConfigs`: An array of configuration objects for your database connections. Each object should contain the following properties:

  - `config`: A configuration object for your database connection, containing properties like host, port, username, password.

  - `databaseType`: A string indicating the type of database being used. Options include 'postgres', 'mysql', 'mariadb', 'sqlite', 'mssql', and 'oracle'.

  - `entities`: An array of Functions. Each function should represent a entity class that will be used by TypeORM.

  - `systemDatabase`: A string indicating the system database name.

  - `migrationsPath`: A string representing the relative or absolute path to your migrations files.

Example of a `StorageBuilder` instance:

```typescript
let storageBuilder = new StorageBuilder<MyStorageService>(
    MyStorageService,
    [
        {config: dbConfig1, databaseType: 'postgres', entities: [MyEntity1, MyEntity2], systemDatabase: 'postgres', migrationsPath: '/path/to/your/migrations'},
        {config: dbConfig2, databaseType: 'mysql', entities: [MyEntity3, MyEntity4], systemDatabase: 'mysql', migrationsPath: '/path/to/your/migrations'}
    ]
);
```

The created `StorageBuilder` instance can then be used to manage your test databases.

## Notes

- This library can be used with the following databases: 'postgres', 'mysql', 'mariadb', 'sqlite', 'mssql', 'oracle'. It assumes that you have the selected database installed and running on your machine.

- The library creates and deletes databases as needed for testing. The test database's name is automatically generated to prevent collisions.

- Make sure to provide the entities used by TypeORM dynamically when using the library.

## Contributing

We welcome contributions to improve this library. Feel free to submit issues and pull requests.

## Accessing and Using Repositories

After setting up the `StorageBuilder`, you can access your TypeORM repositories, allowing you to perform operations such as creating, reading, updating, and deleting records.

Here's an example:

```typescript
// Get the DataSources from the storage builder
const appDataSources = storageBuilder.getAppDataSources();

// Use the DataSources' managers to get your repositories
const userRepository1 = appDataSources[0].manager.getRepository(User);
const userRepository2 = appDataSources[1].manager.getRepository(User);

// Now you can use the repositories to interact with the databases
const newUser1 = userRepository1.create({ /* your user data here */ });
await userRepository1.save(newUser1);

const newUser2 = userRepository2.create({ /* your user data here */ });
await userRepository2.save(newUser2);
```

The repositories returned by `getRepository` are instances of TypeORM's `Repository` class. You can use these to perform a variety of operations on the corresponding tables in the database. You can find more information on how to use repositories in the [TypeORM documentation](https://typeorm.io/#/working-with-repository).

Remember to replace `User` with your own entity class. Ensure that this class is part of the `entities` array in your database connection options.