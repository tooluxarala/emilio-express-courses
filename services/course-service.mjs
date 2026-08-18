import { getDb } from '../db.mjs';

class CourseService {
  static async add(course) {
    try {
      const db = await getDb();
      const credits = course.credits !== undefined ? course.credits : 0;
      const result = await db.run(
        'INSERT INTO courses (name, code, credits) VALUES (?, ?, ?)',
        [course.name, course.code, credits]
      );
      return { id: result.lastID, name: course.name, code: course.code, credits };
    } catch (error) {
      throw new Error(`Erreur lors de l'ajout du cours: ${error.message}`);
    }
  }

  static async getAll() {
    try {
      const db = await getDb();
      return await db.all('SELECT * FROM courses');
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des cours: ${error.message}`);
    }
  }

  static async get(identifier) {
    try {
      const db = await getDb();
      const isNumber = !isNaN(identifier) && !isNaN(parseFloat(identifier));

      let course;
      if (isNumber) {
        course = await db.get('SELECT * FROM courses WHERE id = ?', [Number(identifier)]);
      }

      if (!course) {
        course = await db.get('SELECT * FROM courses WHERE code = ?', [identifier]);
      }

      return course || null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du cours: ${error.message}`);
    }
  }

  static async update(id, courseData) {
    try {
      const db = await getDb();
      const existing = await this.get(id);
      if (!existing) {
        return null;
      }

      const name = courseData.name || existing.name;
      const code = courseData.code || existing.code;
      const credits = courseData.credits !== undefined ? courseData.credits : existing.credits;

      await db.run(
        'UPDATE courses SET name = ?, code = ?, credits = ? WHERE id = ?',
        [name, code, credits, existing.id]
      );

      return { id: existing.id, name, code, credits };
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du cours: ${error.message}`);
    }
  }

  static async delete(identifier) {
    try {
      const db = await getDb();
      const existing = await this.get(identifier);
      if (!existing) {
        return false;
      }

      await db.run('DELETE FROM courses WHERE id = ?', [existing.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du cours: ${error.message}`);
    }
  }
}

export default CourseService;