import { getDb } from '../db.mjs';

class StudentService {
  static async add(student) {
    try {
      const db = await getDb();
      const result = await db.run(
        'INSERT INTO students (name, number) VALUES (?, ?)',
        [student.name, student.number]
      );
      return { id: result.lastID, name: student.name, number: student.number };
    } catch (error) {
      throw new Error(`Erreur lors de l'ajout de l'étudiant: ${error.message}`);
    }
  }

  static async getAll() {
    try {
      const db = await getDb();
      return await db.all('SELECT * FROM students');
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des étudiants: ${error.message}`);
    }
  }

  static async get(identifier) {
    try {
      const db = await getDb();
      const isNumber = !isNaN(identifier) && !isNaN(parseFloat(identifier));
      
      let student;
      if (isNumber) {
        student = await db.get('SELECT * FROM students WHERE id = ?', [Number(identifier)]);
      }
      
      if (!student) {
        student = await db.get('SELECT * FROM students WHERE number = ?', [identifier]);
      }
      
      return student || null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de l'étudiant: ${error.message}`);
    }
  }

  static async update(id, studentData) {
    try {
      const db = await getDb();
      const existing = await this.get(id);
      if (!existing) {
        return null;
      }

      const name = studentData.name || existing.name;
      const number = studentData.number || existing.number;

      await db.run(
        'UPDATE students SET name = ?, number = ? WHERE id = ?',
        [name, number, existing.id]
      );

      return { id: existing.id, name, number };
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'étudiant: ${error.message}`);
    }
  }

  static async delete(identifier) {
    try {
      const db = await getDb();
      const existing = await this.get(identifier);
      if (!existing) {
        return false;
      }

      await db.run('DELETE FROM students WHERE id = ?', [existing.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'étudiant: ${error.message}`);
    }
  }
}

export default StudentService;