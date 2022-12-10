import { DataSource } from 'typeorm';

const dbConfig = {
  host: 'localhost',
  databaseName: 'video',
  databaseUsername: 'root',
  databasePassword: '',
  databasePort: 3306,
};

const files = ['src/models/VideoQueue.ts'];
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: dbConfig.host,
  port: dbConfig.databasePort,
  username: dbConfig.databaseUsername,
  password: dbConfig.databasePassword,
  database: dbConfig.databaseName,
  //TODO Comment below
  synchronize: true,
  logging: false,
  entities: files,
  migrations: [],
  subscribers: [],
});
AppDataSource.initialize()
  .then(() => console.log('Database connected.'))
  .catch((er) => {
    console.log('Got error while connecting to database, Error:- ', er.message);
    console.log(er);
  });

export default { dbConfig, AppDataSource };
