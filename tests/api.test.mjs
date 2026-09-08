process.env.NODE_ENV = 'test';
process.env.DB_FILE = ':memory:';

import request from 'supertest';
import { getDb } from '../db.mjs';

let app;

beforeAll(async () => {
  app = (await import('../server.mjs')).default;
});

async function resetDb() {
  const db = await getDb();
  await db.exec('DELETE FROM subscriptions; DELETE FROM students; DELETE FROM courses; DELETE FROM sqlite_sequence;');
}

beforeEach(async () => {
  await resetDb();
});

describe('API REST — Étudiants', () => {
  it('POST /students crée un étudiant (201)', async () => {
    const res = await request(app).post('/students').send({ name: 'Grace Kalombo', number: 'STU-001' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Grace Kalombo', number: 'STU-001' });
  });

  it('POST /students rejette une requête invalide (400)', async () => {
    const res = await request(app).post('/students').send({ number: 'STU-001' });
    expect(res.status).toBe(400);
  });

  it('GET /students retourne la liste (200)', async () => {
    await request(app).post('/students').send({ name: 'Grace Kalombo', number: 'STU-001' });
    const res = await request(app).get('/students');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('GET /students/:id retourne 404 si introuvable', async () => {
    const res = await request(app).get('/students/999');
    expect(res.status).toBe(404);
  });

  it('PUT /students/:id met à jour un étudiant', async () => {
    const created = await request(app).post('/students').send({ name: 'Grace Kalombo', number: 'STU-001' });
    const res = await request(app).put(`/students/${created.body.id}`).send({ name: 'Grace K. Mwamba' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Grace K. Mwamba');
  });

  it('DELETE /students/:id supprime un étudiant', async () => {
    const created = await request(app).post('/students').send({ name: 'David Tshibangu', number: 'STU-002' });
    const res = await request(app).delete(`/students/${created.body.id}`);
    expect(res.status).toBe(200);
    expect((await request(app).get(`/students/${created.body.id}`)).status).toBe(404);
  });
});

describe('API REST — Cours', () => {
  it('POST /courses crée un cours (201)', async () => {
    const res = await request(app).post('/courses').send({ name: 'Web Development', code: 'CS101', credits: 6 });
    expect(res.status).toBe(201);
    expect(res.body.credits).toBe(6);
  });

  it('POST /courses rejette un doublon de code (400)', async () => {
    await request(app).post('/courses').send({ name: 'Web Development', code: 'CS101' });
    const res = await request(app).post('/courses').send({ name: 'Autre', code: 'CS101' });
    expect(res.status).toBe(400);
  });

  it('GET /courses/:id retrouve un cours par son code', async () => {
    await request(app).post('/courses').send({ name: 'Web Development', code: 'CS101' });
    const res = await request(app).get('/courses/CS101');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Web Development');
  });

  it('DELETE /courses/:id supprime un cours', async () => {
    const created = await request(app).post('/courses').send({ name: 'Database Systems', code: 'CS102' });
    const res = await request(app).delete(`/courses/${created.body.id}`);
    expect(res.status).toBe(200);
  });
});

describe('API REST — Inscriptions', () => {
  it('POST /subscriptions inscrit un étudiant à un cours (201)', async () => {
    const student = await request(app).post('/students').send({ name: 'Grace Kalombo', number: 'STU-001' });
    const course = await request(app).post('/courses').send({ name: 'Web Development', code: 'CS101' });
    const res = await request(app)
      .post('/subscriptions')
      .send({ student_id: student.body.id, course_id: course.body.id });
    expect(res.status).toBe(201);
  });

  it('POST /subscriptions retourne 404 si le cours est introuvable', async () => {
    const student = await request(app).post('/students').send({ name: 'Grace Kalombo', number: 'STU-001' });
    const res = await request(app)
      .post('/subscriptions')
      .send({ student_id: student.body.id, course_id: 999 });
    expect(res.status).toBe(404);
  });

  it('GET /subscriptions/students/:studentId/courses retourne les cours suivis', async () => {
    const student = await request(app).post('/students').send({ name: 'Grace Kalombo', number: 'STU-001' });
    const course = await request(app).post('/courses').send({ name: 'Web Development', code: 'CS101' });
    await request(app).post('/subscriptions').send({ student_id: student.body.id, course_id: course.body.id });

    const res = await request(app).get(`/subscriptions/students/${student.body.id}/courses`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].code).toBe('CS101');
  });

  it('DELETE /subscriptions/:id désinscrit un étudiant', async () => {
    const student = await request(app).post('/students').send({ name: 'Grace Kalombo', number: 'STU-001' });
    const course = await request(app).post('/courses').send({ name: 'Web Development', code: 'CS101' });
    const sub = await request(app)
      .post('/subscriptions')
      .send({ student_id: student.body.id, course_id: course.body.id });

    const res = await request(app).delete(`/subscriptions/${sub.body.id}`);
    expect(res.status).toBe(200);
  });
});

describe('GET / — endpoint racine', () => {
  it("retourne un message de bienvenue JSON", async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });
});
