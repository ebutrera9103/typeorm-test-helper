import { DataSource } from 'typeorm';
import path from 'path';

interface StorageConfig {
    config: any;
    databaseType: 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'mssql' | 'oracle';
    entities: Function[];
    systemDatabase: string;
    migrationsPath: string;
}

class StorageBuilder<T> {
    private systemDataSources: DataSource[] = [];
    private appDataSources: DataSource[] = [];
    private storageServices: T[] = [];
    private dbName: string;
    private databaseConfigs: StorageConfig[];

    constructor(
        private storageServiceConstructor: new (dataSource: DataSource, config: any) => T,
        databaseConfigs: StorageConfig[]
    ) {
        this.dbName = 'test_' + Date.now();
        this.databaseConfigs = databaseConfigs;
    }

    async setup() {
        for (const databaseConfig of this.databaseConfigs) {
            const systemDataSource = new DataSource({
                type: databaseConfig.databaseType,
                host: databaseConfig.config.host,
                port: databaseConfig.config.port,
                username: databaseConfig.config.username,
                password: databaseConfig.config.password,
                database: databaseConfig.systemDatabase,
            });
            await systemDataSource.initialize();
            await systemDataSource.query(`CREATE DATABASE ${this.dbName};`);
            await systemDataSource.destroy();

            // Now connect to our new test database
            const appDataSource = new DataSource({
                type: databaseConfig.databaseType,
                host: databaseConfig.config.host,
                port: databaseConfig.config.port,
                username: databaseConfig.config.username,
                password: databaseConfig.config.password,
                database: this.dbName,
                entities: databaseConfig.entities,
                migrations: [path.join(__dirname, databaseConfig.migrationsPath)],
                synchronize: false,
                migrationsRun: true,
            });
            await appDataSource.initialize();
            const storageService = new this.storageServiceConstructor(appDataSource, databaseConfig.config);

            // Store these instances for later use
            this.systemDataSources.push(systemDataSource);
            this.appDataSources.push(appDataSource);
            this.storageServices.push(storageService);
        }
    }

    async teardown() {
        for (let i = 0; i < this.systemDataSources.length; i++) {
            try {
                await this.appDataSources[i].destroy();
            } catch (error) {
                console.error('Error destroying AppDataSource', error);
            }
            await this.systemDataSources[i].initialize();
            await this.systemDataSources[i].query(`DROP DATABASE ${this.dbName};`);
            await this.systemDataSources[i].destroy();
        }
    }

    getStorageServices() {
        return this.storageServices;
    }

    getAppDataSources() {
        return this.appDataSources;
    }
}

export default StorageBuilder;
