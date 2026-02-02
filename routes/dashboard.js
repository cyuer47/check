import express from 'express';
import { db } from '../services/database.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get dashboard data
 * GET /api/dashboard
 */
router.get('/', auth, async (req, res, next) => {
  try {
    const docentId = req.user.id;
    
    // Get basic user info
    const docent = await db.getUserById(docentId);
    
    // Get classes
    const klassen = await db.getKlassenByDocent(docentId);
    
    // Get licenses
    let licenties = [];
    try {
      licenties = await db.all(
        "SELECT * FROM licenties WHERE docent_id = ? AND actief = 1 AND (vervalt_op IS NULL OR DATE(vervalt_op) >= DATE('now'))",
        docentId
      );
    } catch (err) {
      console.warn("Could not load licenties:", err.message);
      licenties = [];
    }
    
    const heeft_licentie = Array.isArray(licenties)
      ? licenties.some((l) => l.type === "vragenlijsten")
      : false;
    
    // Get library question lists
    let biblio_lijsten = [];
    try {
      if (docentId === 3) {
        biblio_lijsten = await db.all(
          "SELECT * FROM bibliotheek_vragenlijsten ORDER BY id DESC"
        );
      } else {
        biblio_lijsten = await db.all(
          "SELECT * FROM bibliotheek_vragenlijsten WHERE licentie_type != 'verborgen' ORDER BY id DESC"
        );
      }
    } catch (err) {
      console.warn("Could not load bibliotheek_vragenlijsten:", err.message);
      biblio_lijsten = [];
    }
    
    // Get books
    let boeken = [];
    try {
      if (docentId === -1) {
        boeken = await db.all(
          "SELECT id, titel, omschrijving FROM boeken ORDER BY id DESC"
        );
      } else {
        boeken = await db.all(`
          SELECT DISTINCT b.id, b.titel, b.omschrijving
          FROM boeken b
          JOIN licentie_boeken lb ON lb.boek_id = b.id
          JOIN licenties l ON l.id = lb.licentie_id
          WHERE l.docent_id = ? AND l.actief = 1
            AND (l.vervalt_op IS NULL OR DATE(l.vervalt_op) >= DATE('now'))
          ORDER BY b.id DESC
        `, docentId);
      }
    } catch (err) {
      console.warn("Could not load boeken:", err.message);
      boeken = [];
    }
    
    res.json({
      docent,
      klassen,
      licenties,
      heeft_licentie,
      biblio_lijsten,
      boeken,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get dashboard statistics
 * GET /api/dashboard/stats
 */
router.get('/stats', auth, async (req, res, next) => {
  try {
    const stats = await db.getDashboardStats(req.user.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * Create new class
 * POST /api/dashboard/klassen
 */
router.post('/klassen', auth, async (req, res, next) => {
  try {
    const { naam, vak } = req.body;
    
    if (!naam || !vak) {
      return res.status(400).json({ error: 'Naam and vak are required' });
    }
    
    // Generate class code
    const klascode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const klasId = await db.createKlas({
      naam,
      vak,
      docent_id: req.user.id,
      klascode
    });
    
    const klas = await db.getKlasById(klasId);
    
    res.status(201).json({ klas });
  } catch (error) {
    next(error);
  }
});

/**
 * Get classes
 * GET /api/dashboard/klassen
 */
router.get('/klassen', auth, async (req, res, next) => {
  try {
    const klassen = await db.getKlassenByDocent(req.user.id);
    res.json({ klassen });
  } catch (error) {
    next(error);
  }
});

/**
 * Get class by ID
 * GET /api/dashboard/klassen/:id
 */
router.get('/klassen/:id', auth, async (req, res, next) => {
  try {
    const klasId = parseInt(req.params.id);
    
    if (isNaN(klasId)) {
      return res.status(400).json({ error: 'Invalid class ID' });
    }
    
    const klas = await db.getKlasById(klasId);
    
    if (!klas) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Check permission
    if (klas.docent_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get students for this class
    const students = await db.getStudentsByKlas(klasId);
    
    res.json({ klas, students });
  } catch (error) {
    next(error);
  }
});

/**
 * Update class
 * PUT /api/dashboard/klassen/:id
 */
router.put('/klassen/:id', auth, async (req, res, next) => {
  try {
    const klasId = parseInt(req.params.id);
    
    if (isNaN(klasId)) {
      return res.status(400).json({ error: 'Invalid class ID' });
    }
    
    const { naam, vak } = req.body;
    
    // Check permission
    const existingKlas = await db.getKlasById(klasId);
    if (!existingKlas) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    if (existingKlas.docent_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updated = await db.updateKlas(klasId, { naam, vak });
    
    if (!updated) {
      return res.status(400).json({ error: 'Failed to update class' });
    }
    
    const klas = await db.getKlasById(klasId);
    res.json({ klas });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete class
 * DELETE /api/dashboard/klassen/:id
 */
router.delete('/klassen/:id', auth, async (req, res, next) => {
  try {
    const klasId = parseInt(req.params.id);
    
    if (isNaN(klasId)) {
      return res.status(400).json({ error: 'Invalid class ID' });
    }
    
    // Check permission
    const klas = await db.getKlasById(klasId);
    if (!klas) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    if (klas.docent_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const deleted = await db.deleteKlas(klasId);
    
    if (!deleted) {
      return res.status(400).json({ error: 'Failed to delete class' });
    }
    
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * Get question lists for class
 * GET /api/dashboard/klassen/:id/vragenlijsten
 */
router.get('/klassen/:id/vragenlijsten', auth, async (req, res, next) => {
  try {
    const klasId = parseInt(req.params.id);
    
    if (isNaN(klasId)) {
      return res.status(400).json({ error: 'Invalid class ID' });
    }
    
    // Check permission
    const klas = await db.getKlasById(klasId);
    if (!klas) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    if (klas.docent_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const vragenlijsten = await db.getVragenlijstenByKlas(klasId);
    
    res.json({ vragenlijsten });
  } catch (error) {
    next(error);
  }
});

/**
 * Create student
 * POST /api/dashboard/klassen/:id/students
 */
router.post('/klassen/:id/students', auth, async (req, res, next) => {
  try {
    const klasId = parseInt(req.params.id);
    
    if (isNaN(klasId)) {
      return res.status(400).json({ error: 'Invalid class ID' });
    }
    
    const { naam, leerlingnummer } = req.body;
    
    if (!naam) {
      return res.status(400).json({ error: 'Student name is required' });
    }
    
    // Check permission
    const klas = await db.getKlasById(klasId);
    if (!klas) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    if (klas.docent_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const studentId = await db.createStudent({
      naam,
      klas_id: klasId,
      leerlingnummer
    });
    
    const student = await db.getStudentById(studentId);
    
    res.status(201).json({ student });
  } catch (error) {
    next(error);
  }
});

/**
 * Get library question lists
 * GET /api/dashboard/bibliotheek
 */
router.get('/bibliotheek', auth, async (req, res, next) => {
  try {
    let biblio_lijsten = [];
    
    if (req.user.id === 3) {
      biblio_lijsten = await db.all(
        "SELECT * FROM bibliotheek_vragenlijsten ORDER BY id DESC"
      );
    } else {
      biblio_lijsten = await db.all(
        "SELECT * FROM bibliotheek_vragenlijsten WHERE licentie_type != 'verborgen' ORDER BY id DESC"
      );
    }
    
    res.json({ biblio_lijsten });
  } catch (error) {
    next(error);
  }
});

/**
 * Get books
 * GET /api/dashboard/boeken
 */
router.get('/boeken', auth, async (req, res, next) => {
  try {
    let boeken = [];
    
    if (req.user.id === -1) {
      boeken = await db.all(
        "SELECT id, titel, omschrijving FROM boeken ORDER BY id DESC"
      );
    } else {
      boeken = await db.all(`
        SELECT DISTINCT b.id, b.titel, b.omschrijving
        FROM boeken b
        JOIN licentie_boeken lb ON lb.boek_id = b.id
        JOIN licenties l ON l.id = lb.licentie_id
        WHERE l.docent_id = ? AND l.actief = 1
          AND (l.vervalt_op IS NULL OR DATE(l.vervalt_op) >= DATE('now'))
        ORDER BY b.id DESC
      `, req.user.id);
    }
    
    res.json({ boeken });
  } catch (error) {
    next(error);
  }
});

export default router;
