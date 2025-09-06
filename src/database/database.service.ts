import { drizzle } from 'drizzle-orm/mysql2';
import { MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import { ConfigService } from '../config/config.service';

export class DatabaseService {
  public readonly db: MySql2Database<typeof schema>;

  constructor() {
    const connection = mysql.createPool({
      ...ConfigService.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    this.db = drizzle(connection, {
      schema,
      mode: 'default',
    });
    console.log('🚀 Database connection established');
  }
}

export type Database = DatabaseService['db'];
