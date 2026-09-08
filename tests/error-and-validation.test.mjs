import {
  studentSchema,
  studentUpdateSchema,
  courseSchema,
  courseUpdateSchema,
  subscriptionSchema
} from '../middlewares/validation.mjs';
import { errorHandler } from '../middlewares/error-handler.mjs';

describe('Schémas de validation Joi', () => {
  describe('studentSchema', () => {
    it('accepte un étudiant valide', () => {
      const { error } = studentSchema.validate({ name: 'Grace Kalombo', number: 'STU-001' });
      expect(error).toBeUndefined();
    });

    it('rejette un étudiant sans nom', () => {
      const { error } = studentSchema.validate({ number: 'STU-001' });
      expect(error).toBeDefined();
    });

    it('rejette un étudiant sans matricule', () => {
      const { error } = studentSchema.validate({ name: 'Grace Kalombo' });
      expect(error).toBeDefined();
    });
  });

  describe('studentUpdateSchema', () => {
    it('accepte une mise à jour partielle', () => {
      const { error } = studentUpdateSchema.validate({ name: 'Grace K. Mwamba' });
      expect(error).toBeUndefined();
    });

    it('rejette un objet vide', () => {
      const { error } = studentUpdateSchema.validate({});
      expect(error).toBeDefined();
    });
  });

  describe('courseSchema', () => {
    it('accepte un cours valide sans crédits (défaut à 0)', () => {
      const { error, value } = courseSchema.validate({ name: 'Web Development', code: 'CS101' });
      expect(error).toBeUndefined();
      expect(value.credits).toBe(0);
    });

    it('rejette un cours sans code', () => {
      const { error } = courseSchema.validate({ name: 'Web Development' });
      expect(error).toBeDefined();
    });

    it('rejette des crédits négatifs', () => {
      const { error } = courseSchema.validate({ name: 'Web Development', code: 'CS101', credits: -1 });
      expect(error).toBeDefined();
    });
  });

  describe('courseUpdateSchema', () => {
    it('rejette un objet vide', () => {
      const { error } = courseUpdateSchema.validate({});
      expect(error).toBeDefined();
    });
  });

  describe('subscriptionSchema', () => {
    it('accepte student_id et course_id valides', () => {
      const { error } = subscriptionSchema.validate({ student_id: 1, course_id: 2 });
      expect(error).toBeUndefined();
    });

    it('rejette un student_id manquant', () => {
      const { error } = subscriptionSchema.validate({ course_id: 2 });
      expect(error).toBeDefined();
    });

    it('rejette un course_id non entier', () => {
      const { error } = subscriptionSchema.validate({ student_id: 1, course_id: 'abc' });
      expect(error).toBeDefined();
    });
  });
});

describe('errorHandler (middleware centralisé)', () => {
  function mockRes() {
    return {
      statusCode: null,
      body: null,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.body = payload; return this; }
    };
  }

  it('retourne 500 par défaut pour une erreur sans statut', () => {
    const res = mockRes();
    errorHandler(new Error('Panne inattendue'), {}, res, () => {});
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
  });

  it("respecte le statut porté par l'erreur", () => {
    const res = mockRes();
    const err = new Error('Requête invalide');
    err.status = 400;
    errorHandler(err, {}, res, () => {});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Requête invalide');
  });
});
