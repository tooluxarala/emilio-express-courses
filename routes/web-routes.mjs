import express from 'express';
import StudentService from '../services/student-service.mjs';
import CourseService from '../services/course-service.mjs';
import SubscriptionService from '../services/subscription-service.mjs';
import {
  studentSchema,
  studentUpdateSchema,
  courseSchema,
  courseUpdateSchema,
  subscriptionSchema
} from '../middlewares/validation.mjs';

const router = express.Router();
const PAGE_SIZE = 5;

function paginate(items, page) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  return {
    items: items.slice(start, start + PAGE_SIZE),
    currentPage,
    totalPages,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
    prevPage: currentPage - 1,
    nextPage: currentPage + 1
  };
}

function extractErrors(joiError) {
  return joiError.details.map((d) => d.message);
}

/* ==========================================================================
   Tableau de bord
   ========================================================================== */

router.get('/', async (req, res, next) => {
  try {
    const [students, courses, subscriptions] = await Promise.all([
      StudentService.getAll(),
      CourseService.getAll(),
      SubscriptionService.getAll ? SubscriptionService.getAll() : Promise.resolve([])
    ]);

    const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);

    res.render('home', {
      title: 'Tableau de bord',
      studentCount: students.length,
      courseCount: courses.length,
      subscriptionCount: subscriptions.length,
      totalCredits,
      recentStudents: students.slice(-4).reverse(),
      recentCourses: courses.slice(-4).reverse()
    });
  } catch (error) {
    next(error);
  }
});

/* ==========================================================================
   Étudiants
   ========================================================================== */

router.get('/students', async (req, res, next) => {
  try {
    let students = await StudentService.getAll();
    const query = (req.query.q || '').trim().toLowerCase();

    if (query) {
      students = students.filter(
        (s) => s.name.toLowerCase().includes(query) || s.number.toLowerCase().includes(query)
      );
    }

    const page = paginate(students, parseInt(req.query.page, 10) || 1);
    res.render('students/list', { title: 'Étudiants', students: page.items, query, ...page });
  } catch (error) {
    next(error);
  }
});

router.get('/students/new', (req, res) => {
  res.render('students/form', { title: 'Nouvel étudiant', isEdit: false, student: {} });
});

router.post('/students/new', async (req, res, next) => {
  const { error, value } = studentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).render('students/form', {
      title: 'Nouvel étudiant',
      isEdit: false,
      student: req.body,
      errors: extractErrors(error)
    });
  }

  try {
    await StudentService.add(value);
    req.flash('success_msg', `Étudiant "${value.name}" ajouté avec succès.`);
    res.redirect('/app/students');
  } catch (dbError) {
    const message = dbError.message.includes('UNIQUE constraint failed')
      ? 'Un étudiant avec ce matricule existe déjà.'
      : dbError.message;
    res.status(400).render('students/form', {
      title: 'Nouvel étudiant',
      isEdit: false,
      student: req.body,
      errors: [message]
    });
  }
});

router.get('/students/:id', async (req, res, next) => {
  try {
    const student = await StudentService.get(req.params.id);
    if (!student) {
      req.flash('error_msg', 'Étudiant non trouvé.');
      return res.redirect('/app/students');
    }
    const courses = await SubscriptionService.getCoursesByStudent(student.id);
    const subscriptions = await SubscriptionService.getByStudent(student.id);
    const coursesWithSubscription = courses.map((c) => {
      const sub = subscriptions.find((s) => s.course_id === c.id);
      return { ...c, subscriptionId: sub ? sub.id : null };
    });
    res.render('students/detail', { title: student.name, student, courses: coursesWithSubscription });
  } catch (error) {
    next(error);
  }
});

router.get('/students/:id/edit', async (req, res, next) => {
  try {
    const student = await StudentService.get(req.params.id);
    if (!student) {
      req.flash('error_msg', 'Étudiant non trouvé.');
      return res.redirect('/app/students');
    }
    res.render('students/form', { title: 'Modifier étudiant', isEdit: true, student });
  } catch (error) {
    next(error);
  }
});

router.post('/students/:id/edit', async (req, res, next) => {
  const { error, value } = studentUpdateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).render('students/form', {
      title: 'Modifier étudiant',
      isEdit: true,
      student: { id: req.params.id, ...req.body },
      errors: extractErrors(error)
    });
  }

  try {
    const updated = await StudentService.update(req.params.id, value);
    if (!updated) {
      req.flash('error_msg', 'Étudiant non trouvé.');
      return res.redirect('/app/students');
    }
    req.flash('success_msg', `Étudiant "${updated.name}" mis à jour avec succès.`);
    res.redirect(`/app/students/${updated.id}`);
  } catch (dbError) {
    const message = dbError.message.includes('UNIQUE constraint failed')
      ? 'Un étudiant avec ce matricule existe déjà.'
      : dbError.message;
    res.status(400).render('students/form', {
      title: 'Modifier étudiant',
      isEdit: true,
      student: { id: req.params.id, ...req.body },
      errors: [message]
    });
  }
});

router.post('/students/:id/delete', async (req, res, next) => {
  try {
    const deleted = await StudentService.delete(req.params.id);
    req.flash(deleted ? 'success_msg' : 'error_msg', deleted ? 'Étudiant supprimé avec succès.' : 'Étudiant non trouvé.');
    res.redirect('/app/students');
  } catch (error) {
    next(error);
  }
});

/* ==========================================================================
   Cours
   ========================================================================== */

router.get('/courses', async (req, res, next) => {
  try {
    const courses = await CourseService.getAll();
    const page = paginate(courses, parseInt(req.query.page, 10) || 1);
    res.render('courses/list', { title: 'Cours', courses: page.items, ...page });
  } catch (error) {
    next(error);
  }
});

router.get('/courses/new', (req, res) => {
  res.render('courses/form', { title: 'Nouveau cours', isEdit: false, course: {} });
});

router.post('/courses/new', async (req, res, next) => {
  const { error, value } = courseSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).render('courses/form', {
      title: 'Nouveau cours',
      isEdit: false,
      course: req.body,
      errors: extractErrors(error)
    });
  }

  try {
    await CourseService.add(value);
    req.flash('success_msg', `Cours "${value.name}" ajouté avec succès.`);
    res.redirect('/app/courses');
  } catch (dbError) {
    const message = dbError.message.includes('UNIQUE constraint failed')
      ? 'Un cours avec ce code existe déjà.'
      : dbError.message;
    res.status(400).render('courses/form', {
      title: 'Nouveau cours',
      isEdit: false,
      course: req.body,
      errors: [message]
    });
  }
});

router.get('/courses/:id', async (req, res, next) => {
  try {
    const course = await CourseService.get(req.params.id);
    if (!course) {
      req.flash('error_msg', 'Cours non trouvé.');
      return res.redirect('/app/courses');
    }
    const students = await SubscriptionService.getStudentsByCourse(course.id);
    res.render('courses/detail', { title: course.name, course, students });
  } catch (error) {
    next(error);
  }
});

router.get('/courses/:id/edit', async (req, res, next) => {
  try {
    const course = await CourseService.get(req.params.id);
    if (!course) {
      req.flash('error_msg', 'Cours non trouvé.');
      return res.redirect('/app/courses');
    }
    res.render('courses/form', { title: 'Modifier le cours', isEdit: true, course });
  } catch (error) {
    next(error);
  }
});

router.post('/courses/:id/edit', async (req, res, next) => {
  const { error, value } = courseUpdateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).render('courses/form', {
      title: 'Modifier le cours',
      isEdit: true,
      course: { id: req.params.id, ...req.body },
      errors: extractErrors(error)
    });
  }

  try {
    const updated = await CourseService.update(req.params.id, value);
    if (!updated) {
      req.flash('error_msg', 'Cours non trouvé.');
      return res.redirect('/app/courses');
    }
    req.flash('success_msg', `Cours "${updated.name}" mis à jour avec succès.`);
    res.redirect(`/app/courses/${updated.id}`);
  } catch (dbError) {
    const message = dbError.message.includes('UNIQUE constraint failed')
      ? 'Un cours avec ce code existe déjà.'
      : dbError.message;
    res.status(400).render('courses/form', {
      title: 'Modifier le cours',
      isEdit: true,
      course: { id: req.params.id, ...req.body },
      errors: [message]
    });
  }
});

router.post('/courses/:id/delete', async (req, res, next) => {
  try {
    const deleted = await CourseService.delete(req.params.id);
    req.flash(deleted ? 'success_msg' : 'error_msg', deleted ? 'Cours supprimé avec succès.' : 'Cours non trouvé.');
    res.redirect('/app/courses');
  } catch (error) {
    next(error);
  }
});

/* ==========================================================================
   Inscriptions
   ========================================================================== */

router.get('/subscriptions', async (req, res, next) => {
  try {
    const subscriptions = await SubscriptionService.getAll();
    const page = paginate(subscriptions, parseInt(req.query.page, 10) || 1);
    res.render('subscriptions/list', { title: 'Inscriptions', subscriptions: page.items, ...page });
  } catch (error) {
    next(error);
  }
});

router.get('/subscriptions/new', async (req, res, next) => {
  try {
    const [students, courses] = await Promise.all([StudentService.getAll(), CourseService.getAll()]);
    res.render('subscriptions/form', {
      title: 'Nouvelle inscription',
      studentOptions: students.map((s) => ({ id: s.id, label: `${s.name} (${s.number})` })),
      courseOptions: courses.map((c) => ({ id: c.id, label: `${c.name} (${c.code})` })),
      selectedStudentId: req.query.student_id ? Number(req.query.student_id) : null,
      selectedCourseId: req.query.course_id ? Number(req.query.course_id) : null
    });
  } catch (error) {
    next(error);
  }
});

router.post('/subscriptions/new', async (req, res, next) => {
  const payload = {
    student_id: Number(req.body.student_id),
    course_id: Number(req.body.course_id)
  };
  const { error } = subscriptionSchema.validate(payload, { abortEarly: false });

  if (error) {
    const [students, courses] = await Promise.all([StudentService.getAll(), CourseService.getAll()]);
    return res.status(400).render('subscriptions/form', {
      title: 'Nouvelle inscription',
      studentOptions: students.map((s) => ({ id: s.id, label: `${s.name} (${s.number})` })),
      courseOptions: courses.map((c) => ({ id: c.id, label: `${c.name} (${c.code})` })),
      errors: extractErrors(error)
    });
  }

  try {
    await SubscriptionService.add(payload.student_id, payload.course_id);
    req.flash('success_msg', 'Inscription créée avec succès.');
    res.redirect('/app/subscriptions');
  } catch (dbError) {
    const message = dbError.message.includes('UNIQUE constraint failed')
      ? 'Cet étudiant est déjà inscrit à ce cours.'
      : dbError.message;
    const [students, courses] = await Promise.all([StudentService.getAll(), CourseService.getAll()]);
    res.status(400).render('subscriptions/form', {
      title: 'Nouvelle inscription',
      studentOptions: students.map((s) => ({ id: s.id, label: `${s.name} (${s.number})` })),
      courseOptions: courses.map((c) => ({ id: c.id, label: `${c.name} (${c.code})` })),
      errors: [message]
    });
  }
});

router.post('/subscriptions/:id/delete', async (req, res, next) => {
  try {
    const deleted = await SubscriptionService.delete(req.params.id);
    req.flash(deleted ? 'success_msg' : 'error_msg', deleted ? 'Inscription supprimée avec succès.' : 'Inscription non trouvée.');
    res.redirect(req.get('Referer') || '/app/subscriptions');
  } catch (error) {
    next(error);
  }
});

export default router;
