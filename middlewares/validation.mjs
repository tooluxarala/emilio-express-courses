import Joi from 'joi';

export const studentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Le nom de l\'étudiant est obligatoire.',
    'string.empty': 'Le nom ne peut pas être vide.'
  }),
  number: Joi.string().trim().min(2).max(50).required().messages({
    'any.required': 'Le numéro/matricule de l\'étudiant est obligatoire.',
    'string.empty': 'Le numéro ne peut pas être vide.'
  })
});

export const studentUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  number: Joi.string().trim().min(2).max(50).optional()
}).min(1);

export const courseSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Le nom du cours est obligatoire.',
    'string.empty': 'Le nom du cours ne peut pas être vide.'
  }),
  code: Joi.string().trim().min(2).max(20).required().messages({
    'any.required': 'Le code du cours est obligatoire.',
    'string.empty': 'Le code ne peut pas être vide.'
  }),
  credits: Joi.number().integer().min(0).optional().default(0)
});

export const courseUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  code: Joi.string().trim().min(2).max(20).optional(),
  credits: Joi.number().integer().min(0).optional()
}).min(1);

export const subscriptionSchema = Joi.object({
  student_id: Joi.number().integer().positive().required().messages({
    'any.required': 'L\'ID de l\'étudiant (student_id) est obligatoire.'
  }),
  course_id: Joi.number().integer().positive().required().messages({
    'any.required': 'L\'ID du cours (course_id) est obligatoire.'
  })
});

export function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        status: 400,
        error: 'Validation Failed',
        details: error.details.map(d => d.message)
      });
    }
    req.body = value;
    next();
  };
}
