PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
CREATE TABLE docenten (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        naam TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        wachtwoord TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        reset_token TEXT,
        reset_token_expiry TIMESTAMP,
        avatar TEXT,
        bio TEXT DEFAULT '',
        vakken TEXT DEFAULT '',
        is_public INTEGER DEFAULT 0,
        badge TEXT DEFAULT 'none',
        current_ebook_id INTEGER
      , rol TEXT DEFAULT 'docent');
INSERT INTO docenten VALUES(1,'Iven Boxem','boxemivenruben@gmail.com','$2b$10$3bDFUHBXfQBmjk3WcbsyQOVEQG6zbyc1hpDHgkfsHsME9bZ7proK6','2026-02-02 16:11:23',NULL,NULL,NULL,'','',0,'none',NULL,'docent');
INSERT INTO docenten VALUES(2,'Slim','smne@nassauvincent.nl','$2b$10$15L475/m5gjxe9v3z43BlOo7/fxitMrBtraaJuzIbLIzRdEiNOsoi','2026-02-06 08:58:05',NULL,NULL,NULL,'','',0,'none',NULL,'docent');
CREATE TABLE klassen (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        docent_id INTEGER NOT NULL,
        naam TEXT NOT NULL,
        klascode TEXT UNIQUE NOT NULL,
        vak TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
INSERT INTO klassen VALUES(2,2,'H3C','6F19BF','Duits','2026-02-06 09:00:03');
INSERT INTO klassen VALUES(3,1,'H3C','79A2CF','1','2026-02-20 19:51:51');
CREATE TABLE licenties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        docent_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        actief INTEGER DEFAULT 1,
        vervalt_op DATE DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      , klas_id INTEGER, vragenlijst_limit INTEGER DEFAULT 10);
INSERT INTO licenties VALUES(1,2,'vragenlijsten',1,NULL,'2026-02-06 08:59:44',2,10);
INSERT INTO licenties VALUES(2,1,'vragenlijsten',1,NULL,'2026-02-06 08:59:55',3,10);
CREATE TABLE licentie_boeken (
        licentie_id INTEGER NOT NULL,
        boek_id INTEGER NOT NULL,
        PRIMARY KEY (licentie_id, boek_id)
      );
CREATE TABLE leerlingen (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        klas_id INTEGER NOT NULL,
        naam TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
INSERT INTO leerlingen VALUES(5,2,'Iven','2026-02-10 09:00:55');
INSERT INTO leerlingen VALUES(6,2,'madelene','2026-02-10 09:01:02');
INSERT INTO leerlingen VALUES(7,2,'thomas','2026-02-10 09:01:47');
INSERT INTO leerlingen VALUES(8,2,'aron','2026-02-10 09:02:03');
INSERT INTO leerlingen VALUES(9,2,'sander','2026-02-10 09:02:23');
INSERT INTO leerlingen VALUES(10,2,'Elisabeth / Nina','2026-02-10 09:02:24');
INSERT INTO leerlingen VALUES(11,2,'Marit','2026-02-10 09:02:27');
INSERT INTO leerlingen VALUES(12,2,'Alois','2026-02-10 09:02:28');
INSERT INTO leerlingen VALUES(13,2,'jasper','2026-02-10 09:02:34');
INSERT INTO leerlingen VALUES(14,2,'Ties','2026-02-10 09:02:58');
INSERT INTO leerlingen VALUES(15,2,'Femke','2026-02-10 09:03:00');
INSERT INTO leerlingen VALUES(16,2,'mare','2026-02-10 09:03:03');
INSERT INTO leerlingen VALUES(17,2,'Sophie','2026-02-10 09:03:30');
INSERT INTO leerlingen VALUES(18,3,'Iven','2026-02-20 19:52:30');
CREATE TABLE vragenlijsten (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        klas_id INTEGER NOT NULL,
        naam TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
INSERT INTO vragenlijsten VALUES(2,2,'Lernliste K4 N-D','2026-02-06 09:00:15');
INSERT INTO vragenlijsten VALUES(3,3,'1','2026-02-20 19:51:55');
CREATE TABLE sessies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        klas_id INTEGER NOT NULL,
        vragenlijst_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      , docent_id INTEGER, actief INTEGER DEFAULT 1, started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, round_seen TEXT DEFAULT '[]', prev_student_id INTEGER, current_student_id INTEGER, current_question_id INTEGER, question_start_time TIMESTAMP NULL, is_toets INTEGER DEFAULT 0, locked INTEGER DEFAULT 0);
INSERT INTO sessies VALUES(2,2,2,'2026-02-06 09:01:43',2,0,'2026-02-06 09:01:43','[]',NULL,NULL,6,'2026-02-06 09:06:19',0,0);
INSERT INTO sessies VALUES(3,2,2,'2026-02-09 11:49:47',2,0,'2026-02-09 11:49:47','[]',NULL,NULL,6,'2026-02-09 11:50:11',0,0);
INSERT INTO sessies VALUES(4,2,2,'2026-02-09 19:58:51',2,0,'2026-02-09 19:58:51','[]',NULL,NULL,22,'2026-02-09 20:02:04',0,0);
INSERT INTO sessies VALUES(5,2,2,'2026-02-10 09:00:33',2,1,'2026-02-10 09:00:33','[]',NULL,NULL,6,'2026-02-10 09:06:25',0,0);
INSERT INTO sessies VALUES(6,3,3,'2026-02-20 19:52:07',1,1,'2026-02-20 19:52:07','[]',NULL,NULL,30,'2026-02-20 19:52:41',0,0);
CREATE TABLE vragen (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        klas_id INTEGER NOT NULL,
        vragenlijst_id INTEGER NOT NULL,
        vraag TEXT NOT NULL,
        antwoord TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
INSERT INTO vragen VALUES(5,2,2,'de film','der Film','2026-02-06 09:00:44');
INSERT INTO vragen VALUES(6,2,2,'de ingang','der Eingang','2026-02-06 09:00:51');
INSERT INTO vragen VALUES(7,2,2,'de kookcursus','der Kochkurs','2026-02-06 09:00:58');
INSERT INTO vragen VALUES(8,2,2,'de wedstrijd','der Wettkampf','2026-02-09 11:44:25');
INSERT INTO vragen VALUES(9,2,2,'het feest','die Party','2026-02-09 11:44:33');
INSERT INTO vragen VALUES(10,2,2,'der Umzug','de optocht','2026-02-09 11:44:41');
INSERT INTO vragen VALUES(11,2,2,'het plan','der Plan','2026-02-09 11:44:57');
INSERT INTO vragen VALUES(12,2,2,'de plannen','die PlÃ¤ne','2026-02-09 11:45:01');
INSERT INTO vragen VALUES(13,2,2,'het pretpark','der Freizeitpark','2026-02-09 11:45:10');
INSERT INTO vragen VALUES(14,2,2,'de tipp','der Tipp','2026-02-09 11:45:17');
INSERT INTO vragen VALUES(15,2,2,'de uitgang','der Ausgang','2026-02-09 11:46:16');
INSERT INTO vragen VALUES(16,2,2,'de wandeling','der Spaziergang','2026-02-09 11:46:23');
INSERT INTO vragen VALUES(17,2,2,'de klimhal','die Kletterhalle','2026-02-09 11:46:31');
INSERT INTO vragen VALUES(18,2,2,'het evenement','die Veranstaltung','2026-02-09 11:46:38');
INSERT INTO vragen VALUES(19,2,2,'de biosocoop','das Kino','2026-02-09 11:46:46');
INSERT INTO vragen VALUES(20,2,2,'de training','das Training','2026-02-09 11:46:55');
INSERT INTO vragen VALUES(21,2,2,'het weekend','das Wochenende','2026-02-09 11:47:05');
INSERT INTO vragen VALUES(22,2,2,'het zomerkamp','das Sommercamp','2026-02-09 11:47:15');
INSERT INTO vragen VALUES(23,2,2,'het festival','das Festival','2026-02-09 11:47:22');
INSERT INTO vragen VALUES(24,2,2,'klimmen','klettern','2026-02-09 11:47:31');
INSERT INTO vragen VALUES(25,2,2,'fotograferen','fotografieren','2026-02-09 11:47:44');
INSERT INTO vragen VALUES(26,2,2,'plaatsvinden','stattfinden','2026-02-09 11:47:50');
INSERT INTO vragen VALUES(27,2,2,'vieren','feiern','2026-02-09 11:47:57');
INSERT INTO vragen VALUES(28,3,3,'1','1','2026-02-20 19:51:58');
INSERT INTO vragen VALUES(29,3,3,'2','2','2026-02-20 19:51:59');
INSERT INTO vragen VALUES(30,3,3,'3','3','2026-02-20 19:52:01');
INSERT INTO vragen VALUES(31,3,3,'4','4','2026-02-20 19:52:03');
CREATE TABLE resultaten (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sessie_id INTEGER NOT NULL,
        leerling_id INTEGER NOT NULL,
        vraag_id INTEGER NOT NULL,
        antwoord TEXT NOT NULL,
        correct INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      , status TEXT DEFAULT 'onbekend', points INTEGER DEFAULT 0, antwoord_given TEXT);
INSERT INTO resultaten VALUES(2,2,2,7,'der Kuchcurs',0,'2026-02-06 09:03:00','fout',0,'der Kuchcurs');
INSERT INTO resultaten VALUES(3,2,2,6,'Innengang',0,'2026-02-06 09:06:37','onbekend',0,'Innengang');
INSERT INTO resultaten VALUES(4,4,3,8,'der Kampf',0,'2026-02-09 20:00:55','fout',0,'der Kampf');
INSERT INTO resultaten VALUES(5,4,4,8,'der Wettkampf',0,'2026-02-09 20:01:17','goed',10,'der Wettkampf');
INSERT INTO resultaten VALUES(6,4,4,25,'fotografieren',0,'2026-02-09 20:01:34','goed',10,'fotografieren');
INSERT INTO resultaten VALUES(7,4,3,25,'fotografieren',0,'2026-02-09 20:01:44','goed',10,'fotografieren');
INSERT INTO resultaten VALUES(8,4,4,22,'das Sommercamp',0,'2026-02-09 20:02:14','goed',10,'das Sommercamp');
INSERT INTO resultaten VALUES(9,4,3,22,'das Sommerkampf',0,'2026-02-09 20:02:43','onbekend',0,'das Sommerkampf');
INSERT INTO resultaten VALUES(10,5,5,21,'das Beekned',0,'2026-02-10 09:03:51','onbekend',0,'das Beekned');
INSERT INTO resultaten VALUES(11,5,9,21,'iekend',0,'2026-02-10 09:03:55','onbekend',0,'iekend');
INSERT INTO resultaten VALUES(12,5,8,21,'e',0,'2026-02-10 09:04:05','onbekend',0,'e');
INSERT INTO resultaten VALUES(13,5,11,21,'WOCHENDE',0,'2026-02-10 09:04:17','onbekend',0,'WOCHENDE');
INSERT INTO resultaten VALUES(14,5,14,21,'das',0,'2026-02-10 09:04:42','onbekend',0,'das');
INSERT INTO resultaten VALUES(15,5,15,21,'das wochende',0,'2026-02-10 09:04:57','onbekend',0,'das wochende');
INSERT INTO resultaten VALUES(16,5,8,25,'aron',0,'2026-02-10 09:05:21','onbekend',0,'aron');
INSERT INTO resultaten VALUES(17,5,5,25,'fotografieren',0,'2026-02-10 09:05:25','goed',10,'fotografieren');
INSERT INTO resultaten VALUES(18,5,7,25,'t',0,'2026-02-10 09:05:29','onbekend',0,'t');
INSERT INTO resultaten VALUES(19,5,6,25,'fotografieren',0,'2026-02-10 09:05:33','goed',10,'fotografieren');
INSERT INTO resultaten VALUES(20,5,13,25,'reaf''',0,'2026-02-10 09:05:38','onbekend',0,'reaf''');
INSERT INTO resultaten VALUES(21,5,9,12,'stofzuige',0,'2026-02-10 09:05:55','onbekend',0,'stofzuige');
INSERT INTO resultaten VALUES(22,5,16,12,'anneen',0,'2026-02-10 09:06:06','onbekend',0,'anneen');
INSERT INTO resultaten VALUES(23,5,14,12,'fotografieren',0,'2026-02-10 09:06:10','onbekend',0,'fotografieren');
INSERT INTO resultaten VALUES(24,5,8,12,'aron',0,'2026-02-10 09:06:21','onbekend',0,'aron');
INSERT INTO resultaten VALUES(25,5,12,6,'gang',0,'2026-02-10 09:06:30','onbekend',0,'gang');
INSERT INTO resultaten VALUES(26,5,6,6,'gang',0,'2026-02-10 09:06:38','onbekend',0,'gang');
INSERT INTO resultaten VALUES(27,5,8,6,'aron',0,'2026-02-10 09:06:41','onbekend',0,'aron');
INSERT INTO resultaten VALUES(28,5,14,6,'die eingang',0,'2026-02-10 09:07:06','onbekend',0,'die eingang');
INSERT INTO resultaten VALUES(29,5,10,6,'EIngang',0,'2026-02-10 09:07:38','onbekend',0,'EIngang');
INSERT INTO resultaten VALUES(30,5,16,6,'eingange',0,'2026-02-10 09:08:01','onbekend',0,'eingange');
CREATE TABLE bibliotheek_vragenlijsten (
          id INTEGER PRIMARY KEY,
          naam TEXT NOT NULL,
          beschrijving TEXT DEFAULT NULL,
          licentie_type TEXT DEFAULT 'gratis',
          created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP)
        );
CREATE TABLE banned_leerlingen (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          klas_id INTEGER NOT NULL,
          naam TEXT NOT NULL,
          reden TEXT DEFAULT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP)
        );
CREATE TABLE violations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sessie_id INTEGER DEFAULT NULL,
          klas_id INTEGER NOT NULL,
          leerling_id INTEGER DEFAULT NULL,
          naam TEXT NOT NULL,
          reason TEXT DEFAULT NULL,
          severity INTEGER DEFAULT 1,
          created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP)
        );
CREATE TABLE boeken (
          id INTEGER PRIMARY KEY,
          titel TEXT NOT NULL,
          bestand TEXT NOT NULL,
          omschrijving TEXT DEFAULT NULL
        );
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('docenten',2);
INSERT INTO sqlite_sequence VALUES('klassen',3);
INSERT INTO sqlite_sequence VALUES('vragenlijsten',3);
INSERT INTO sqlite_sequence VALUES('vragen',31);
INSERT INTO sqlite_sequence VALUES('sessies',6);
INSERT INTO sqlite_sequence VALUES('leerlingen',18);
INSERT INTO sqlite_sequence VALUES('resultaten',30);
INSERT INTO sqlite_sequence VALUES('licenties',2);
COMMIT;
