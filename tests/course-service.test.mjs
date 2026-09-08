process.env.DB_FILE = ':memory:';

import { getDb } from '../db.mjs';
import CourseService from '../services/course-service.mjs';

async function resetDb() {
  const db = await getDb();
  await db.exec('DELETE FROM subscriptions; DELETE FROM students; DELETE FROM courses; DELETE FROM sqlite_sequence;');
}

beforeEach(async () => {
  await resetDb();
});

describe('CourseService', () => {
  describe('add()', () => {
    it('crée un cours avec des crédits par défaut à 0', async () => {
      const course = await CourseService.add({ name: 'Web Development', code: 'CS101' });
      expect(course).toMatchObject({ id: 1, name: 'Web Development', code: 'CS101', credits: 0 });
    });

    it('crée un cours avec des crédits explicites', async () => {
      const course = await CourseService.add({ name: 'Database Systems', code: 'CS102', credits: 8 });
      expect(course.credits).toBe(8);
    });

    it("rejette l'ajout d'un doublon de code", async () => {
      await CourseService.add({ name: 'Web Development', code: 'CS101' });
      await expect(CourseService.add({ name: 'Autre nom', code: 'CS101' })).rejects.toThrow();
    });
  });

  describe('get()', () => {
    it('retrouve un cours par son id numérique', async () => {
      const created = await CourseService.add({ name: 'Web Development', code: 'CS101' });
      const found = await CourseService.get(created.id);
      expect(found.code).toBe('CS101');
    });

    it('retrouve un cours par son code', async () => {
      await CourseService.add({ name: 'Web Development', code: 'CS101' });
      const found = await CourseService.get('CS101');
      expect(found.name).toBe('Web Development');
    });

    it('retourne null si aucun cours ne correspond', async () => {
      expect(await CourseService.get('UNKNOWN')).toBeNull();
    });
  });

  describe('update()', () => {
    it('met à jour les crédits d\'un cours existant', async () => {
      const created = await CourseService.add({ name: 'Web Development', code: 'CS101', credits: 6 });
      const updated = await CourseService.update(created.id, { credits: 8 });
      expect(updated.credits).toBe(8);
      expect(updated.name).toBe('Web Development');
    });

    it('retourne null si le cours à mettre à jour est introuvable', async () => {
      expect(await CourseService.update(999, { credits: 5 })).toBeNull();
    });
  });

  describe('delete()', () => {
    it('supprime un cours existant et retourne true', async () => {
      const created = await CourseService.add({ name: 'Software Engineering', code: 'CS103' });
      expect(await CourseService.delete(created.id)).toBe(true);
      expect(await CourseService.get(created.id)).toBeNull();
    });

    it('retourne false si le cours à supprimer est introuvable', async () => {
      expect(await CourseService.delete(999)).toBe(false);
    });
  });

  describe('getAll()', () => {
    it('retourne la liste de tous les cours', async () => {
      await CourseService.add({ name: 'Web Development', code: 'CS101' });
      await CourseService.add({ name: 'Database Systems', code: 'CS102' });
      expect(await CourseService.getAll()).toHaveLength(2);
    });
  });
});
