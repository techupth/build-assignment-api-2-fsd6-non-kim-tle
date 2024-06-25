// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
import dotenv from 'dotenv';
dotenv.config();

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbName = process.env.DB_NAME

// ใช้ตัวแปรเหล่านี้ในการเชื่อมต่อฐานข้อมูลหรือการทำงานอื่น ๆ

const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    `postgresql://${dbUser}:${dbPass}@localhost:5432/${dbName}`,
});
export default connectionPool;
