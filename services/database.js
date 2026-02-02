import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { config } from '../config/index.js';
import path from 'path';
import fs from 'fs';

/**
 * Database service - handles all database operations
 */
class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize database connection
   */
  async initialize() {
    try {
      const dbPath = path.resolve(config.databasePath);
      
      // Ensure database directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      this.db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });
      
      // Enable foreign keys
      await this.db.exec('PRAGMA foreign_keys = ON');
      
      console.log('Database connected successfully');
      this.isInitialized = true;
      
      return this.db;
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.isInitialized = false;
      console.log('Database connection closed');
    }
  }

  /**
   * Get database instance
   */
  getInstance() {
    if (!this.isInitialized || !this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /**
   * Execute a query and return the first result
   */
  async get(sql, ...params) {
    const db = this.getInstance();
    return await db.get(sql, ...params);
  }

  /**
   * Execute a query and return all results
   */
  async all(sql, ...params) {
    const db = this.getInstance();
    return await db.all(sql, ...params);
  }

  /**
   * Execute a query and return the last inserted ID
   */
  async run(sql, ...params) {
    const db = this.getInstance();
    return await db.run(sql, ...params);
  }

  /**
   * Execute multiple queries in a transaction
   */
  async transaction(queries) {
    const db = this.getInstance();
    
    await db.exec('BEGIN TRANSACTION');
    
    try {
      const results = [];
      
      for (const query of queries) {
        const { sql, params = [] } = query;
        
        if (query.type === 'run') {
          const result = await db.run(sql, ...params);
          results.push(result);
        } else if (query.type === 'get') {
          const result = await db.get(sql, ...params);
          results.push(result);
        } else if (query.type === 'all') {
          const result = await db.all(sql, ...params);
          results.push(result);
        } else {
          // Default to run
          const result = await db.run(sql, ...params);
          results.push(result);
        }
      }
      
      await db.exec('COMMIT');
      return results;
    } catch (error) {
      await db.exec('ROLLBACK');
      throw error;
    }
  }

  // User operations
  async createUser(userData) {
    const { naam, email, password, role = 'teacher', avatar = null } = userData;
    
    const sql = `
      INSERT INTO docenten (naam, email, password, role, avatar, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `;
    
    const result = await this.run(sql, naam, email, password, role, avatar);
    return result.lastID;
  }

  async getUserByEmail(email) {
    const sql = 'SELECT * FROM docenten WHERE email = ?';
    return await this.get(sql, email);
  }

  async getUserById(id) {
    const sql = 'SELECT * FROM docenten WHERE id = ?';
    return await this.get(sql, id);
  }

  async updateUser(id, userData) {
    const fields = [];
    const values = [];
    
    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(id);
    const sql = `UPDATE docenten SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await this.run(sql, ...values);
    return result.changes > 0;
  }

  // Class operations
  async createKlas(klasData) {
    const { naam, vak, docent_id, klascode } = klasData;
    
    const sql = `
      INSERT INTO klassen (naam, vak, docent_id, klascode, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `;
    
    const result = await this.run(sql, naam, vak, docent_id, klascode);
    return result.lastID;
  }

  async getKlassenByDocent(docentId) {
    const sql = 'SELECT * FROM klassen WHERE docent_id = ? ORDER BY id DESC';
    return await this.all(sql, docentId);
  }

  async getKlasById(id) {
    const sql = 'SELECT * FROM klassen WHERE id = ?';
    return await this.get(sql, id);
  }

  async updateKlas(id, klasData) {
    const fields = [];
    const values = [];
    
    Object.keys(klasData).forEach(key => {
      if (klasData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(klasData[key]);
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(id);
    const sql = `UPDATE klassen SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await this.run(sql, ...values);
    return result.changes > 0;
  }

  async deleteKlas(id) {
    const sql = 'DELETE FROM klassen WHERE id = ?';
    const result = await this.run(sql, id);
    return result.changes > 0;
  }

  // Student operations
  async createStudent(studentData) {
    const { naam, klas_id, leerlingnummer } = studentData;
    
    const sql = `
      INSERT INTO leerlingen (naam, klas_id, leerlingnummer, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `;
    
    const result = await this.run(sql, naam, klas_id, leerlingnummer);
    return result.lastID;
  }

  async getStudentsByKlas(klasId) {
    const sql = 'SELECT * FROM leerlingen WHERE klas_id = ? ORDER BY naam';
    return await this.all(sql, klasId);
  }

  async getStudentById(id) {
    const sql = 'SELECT * FROM leerlingen WHERE id = ?';
    return await this.get(sql, id);
  }

  // Question list operations
  async createVragenlijst(vragenlijstData) {
    const { naam, beschrijving, klas_id } = vragenlijstData;
    
    const sql = `
      INSERT INTO vragenlijsten (naam, beschrijving, klas_id, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `;
    
    const result = await this.run(sql, naam, beschrijving, klas_id);
    return result.lastID;
  }

  async getVragenlijstenByKlas(klasId) {
    const sql = `
      SELECT vl.*, k.naam as klas_naam, COUNT(v.id) as vraag_count
      FROM vragenlijsten vl
      LEFT JOIN klassen k ON vl.klas_id = k.id
      LEFT JOIN vragen v ON vl.id = v.vragenlijst_id
      WHERE vl.klas_id = ?
      GROUP BY vl.id
      ORDER BY vl.created_at DESC
    `;
    
    return await this.all(sql, klasId);
  }

  async getVragenlijstById(id) {
    const sql = `
      SELECT vl.*, k.naam as klas_naam
      FROM vragenlijsten vl
      LEFT JOIN klassen k ON vl.klas_id = k.id
      WHERE vl.id = ?
    `;
    
    return await this.get(sql, id);
  }

  // Question operations
  async createVraag(vraagData) {
    const { vragenlijst_id, vraag, antwoord, type, opties, punten } = vraagData;
    
    const sql = `
      INSERT INTO vragen (vragenlijst_id, vraag, antwoord, type, opties, punten, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    
    const result = await this.run(sql, vragenlijst_id, vraag, antwoord, type, 
      opties ? JSON.stringify(opties) : null, punten);
    return result.lastID;
  }

  async getVragenByVragenlijst(vragenlijstId) {
    const sql = 'SELECT * FROM vragen WHERE vragenlijst_id = ? ORDER BY created_at';
    const vragen = await this.all(sql, vragenlijstId);
    
    // Parse opties JSON
    return vragen.map(vraag => ({
      ...vraag,
      opties: vraag.opties ? JSON.parse(vraag.opties) : null
    }));
  }

  async getVraagById(id) {
    const sql = 'SELECT * FROM vragen WHERE id = ?';
    const vraag = await this.get(sql, id);
    
    if (vraag && vraag.opties) {
      vraag.opties = JSON.parse(vraag.opties);
    }
    
    return vraag;
  }

  // Session operations
  async createSessie(sessieData) {
    const { vragenlijst_id, klas_id, docent_id } = sessieData;
    
    const sql = `
      INSERT INTO sessies (vragenlijst_id, klas_id, docent_id, started_at, created_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    const result = await this.run(sql, vragenlijst_id, klas_id, docent_id);
    return result.lastID;
  }

  async getSessieById(id) {
    const sql = `
      SELECT s.*, vl.naam as vragenlijst_naam, k.naam as klas_naam, d.naam as docent_naam
      FROM sessies s
      LEFT JOIN vragenlijsten vl ON s.vragenlijst_id = vl.id
      LEFT JOIN klassen k ON s.klas_id = k.id
      LEFT JOIN docenten d ON s.docent_id = d.id
      WHERE s.id = ?
    `;
    
    return await this.get(sql, id);
  }

  async getSessiesByDocent(docentId) {
    const sql = `
      SELECT s.*, vl.naam as vragenlijst_naam, k.naam as klas_naam
      FROM sessies s
      LEFT JOIN vragenlijsten vl ON s.vragenlijst_id = vl.id
      LEFT JOIN klassen k ON s.klas_id = k.id
      WHERE s.docent_id = ?
      ORDER BY s.created_at DESC
    `;
    
    return await this.all(sql, docentId);
  }

  // Search operations
  async searchPublicProfiles(query, limit = 10, offset = 0) {
    const sql = `
      SELECT id, naam, email, avatar, bio, is_public
      FROM docenten
      WHERE is_public = 1 
        AND (naam LIKE ? OR email LIKE ?)
      ORDER BY naam
      LIMIT ? OFFSET ?
    `;
    
    const searchTerm = `%${query}%`;
    return await this.all(sql, searchTerm, searchTerm, limit, offset);
  }

  // Statistics operations
  async getDashboardStats(docentId) {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM klassen WHERE docent_id = ?) as total_klassen,
        (SELECT COUNT(*) FROM vragenlijsten vl 
         JOIN klassen k ON vl.klas_id = k.id 
         WHERE k.docent_id = ?) as total_vragenlijsten,
        (SELECT COUNT(*) FROM leerlingen l 
         JOIN klassen k ON l.klas_id = k.id 
         WHERE k.docent_id = ?) as total_leerlingen,
        (SELECT COUNT(*) FROM sessies WHERE docent_id = ?) as total_sessies
    `;
    
    return await this.get(sql, docentId, docentId, docentId, docentId);
  }
}

// Create singleton instance
export const db = new DatabaseService();

export default db;
