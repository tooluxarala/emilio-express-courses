import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let dbInstance = null;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    await dbInstance.exec('PRAGMA foreign_keys = ON;');

    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        number TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        credits INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE (student_id, course_id)
      );
    `);
  }
  return dbInstance;
}
