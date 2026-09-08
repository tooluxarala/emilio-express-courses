process.env.DB_FILE = ':memory:';

import { jest } from '@jest/globals';
import { getDb } from '../db.mjs';
import StudentService from '../services/student-service.mjs';

async function resetDb() {
  const db = await getDb();
  await db.exec('DELETE FROM subscriptions; DELETE FROM students; DELETE FROM courses; DELETE FROM sqlite_sequence;');
}

beforeEach(async () => {
  await resetDb();
});

describe('StudentService', () => {
  describe('add()', () => {
    it('crée un étudiant et retourne son id', async () => {
      const student = await StudentService.add({ name: 'Grace Kalombo', number: 'STU-001' });
      expect(student).toMatchObject({ id: 1, name: 'Grace Kalombo', number: 'STU-001' });
    });

    it("rejette l'ajout d'un doublon de matricule", async () => {
      await StudentService.add({ name: 'Grace Kalombo', number: 'STU-001' });
      await expect(StudentService.add({ name: 'David Tshibangu', number: 'STU-001' }))
        .rejects.toThrow();
    });
  });

  describe('get()', () => {
    it('retrouve un étudiant par son id numérique', async () => {
      const created = await StudentService.add({ name: 'Grace Kalombo', number: 'STU-001' });
      const found = await StudentService.get(created.id);
      expect(found.name).toBe('Grace Kalombo');
    });

    it('retrouve un étudiant par son matricule', async () => {
      await StudentService.add({ name: 'Grace Kalombo', number: 'STU-001' });
      const found = await StudentService.get('STU-001');
      expect(found.number).toBe('STU-001');
    });

    it('retourne null si aucun étudiant ne correspond', async () => {
      const found = await StudentService.get('DOES-NOT-EXIST');
      expect(found).toBeNull();
    });
  });

  describe('update()', () => {
    it('met à jour un étudiant existant', async () => {
      const created = await StudentService.add({ name: 'Grace Kalombo', number: 'STU-001' });
      const updated = await StudentService.update(created.id, { name: 'Grace K. Mwamba' });
      expect(updated.name).toBe('Grace K. Mwamba');
      expect(updated.number).toBe('STU-001');
    });

    it('retourne null si l\'étudiant à mettre à jour est introuvable', async () => {
      const updated = await StudentService.update(999, { name: 'Personne' });
      expect(updated).toBeNull();
    });
  });

  describe('delete()', () => {
    it('supprime un étudiant existant et retourne true', async () => {
      const created = await StudentService.add({ name: 'David Tshibangu', number: 'STU-002' });
      const deleted = await StudentService.delete(created.id);
      expect(deleted).toBe(true);
      expect(await StudentService.get(created.id)).toBeNull();
    });

    it('retourne false si l\'étudiant à supprimer est introuvable', async () => {
      const deleted = await StudentService.delete(999);
      expect(deleted).toBe(false);
    });

    it('supprime un étudiant par son matricule', async () => {
      await StudentService.add({ name: 'Sarah Ilunga', number: 'STU-003' });
      const deleted = await StudentService.delete('STU-003');
      expect(deleted).toBe(true);
      expect(await StudentService.get('STU-003')).toBeNull();
    });
  });

  describe('getAll()', () => {
    it('retourne la liste de tous les étudiants', async () => {
      await StudentService.add({ name: 'Grace Kalombo', number: 'STU-001' });
      await StudentService.add({ name: 'David Tshibangu', number: 'STU-002' });
      const all = await StudentService.getAll();
      expect(all).toHaveLength(2);
    });
  });
});
