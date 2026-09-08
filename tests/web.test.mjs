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

describe('Interface web — pages principales', () => {
  it('GET /app affiche le tableau de bord', async () => {
    const res = await request(app).get('/app');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Tableau de bord');
  });

  it('GET /app/students affiche la liste des étudiants', async () => {
    const res = await request(app).get('/app/students');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Étudiants');
  });

  it('GET /app/students/new affiche le formulaire de création', async () => {
    const res = await request(app).get('/app/students/new');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Nouvel étudiant');
  });

  it('GET /app/courses affiche la liste des cours', async () => {
    const res = await request(app).get('/app/courses');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Cours');
  });

  it('GET /app/subscriptions affiche la liste des inscriptions', async () => {
    const res = await request(app).get('/app/subscriptions');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Inscriptions');
  });
});

describe('Interface web — cycle de vie étudiant', () => {
  it('POST /app/students/new crée un étudiant puis redirige vers la liste', async () => {
    const res = await request(app).post('/app/students/new').send({ name: 'Grace Kalombo', number: 'STU-001' });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/app/students');
  });

  it('POST /app/students/new avec des données invalides réaffiche le formulaire (400)', async () => {
    const res = await request(app).post('/app/students/new').send({ number: 'STU-001' });
    expect(res.status).toBe(400);
    expect(res.text).toContain('Nouvel étudiant');
  });

  it('GET /app/students/:id affiche le détail après création', async () => {
    const create = await request(app).post('/app/students/new').send({ name: 'Grace Kalombo', number: 'STU-001' });
    const listPage = await request(app).get(create.headers.location);
    const idMatch = listPage.text.match(/\/app\/students\/(\d+)/);
    expect(idMatch).not.toBeNull();

    const detail = await request(app).get(`/app/students/${idMatch[1]}`);
    expect(detail.status).toBe(200);
    expect(detail.text).toContain('Grace Kalombo');
  });

  it('GET /app/students/:id redirige si introuvable', async () => {
    const res = await request(app).get('/app/students/999');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/app/students');
  });
});

describe('Interface web — édition et suppression étudiant', () => {
  it("GET /app/students/:id/edit affiche le formulaire pré-rempli", async () => {
    const create = await request(app).post('/app/students/new').send({ name: 'Grace Kalombo', number: 'STU-001' });
    const listPage = await request(app).get(create.headers.location);
    const id = listPage.text.match(/\/app\/students\/(\d+)/)[1];

    const res = await request(app).get(`/app/students/${id}/edit`);
    expect(res.status).toBe(200);
    expect(res.text).toContain('Grace Kalombo');
  });

  it('POST /app/students/:id/edit met à jour puis redirige vers le détail', async () => {
    const create = await request(app).post('/app/students/new').send({ name: 'Grace Kalombo', number: 'STU-001' });
    const listPage = await request(app).get(create.headers.location);
    const id = listPage.text.match(/\/app\/students\/(\d+)/)[1];

    const res = await request(app).post(`/app/students/${id}/edit`).send({ name: 'Grace K. Mwamba' });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(`/app/students/${id}`);
  });

  it('POST /app/students/:id/edit avec des données invalides réaffiche le formulaire (400)', async () => {
    const create = await request(app).post('/app/students/new').send({ name: 'Grace Kalombo', number: 'STU-001' });
    const listPage = await request(app).get(create.headers.location);
    const id = listPage.text.match(/\/app\/students\/(\d+)/)[1];

    const res = await request(app).post(`/app/students/${id}/edit`).send({});
    expect(res.status).toBe(400);
  });

  it('POST /app/students/:id/delete supprime puis redirige vers la liste', async () => {
    const create = await request(app).post('/app/students/new').send({ name: 'Grace Kalombo', number: 'STU-001' });
    const listPage = await request(app).get(create.headers.location);
    const id = listPage.text.match(/\/app\/students\/(\d+)/)[1];

    const res = await request(app).post(`/app/students/${id}/delete`);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/app/students');
  });

  it('GET /app/students avec une recherche filtre les résultats', async () => {
    await request(app).post('/app/students/new').send({ name: 'Grace Kalombo', number: 'STU-001' });
    await request(app).post('/app/students/new').send({ name: 'David Tshibangu', number: 'STU-002' });

    const res = await request(app).get('/app/students?q=Grace');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Grace Kalombo');
    expect(res.text).not.toContain('David Tshibangu');
  });
});

describe('Interface web — édition et suppression cours', () => {
  it('GET /app/courses/:id/edit affiche le formulaire pré-rempli', async () => {
    const create = await request(app).post('/app/courses/new').send({ name: 'Web Development', code: 'CS101' });
    const listPage = await request(app).get(create.headers.location);
    const id = listPage.text.match(/\/app\/courses\/(\d+)/)[1];

    const res = await request(app).get(`/app/courses/${id}/edit`);
    expect(res.status).toBe(200);
    expect(res.text).toContain('CS101');
  });

  it('POST /app/courses/:id/edit met à jour puis redirige vers le détail', async () => {
    const create = await request(app).post('/app/courses/new').send({ name: 'Web Development', code: 'CS101' });
    const listPage = await request(app).get(create.headers.location);
    const id = listPage.text.match(/\/app\/courses\/(\d+)/)[1];

    const res = await request(app).post(`/app/courses/${id}/edit`).send({ credits: 8 });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(`/app/courses/${id}`);
  });

  it('POST /app/courses/:id/edit avec des données invalides réaffiche le formulaire (400)', async () => {
    const create = await request(app).post('/app/courses/new').send({ name: 'Web Development', code: 'CS101' });
    const listPage = await request(app).get(create.headers.location);
    const id = listPage.text.match(/\/app\/courses\/(\d+)/)[1];

    const res = await request(app).post(`/app/courses/${id}/edit`).send({});
    expect(res.status).toBe(400);
  });

  it('POST /app/courses/:id/delete supprime puis redirige vers la liste', async () => {
    const create = await request(app).post('/app/courses/new').send({ name: 'Web Development', code: 'CS101' });
    const listPage = await request(app).get(create.headers.location);
    const id = listPage.text.match(/\/app\/courses\/(\d+)/)[1];

    const res = await request(app).post(`/app/courses/${id}/delete`);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/app/courses');
  });

  it("GET /app/courses/:id redirige si le cours est introuvable", async () => {
    const res = await request(app).get('/app/courses/999');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/app/courses');
  });
});

describe('Interface web — inscription', () => {
  async function createStudentAndCourse() {
    const student = await request(app).post('/app/students/new').send({ name: 'Grace Kalombo', number: 'STU-001' });
    const studentsPage = await request(app).get(student.headers.location);
    const studentId = studentsPage.text.match(/\/app\/students\/(\d+)/)[1];

    const course = await request(app).post('/app/courses/new').send({ name: 'Web Development', code: 'CS101' });
    const coursesPage = await request(app).get(course.headers.location);
    const courseId = coursesPage.text.match(/\/app\/courses\/(\d+)/)[1];

    return { studentId, courseId };
  }

  it('GET /app/subscriptions/new pré-sélectionne étudiant/cours via query string', async () => {
    const { studentId, courseId } = await createStudentAndCourse();
    const res = await request(app).get(`/app/subscriptions/new?student_id=${studentId}&course_id=${courseId}`);
    expect(res.status).toBe(200);
  });

  it('POST /app/subscriptions/new crée une inscription et redirige', async () => {
    const { studentId, courseId } = await createStudentAndCourse();
    const res = await request(app)
      .post('/app/subscriptions/new')
      .send({ student_id: studentId, course_id: courseId });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/app/subscriptions');
  });

  it('POST /app/subscriptions/new avec des données invalides réaffiche le formulaire (400)', async () => {
    const res = await request(app).post('/app/subscriptions/new').send({});
    expect(res.status).toBe(400);
  });

  it('POST /app/subscriptions/new rejette une double inscription (400)', async () => {
    const { studentId, courseId } = await createStudentAndCourse();
    await request(app).post('/app/subscriptions/new').send({ student_id: studentId, course_id: courseId });
    const res = await request(app).post('/app/subscriptions/new').send({ student_id: studentId, course_id: courseId });
    expect(res.status).toBe(400);
  });

  it('POST /app/subscriptions/:id/delete désinscrit puis redirige', async () => {
    const { studentId, courseId } = await createStudentAndCourse();
    const created = await request(app)
      .post('/app/subscriptions/new')
      .send({ student_id: studentId, course_id: courseId });
    const subsPage = await request(app).get(created.headers.location);
    const subId = subsPage.text.match(/\/app\/subscriptions\/(\d+)\/delete/)[1];

    const res = await request(app).post(`/app/subscriptions/${subId}/delete`);
    expect(res.status).toBe(302);
  });
});
