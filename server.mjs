import express from 'express';
import moment from 'moment';
import StudentService from './services/student-service.mjs';
import CourseService from './services/course-service.mjs';
import SubscriptionService from './services/subscription-service.mjs';
import {
  studentSchema,
  studentUpdateSchema,
  courseSchema,
  courseUpdateSchema,
  subscriptionSchema,
  validateBody
} from './middlewares/validation.mjs';
import { errorHandler } from './middlewares/error-handler.mjs';

const start = moment.now();

const app = express();
const port = process.env.PORT || 3000;

// c. Middleware express.json & urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API REST de gestion des cours et étudiants',
    documentation: '/API.md'
  });
});

/* ==========================================================================
   1. API REST DE GESTION DES ÉTUDIANTS (5 Endpoints)
   ========================================================================== */

// POST /students - Ajouter un étudiant
app.post('/students', validateBody(studentSchema), async (req, res, next) => {
  try {
    const student = await StudentService.add(req.body);
    res.status(201).json(student);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ status: 400, error: 'Un étudiant avec ce numéro existe déjà.' });
    }
    next(error);
  }
});

// GET /students - Récupérer la liste des étudiants
app.get('/students', async (req, res, next) => {
  try {
    const students = await StudentService.getAll();
    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
});

// GET /students/:id - Récupérer un étudiant par son ID ou matricule
app.get('/students/:id', async (req, res, next) => {
  try {
    const student = await StudentService.get(req.params.id);
    if (!student) {
      return res.status(404).json({ status: 404, error: 'Étudiant non trouvé.' });
    }
    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
});

// PUT /students/:id - Mettre à jour un étudiant
app.put('/students/:id', validateBody(studentUpdateSchema), async (req, res, next) => {
  try {
    const updatedStudent = await StudentService.update(req.params.id, req.body);
    if (!updatedStudent) {
      return res.status(404).json({ status: 404, error: 'Étudiant non trouvé.' });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ status: 400, error: 'Un étudiant avec ce numéro existe déjà.' });
    }
    next(error);
  }
});

// DELETE /students/:id - Supprimer un étudiant
app.delete('/students/:id', async (req, res, next) => {
  try {
    const deleted = await StudentService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: 404, error: 'Étudiant non trouvé.' });
    }
    res.status(200).json({ message: 'Étudiant supprimé avec succès.' });
  } catch (error) {
    next(error);
  }
});

/* ==========================================================================
   2. API REST DE GESTION DES COURS (5 Endpoints)
   ========================================================================== */

// POST /courses - Ajouter un cours
app.post('/courses', validateBody(courseSchema), async (req, res, next) => {
  try {
    const course = await CourseService.add(req.body);
    res.status(201).json(course);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ status: 400, error: 'Un cours avec ce code existe déjà.' });
    }
    next(error);
  }
});

// GET /courses - Récupérer la liste des cours
app.get('/courses', async (req, res, next) => {
  try {
    const courses = await CourseService.getAll();
    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
});

// GET /courses/:id - Récupérer un cours par son ID ou code
app.get('/courses/:id', async (req, res, next) => {
  try {
    const course = await CourseService.get(req.params.id);
    if (!course) {
      return res.status(404).json({ status: 404, error: 'Cours non trouvé.' });
    }
    res.status(200).json(course);
  } catch (error) {
    next(error);
  }
});

// PUT /courses/:id - Mettre à jour un cours
app.put('/courses/:id', validateBody(courseUpdateSchema), async (req, res, next) => {
  try {
    const updatedCourse = await CourseService.update(req.params.id, req.body);
    if (!updatedCourse) {
      return res.status(404).json({ status: 404, error: 'Cours non trouvé.' });
    }
    res.status(200).json(updatedCourse);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ status: 400, error: 'Un cours avec ce code existe déjà.' });
    }
    next(error);
  }
});

// DELETE /courses/:id - Supprimer un cours
app.delete('/courses/:id', async (req, res, next) => {
  try {
    const deleted = await CourseService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: 404, error: 'Cours non trouvé.' });
    }
    res.status(200).json({ message: 'Cours supprimé avec succès.' });
  } catch (error) {
    next(error);
  }
});

/* ==========================================================================
   3. API REST DE GESTION DES INSCRIPTIONS (6 Endpoints)
   ========================================================================== */

// POST /subscriptions - Inscrire un étudiant à un cours
app.post('/subscriptions', validateBody(subscriptionSchema), async (req, res, next) => {
  try {
    const { student_id, course_id } = req.body;
    const subscription = await SubscriptionService.add(student_id, course_id);
    res.status(201).json(subscription);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ status: 400, error: 'Cet étudiant est déjà inscrit à ce cours.' });
    }
    if (error.message.includes('introuvable')) {
      return res.status(404).json({ status: 404, error: error.message });
    }
    next(error);
  }
});

// GET /subscriptions/courses/:courseId - Récupérer les inscriptions d'un cours
app.get('/subscriptions/courses/:courseId', async (req, res, next) => {
  try {
    const subscriptions = await SubscriptionService.getByCourse(req.params.courseId);
    res.status(200).json(subscriptions);
  } catch (error) {
    next(error);
  }
});

// GET /subscriptions/courses/:courseId/students - Récupérer la liste des étudiants inscrits à un cours
app.get('/subscriptions/courses/:courseId/students', async (req, res, next) => {
  try {
    const students = await SubscriptionService.getStudentsByCourse(req.params.courseId);
    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
});

// GET /subscriptions/students/:studentId - Récupérer la liste des inscriptions pour un étudiant
app.get('/subscriptions/students/:studentId', async (req, res, next) => {
  try {
    const subscriptions = await SubscriptionService.getByStudent(req.params.studentId);
    res.status(200).json(subscriptions);
  } catch (error) {
    next(error);
  }
});

// GET /subscriptions/students/:studentId/courses - Récupérer la liste des cours d'un étudiant
app.get('/subscriptions/students/:studentId/courses', async (req, res, next) => {
  try {
    const courses = await SubscriptionService.getCoursesByStudent(req.params.studentId);
    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
});

// DELETE /subscriptions/:id - Désinscrire un étudiant (supprimer une inscription)
app.delete('/subscriptions/:id', async (req, res, next) => {
  try {
    const deleted = await SubscriptionService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: 404, error: 'Inscription non trouvée.' });
    }
    res.status(200).json({ message: 'Inscription supprimée avec succès.' });
  } catch (error) {
    next(error);
  }
});

// Middleware centralisé des erreurs (Doit être placé après toutes les routes)
app.use(errorHandler);

// Lancement du serveur Express
app.listen(port, () => {
  console.log(`Express app listening on port ${port}`);
  const end = moment.now();
  console.log(`Started Express in ${(end - start) / 1000}s`);
});