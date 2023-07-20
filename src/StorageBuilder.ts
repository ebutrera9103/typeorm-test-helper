import { DataSource } from 'typeorm';
import path from 'path';

class StorageBuilder<T> {
    private systemDataSource!: DataSource;
    private appDataSource!: DataSource;
    private storageService: T;
    private dbName: string;
    private databaseConfig: any;
    private systemDatabase: string;

    constructor(
        private storageServiceConstructor: new (dataSource: DataSource, config: any) => T,
        private config: any,
        private databaseType: 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'mssql' | 'oracle',
        private entities: Function[],
        private migrationsPath: string,
        systemDatabase?: string
        ) {
        this.storageService = {} as T;
        this.dbName = 'test_' + Date.now();
        this.databaseConfig = config;
        this.systemDatabase = systemDatabase || this.getDefaultSystemDatabase();

    }

    async setup() {
        this.systemDataSource = new DataSource({
			type: this.databaseType,
			host: this.databaseConfig.host,
			port: this.databaseConfig.port,
			username: this.databaseConfig.username,
			password: this.databaseConfig.password,
			database: this.systemDatabase, // system database
		});
		await this.systemDataSource.initialize();
		await this.systemDataSource.query(`CREATE DATABASE ${this.dbName};`);
		await this.systemDataSource.destroy();

        this.appDataSource = new DataSource({
            type: this.databaseType,
            host: this.databaseConfig.host,
            port: this.databaseConfig.port,
            username: this.databaseConfig.username,
            password: this.databaseConfig.password,
            database: this.dbName,
            entities: this.entities,
            migrations: [path.join(this.migrationsPath, '*{.ts,.js}')],
            synchronize: false,
            migrationsRun: true,
        });
        await this.appDataSource.initialize();
        this.storageService = new this.storageServiceConstructor(this.appDataSource, this.config);
    }

    async teardown() {
		// Close the DataSource and delete the test database
		try {
			await this.appDataSource.destroy();
		} catch (error) {
			console.error('Error destroying AppDataSource', error);
		}
		const systemDataSource = new DataSource({
			type: this.databaseType,
			host: this.databaseConfig.host,
			port: this.databaseConfig.port,
			username: this.databaseConfig.username,
			password: this.databaseConfig.password,
			database: this.systemDatabase, // system database
		});
		await systemDataSource.initialize();
		await systemDataSource.query(`DROP DATABASE ${this.dbName};`);
		await systemDataSource.destroy();
	}

	getStorageService() {
		return this.storageService;
	}

	getAppDataSource() {
		return this.appDataSource;
	}

    /**
     * UTILS
     */

    // Method to get the default system database based on database type
    private getDefaultSystemDatabase(): string {
        switch(this.databaseType) {
            case 'postgres':
                return 'postgres';
            case 'mysql':
            case 'mariadb':
                return 'mysql';
            case 'oracle':
                return 'sys';
            default:
                throw new Error(`Unsupported database type: ${this.databaseType}`);
        }
    }
}

export default StorageBuilder;