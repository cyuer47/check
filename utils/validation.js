import { z } from 'zod';

/**
 * Common validation schemas
 */

// User schemas
export const userRegistrationSchema = z.object({
  naam: z.string().min(2, 'Naam moet minimaal 2 karakters bevatten').max(100, 'Naam mag niet langer zijn dan 100 karakters'),
  email: z.string().email('Ongeldig e-mailadres').max(255, 'E-mail mag niet langer zijn dan 255 karakters'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 karakters bevatten').max(255, 'Wachtwoord mag niet langer zijn dan 255 karakters'),
  role: z.enum(['teacher', 'student']).optional().default('teacher')
});

export const userLoginSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(1, 'Wachtwoord is verplicht')
});

export const userUpdateSchema = z.object({
  naam: z.string().min(2, 'Naam moet minimaal 2 karakters bevatten').max(100, 'Naam mag niet langer zijn dan 100 karakters').optional(),
  email: z.string().email('Ongeldig e-mailadres').max(255, 'E-mail mag niet langer zijn dan 255 karakters').optional(),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 karakters bevatten').max(255, 'Wachtwoord mag niet langer zijn dan 255 karakters').optional(),
  vakken: z.string().max(500, 'Vakken mag niet langer zijn dan 500 karakters').optional(),
  bio: z.string().max(1000, 'Bio mag niet langer zijn dan 1000 karakters').optional(),
  is_public: z.boolean().optional(),
  avatar: z.string().optional() // Data URL for avatar
});

// Class schemas
export const klasCreateSchema = z.object({
  naam: z.string().min(2, 'Klasnaam moet minimaal 2 karakters bevatten').max(100, 'Klasnaam mag niet langer zijn dan 100 karakters'),
  vak: z.string().min(2, 'Vak moet minimaal 2 karakters bevatten').max(50, 'Vak mag niet langer zijn dan 50 karakters')
});

export const klasUpdateSchema = z.object({
  naam: z.string().min(2, 'Klasnaam moet minimaal 2 karakters bevatten').max(100, 'Klasnaam mag niet langer zijn dan 100 karakters').optional(),
  vak: z.string().min(2, 'Vak moet minimaal 2 karakters bevatten').max(50, 'Vak mag niet langer zijn dan 50 karakters').optional()
});

// Question list schemas
export const vragenlijstCreateSchema = z.object({
  naam: z.string().min(2, 'Naam moet minimaal 2 karakters bevatten').max(200, 'Naam mag niet langer zijn dan 200 karakters'),
  beschrijving: z.string().max(1000, 'Beschrijving mag niet langer zijn dan 1000 karakters').optional(),
  klas_id: z.number().int().positive('Klas ID moet een positief getal zijn')
});

export const vragenlijstUpdateSchema = z.object({
  naam: z.string().min(2, 'Naam moet minimaal 2 karakters bevatten').max(200, 'Naam mag niet langer zijn dan 200 karakters').optional(),
  beschrijving: z.string().max(1000, 'Beschrijving mag niet langer zijn dan 1000 karakters').optional()
});

// Question schemas
export const vraagCreateSchema = z.object({
  vragenlijst_id: z.number().int().positive('Vragenlijst ID moet een positief getal zijn'),
  vraag: z.string().min(3, 'Vraag moet minimaal 3 karakters bevatten').max(1000, 'Vraag mag niet langer zijn dan 1000 karakters'),
  antwoord: z.string().min(1, 'Antwoord is verplicht').max(500, 'Antwoord mag niet langer zijn dan 500 karakters'),
  type: z.enum(['open', 'multiple', 'true_false']).default('open'),
  opties: z.array(z.string().max(200, 'Optie mag niet langer zijn dan 200 karakters')).optional(),
  punten: z.number().int().min(1, 'Punten moet minimaal 1 zijn').max(100, 'Punten mag niet meer zijn dan 100').default(1)
});

export const vraagUpdateSchema = z.object({
  vraag: z.string().min(3, 'Vraag moet minimaal 3 karakters bevatten').max(1000, 'Vraag mag niet langer zijn dan 1000 karakters').optional(),
  antwoord: z.string().min(1, 'Antwoord is verplicht').max(500, 'Antwoord mag niet langer zijn dan 500 karakters').optional(),
  type: z.enum(['open', 'multiple', 'true_false']).optional(),
  opties: z.array(z.string().max(200, 'Optie mag niet langer zijn dan 200 karakters')).optional(),
  punten: z.number().int().min(1, 'Punten moet minimaal 1 zijn').max(100, 'Punten mag niet meer zijn dan 100').optional()
});

// Session schemas
export const sessieCreateSchema = z.object({
  vragenlijst_id: z.number().int().positive('Vragenlijst ID moet een positief getal zijn'),
  klas_id: z.number().int().positive('Klas ID moet een positief getal zijn')
});

export const sessieUpdateSchema = z.object({
  actief: z.boolean().optional(),
  current_question_id: z.number().int().positive('Vraag ID moet een positief getal zijn').optional(),
  vraag_start_time: z.string().datetime().optional()
});

// Answer schemas
export const answerSubmitSchema = z.object({
  sessie_id: z.number().int().positive('Sessie ID moet een positief getal zijn'),
  vraag_id: z.number().int().positive('Vraag ID moet een positief getal zijn'),
  antwoord: z.string().min(1, 'Antwoord is verplicht').max(500, 'Antwoord mag niet langer zijn dan 500 karakters'),
  tijd: z.number().int().min(0, 'Tijd moet een positief getal zijn').optional()
});

// Student schemas
export const studentCreateSchema = z.object({
  naam: z.string().min(2, 'Naam moet minimaal 2 karakters bevatten').max(100, 'Naam mag niet langer zijn dan 100 karakters'),
  klas_id: z.number().int().positive('Klas ID moet een positief getal zijn'),
  leerlingnummer: z.string().max(50, 'Leerlingnummer mag niet langer zijn dan 50 karakters').optional()
});

export const studentUpdateSchema = z.object({
  naam: z.string().min(2, 'Naam moet minimaal 2 karakters bevatten').max(100, 'Naam mag niet langer zijn dan 100 karakters').optional(),
  leerlingnummer: z.string().max(50, 'Leerlingnummer mag niet langer zijn dan 50 karakters').optional()
});

// Search schemas
export const searchSchema = z.object({
  q: z.string().min(1, 'Zoekterm is verplicht').max(100, 'Zoekterm mag niet langer zijn dan 100 karakters'),
  limit: z.number().int().min(1, 'Limit moet minimaal 1 zijn').max(50, 'Limit mag niet meer zijn dan 50').optional().default(10),
  offset: z.number().int().min(0, 'Offset moet een positief getal zijn').optional().default(0)
});

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Pagina moet minimaal 1 zijn').optional().default(1),
  limit: z.number().int().min(1, 'Limit moet minimaal 1 zijn').max(100, 'Limit mag niet meer zijn dan 100').optional().default(20)
});

/**
 * Validation middleware factory
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      let data;
      
      switch (source) {
        case 'body':
          data = req.body;
          break;
        case 'query':
          data = req.query;
          break;
        case 'params':
          data = req.params;
          break;
        default:
          data = req.body;
      }
      
      const validatedData = schema.parse(data);
      
      // Replace request data with validated data
      switch (source) {
        case 'body':
          req.body = validatedData;
          break;
        case 'query':
          req.query = validatedData;
          break;
        case 'params':
          req.params = validatedData;
          break;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message
      });
    }
  };
};

/**
 * Common validation middleware
 */
export const validateId = (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid ID parameter' });
  }
  req.params.id = id;
  next();
};
