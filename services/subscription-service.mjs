import { getDb } from '../db.mjs';

class SubscriptionService {
  static async add(studentId, courseId) {
    try {
      const db = await getDb();
      
      const student = await db.get('SELECT * FROM students WHERE id = ?', [studentId]);
      if (!student) {
        throw new Error(`Étudiant avec l'ID ${studentId} introuvable.`);
      }

      const course = await db.get('SELECT * FROM courses WHERE id = ?', [courseId]);
      if (!course) {
        throw new Error(`Cours avec l'ID ${courseId} introuvable.`);
      }

      const result = await db.run(
        'INSERT INTO subscriptions (student_id, course_id) VALUES (?, ?)',
        [studentId, courseId]
      );

      return {
        id: result.lastID,
        student_id: studentId,
        course_id: courseId,
        subscribed_at: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'inscription: ${error.message}`);
    }
  }

  static async getByCourse(courseId) {
    try {
      const db = await getDb();
      return await db.all('SELECT * FROM subscriptions WHERE course_id = ?', [courseId]);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des inscriptions au cours: ${error.message}`);
    }
  }

  static async getStudentsByCourse(courseId) {
    try {
      const db = await getDb();
      return await db.all(
        `SELECT s.* FROM students s
         JOIN subscriptions sub ON s.id = sub.student_id
         WHERE sub.course_id = ?`,
        [courseId]
      );
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des étudiants du cours: ${error.message}`);
    }
  }

  static async getByStudent(studentId) {
    try {
      const db = await getDb();
      return await db.all('SELECT * FROM subscriptions WHERE student_id = ?', [studentId]);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des inscriptions de l'étudiant: ${error.message}`);
    }
  }

  static async getCoursesByStudent(studentId) {
    try {
      const db = await getDb();
      return await db.all(
        `SELECT c.* FROM courses c
         JOIN subscriptions sub ON c.id = sub.course_id
         WHERE sub.student_id = ?`,
        [studentId]
      );
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des cours de l'étudiant: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const db = await getDb();
      const subscription = await db.get('SELECT * FROM subscriptions WHERE id = ?', [id]);
      if (!subscription) {
        return false;
      }
      await db.run('DELETE FROM subscriptions WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la désinscription: ${error.message}`);
    }
  }
}

export default SubscriptionService;
