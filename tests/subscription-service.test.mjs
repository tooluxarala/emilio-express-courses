process.env.DB_FILE = ':memory:';

import { getDb } from '../db.mjs';
import StudentService from '../services/student-service.mjs';
import CourseService from '../services/course-service.mjs';
import SubscriptionService from '../services/subscription-service.mjs';

async function resetDb() {
  const db = await getDb();
  await db.exec('DELETE FROM subscriptions; DELETE FROM students; DELETE FROM courses; DELETE FROM sqlite_sequence;');
}

let student;
let course;

beforeEach(async () => {
  await resetDb();
  student = await StudentService.add({ name: 'Grace Kalombo', number: 'STU-001' });
  course = await CourseService.add({ name: 'Web Development', code: 'CS101', credits: 6 });
});

describe('SubscriptionService', () => {
  describe('add()', () => {
    it('inscrit un étudiant existant à un cours existant', async () => {
      const subscription = await SubscriptionService.add(student.id, course.id);
      expect(subscription).toMatchObject({ student_id: student.id, course_id: course.id });
      expect(subscription.subscribed_at).toBeDefined();
    });

    it("rejette l'inscription si l'étudiant n'existe pas", async () => {
      await expect(SubscriptionService.add(999, course.id)).rejects.toThrow(/introuvable/);
    });

    it("rejette l'inscription si le cours n'existe pas", async () => {
      await expect(SubscriptionService.add(student.id, 999)).rejects.toThrow(/introuvable/);
    });

    it('empêche une double inscription au même cours', async () => {
      await SubscriptionService.add(student.id, course.id);
      await expect(SubscriptionService.add(student.id, course.id)).rejects.toThrow();
    });
  });

  describe('getByStudent() / getByCourse()', () => {
    it("retourne les inscriptions d'un étudiant", async () => {
      await SubscriptionService.add(student.id, course.id);
      const subs = await SubscriptionService.getByStudent(student.id);
      expect(subs).toHaveLength(1);
    });

    it("retourne les inscriptions d'un cours", async () => {
      await SubscriptionService.add(student.id, course.id);
      const subs = await SubscriptionService.getByCourse(course.id);
      expect(subs).toHaveLength(1);
    });
  });

  describe('getStudentsByCourse() / getCoursesByStudent()', () => {
    it('retourne les étudiants inscrits à un cours', async () => {
      await SubscriptionService.add(student.id, course.id);
      const students = await SubscriptionService.getStudentsByCourse(course.id);
      expect(students).toHaveLength(1);
      expect(students[0].name).toBe('Grace Kalombo');
    });

    it("retourne les cours d'un étudiant", async () => {
      await SubscriptionService.add(student.id, course.id);
      const courses = await SubscriptionService.getCoursesByStudent(student.id);
      expect(courses).toHaveLength(1);
      expect(courses[0].code).toBe('CS101');
    });
  });

  describe('delete()', () => {
    it('supprime une inscription existante et retourne true', async () => {
      const subscription = await SubscriptionService.add(student.id, course.id);
      expect(await SubscriptionService.delete(subscription.id)).toBe(true);
      expect(await SubscriptionService.getByStudent(student.id)).toHaveLength(0);
    });

    it('retourne false si l\'inscription à supprimer est introuvable', async () => {
      expect(await SubscriptionService.delete(999)).toBe(false);
    });
  });

  describe('getAll()', () => {
    it('retourne toutes les inscriptions avec étudiant et cours joints', async () => {
      await SubscriptionService.add(student.id, course.id);
      const all = await SubscriptionService.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].student.name).toBe('Grace Kalombo');
      expect(all[0].course.code).toBe('CS101');
    });
  });
});
