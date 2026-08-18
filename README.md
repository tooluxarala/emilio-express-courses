# Express
Ce projet est une serie d'exercices pour apprendre et se familiariser avec Express. La documentation d'Express ce trouve à cette addresse: https://expressjs.com/
- Elle traite l'inscription d'étudiants à des cours dispensés à l'école tel celui sur Node.js

## I. Initialisation du projet
### 1 - Ajouter NPM au projet 
- Executer la commande ``npm init`` :
```
package name: nodejs-express-courses 
version: (1.0.0) 
description: A Node.js Express course API
entry point: server.mjs
test command: 
git repository: 
keywords: Node.js, Express,Scolar
author: Toolu Xarala
license: (ISC) Apache-2.0

```
- Vérifier que le fichier ``package.json`` est créé avec les bonnes valeurs
```
{
  "name": "odejs-express-courses",
  "version": "1.0.0",
  "description": "A Node.js Express course API",
  "main": "server.mjs",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.mjs"
  },
  "keywords": [
    "Node.js",
    "Express",
    "Scolar"
  ],
  "author": "Toolu Xarala",
  "license": "Apache-2.0"
}
```
- Vérifier également que le fichier ``package-lock.json`` est bien créée. Ce fichier est généré et gèré par NPM donc pas besoin d'y toucher. Il contient toute la hiérachie des dépendances et doit être commité sur Git.
- Créer le fichier ``entry point`` ``server.mjs`` et ajouter le log ``console.log("Hello Express !")``
- lancer le programme avec ``npm start`` et vérifier que le message ``"Hello Express !"`` apparaît dans le terminal.

### 2 - Ajouter la librairie Nodemon en mode developpement pour faire du hot-reloading
- Documentation: https://github.com/remy/nodemon#nodemon
- Executer la commande ``npm install nodemon --save-dev``
- Vérifier que la dépendance de développement ``nodemon``est bien créée dans le fichier ``package.json``:
```
 "devDependencies": {
    "nodemon": "^3.1.4"
  }

```
- Vérifier que le dossier des dépendances ``node_modules`` est bien créé et contient ``Nodemon``. Ce dossier est créé et gèré par NPM, donc pas besoin d'y toucher. C'est un dossier à ne surtout pas commiter dans Git. 
- Modifier le start script pour utiliser ``Nodemon`` :
```
  "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1",
      "start": "nodemon server.mjs"
  }
```
- lancer le programme avec ``npm start`` 
- Ajouter le log ``console.log("New log before start !")`` au début du fichier ``server.mjs`` et enregistrer.
- Vérifier que le programme redémare automatiquement dans le terminal. Le nouveau log doit apparaître dans le terminal.

### 3 - Ajouter la librairie monment.mjs pour calculer le temps de démarrage du server
- Documentation: https://momentjs.com/docs/
- Executer la commande ``npm install moment``
- Vérifier que la dépendance ``moment`` est bien créée dans le fichier ``package.json``:
```
  "dependencies": {
    "moment": "^2.30.1"
  }

```
- Ajouter ce code snippet au début du fichier ``server.mjs``:

```
import moment from 'moment'

let start = moment.now();

```
- Ajouter ce code snippet à la fin du fichier ``server.mjs``:

```
let end = moment.now();
  let startupTimeMilis = end - start
  console.log("Started server in " + (startupTimeMilis / 1000) + "s")

```
- Enregistrer le fichier. Vérifier que le log de démarrage ``"Started server in ...s"`` apparaît dans le terminal.
### 4 - Ajouter la librairie Local-storage pour stocker les informations dans le disk
- Documentation: https://www.npmjs.com/package/node-localstorage
- Executer la commande ``npm i node-localstorage``
- Vérifier que la dépendance ``node-localstorage`` est bien créée dans le fichier ``package.json``
- Ajouter ce code snippet au début du fichier ``server.mjs``:

```
import { LocalStorage } from 'node-localstorage';
let localStorage = new LocalStorage('./student-course.db');

localStorage.setItem('name', 'Toolu Xarala')
console.log("Name: " + localStorage.getItem('name'))

```
- Enregistrer le fichier. Vérifier que le log de démarrage ``"Name: Toolu Xarala"`` apparaît dans le terminal.
### 5 - Installation de Express
- Documentation: https://expressjs.com/
- Executer la commande ``npm i express``
- Vérifier que la dépendance ``express`` est bien créée dans le fichier ``package.json``
- Ajouter/Mettre à jour ce code snippet dans le fichier ``server.mjs``:

```
import express from 'express'

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Express app listening on port ${port}`)
  let end = moment.now();
  let startupTimeMilis = end - start
  console.log("Started Express in " + (startupTimeMilis / 1000) + "s")
})

```
- Enregistrer le fichier. Vérifier que le log de démarrage ``"Started Express in ...s"`` apparaît dans le terminal.
## II. Logique métier
### 1 - Créer le service de gestion des étudiants
- Créer un dossier ``services`` à la racine du projet
- Créer le fichier ``student-service.mjs`` dans le dossier ``services`` et ajouter la class ``StudentService``
- Ajouter une methode de class ``StudentService.add(student)`` qui permet stocker les infomations d'un étudiant (``id,name,number``) dans le ``localStorage``
- Ajouter une methode de class ``StudentService.get([id or number])`` qui permet de lire les infomations d'un étudiant (``id,name,number``) dans le ``localStorage``
  - Tester la methode en important la class ``StudentService`` dans `server.mjs` et ajouter ce snipet après les imports:
    ```
    StudentService.add(
      {
        id: 1,
        name: "Pathé NDIAYE",
        number: "1A-B1"
      }
    );
    console.log("Add/get student: " + StudentService.get(1));
    console.log("Add/get student: " + StudentService.get("1A-B1"));
    ```
  - Verifier que les deux logs apparaît dans le terminal
- Ajouter une methode de class ``StudentService.update(student)`` qui permet de mettre à jour les infomations d'un étudiant (``id,name,number``) dans le ``localStorage``
  - Tester la methode en ajoutant ce snipet dans ``server.mjs``:
    ```
    StudentService.update(
      {
        id: 1,
        name: "Ngoné DIENG",
        number: "1A-B1"
      }
    );
    console.log("Update/get student: " + StudentService.get(1));
    console.log("Update/get student: " + StudentService.get("1A-B1"));
    ```
  - Verifier que les deux logs apparaît dans le terminal
- Ajouter une methode de class ``StudentService.delete([id or number])`` qui permet de supprimer les infomations d'un étudiant (``id,name,number``) du ``localStorage``
  - Tester la methode en ajoutant ce snipet dans ``server.mjs``:
    ```
    StudentService.add(
      {
        id: 2,
        name: "Ndofène DIOUF",
        number: "2A-B2"
      }
    );
    StudentService.add(
      {
        id: 3,
        name: "Lat DIOP",
        number: "3A-B3"
      }
    );
    StudentService.delete(2);
    console.log("Delete/get student: " + StudentService.get(2));
    StudentService.delete("3A-B3");
    console.log("Delete/get student: " + StudentService.get("3A-B3"));
    ```
  - Verifier que les deux logs ``undefined`` apparaît dans le terminal
  ### 1 - Créer le service de gestion des cours
- Créer le fichier ``course-service.mjs`` dans le dossier ``services`` et ajouter la class ``CourseService``
- Ajouter une methode de class ``CourseService.add(course)`` qui permet stocker les infomations d'un cours (``id,name,code, credits``) dans le ``localStorage``
- Ajouter une methode de class ``CourseService.get([id or code])`` qui permet de lire les infomations d'un cours (``id,name,code,credits``) dans le ``localStorage``
  - Tester la methode en important la class ``CourseService`` dans `server.mjs` et ajouter ce snipet après les imports:
    ```
    CourseService.add(
      {
        id: 1,
        name: "Math",
        code: "UE1"
      }
    );
    console.log("Add/get course: " + CourseService.get(1));
    console.log("Add/get course: " + CourseService.get("UE1"));
    ```
  - Verifier que les deux logs apparaît dans le terminal
- Ajouter une methode de class ``CourseService.update(course)`` qui permet de mettre à jour les infomations d'un cours (``id,name,code,credits``) dans le ``localStorage``
  - Tester la methode en ajoutant ce snipet dans ``server.mjs``:
    ```
    CourseService.update(
      {
        id: 1,
        name: "Math",
        code: "UE1",
        credits: 7
      }
    );
    console.log("Update/get course: " + CourseService.get(1));
    console.log("Update/get course: " + CourseService.get("UE1"));
    ```
  - Verifier que les deux logs apparaît dans le terminal
- Ajouter une methode de class ``CourseService.delete([id or code])`` qui permet de supprimer les infomations d'un cours (``id,name,code,credits``) du ``localStorage``
  - Tester la methode en ajoutant ce snipet dans ``server.mjs``:
    ```
    CourseService.add(
      {
        id: 2,
        name: "Computer science",
        code: "UE2",
        credits: 11
      }
    );
    CourseService.add(
      {
        id: 3,
        name: "English",
        code: "UE3",
        credits: 5
      }
    );
    CourseService.delete(2);
    console.log("Delete/get course: " + CourseService.get(2));
    CourseService.delete("UE3");
    console.log("Delete/get course: " + CourseService.get("UE3"));
    ```
  - Verifier que les deux logs ``undefined`` apparaît dans le terminal

## III. Micro-service/API de gestion des cours

Ce projet a été complété et intègre désormais l'ensemble de la **Partie III** :

### 🚀 Fonctionnalités implémentées
- **Base de données SQLite** : Persistance intégrale dans `database.sqlite` (remplacement de `node-localstorage`).
- **16 Endpoints RESTful** :
  - **API Étudiants** (5 endpoints : `POST /students`, `GET /students`, `GET /students/:id`, `PUT /students/:id`, `DELETE /students/:id`)
  - **API Cours** (5 endpoints : `POST /courses`, `GET /courses`, `GET /courses/:id`, `PUT /courses/:id`, `DELETE /courses/:id`)
  - **API Inscriptions** (6 endpoints : `POST /subscriptions`, `GET /subscriptions/courses/:courseId`, `GET /subscriptions/courses/:courseId/students`, `GET /subscriptions/students/:studentId`, `GET /subscriptions/students/:studentId/courses`, `DELETE /subscriptions/:id`)
- **Validation avec Joi** & Middlewares `express.json()`, `express.urlencoded()`.
- **Gestion centralisée des erreurs** avec codes de statut HTTP appropriés (`400`, `404`, `500`).

### 📖 Documentation & Démarrage
1. **Lancement du serveur** :
   ```bash
   npm install
   npm start
   ```
2. **Documentation des API** : Consultez le fichier [`API.md`](API.md).
3. **Modèle de Rapport PDF** : Consultez le fichier [`RAPPORT_TEMPLATE.md`](RAPPORT_TEMPLATE.md).


