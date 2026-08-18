# Documentation API REST - Express Course & Student Management

Cette API REST fournit des micro-services pour la gestion des étudiants, des cours et des inscriptions universitaires avec stockage dans une base de données **SQLite**.

---

## Sommaire

1. [API REST Étudiants (`/students`)](#1-api-rest-étudiants-students)
2. [API REST Cours (`/courses`)](#2-api-rest-cours-courses)
3. [API REST Inscriptions (`/subscriptions`)](#3-api-rest-inscriptions-subscriptions)
4. [Gestion des Erreurs & Validation](#4-gestion-des-erreurs--validation)

---

## 1. API REST Étudiants (`/students`)

### `POST /students`
Crée un nouvel étudiant dans le système.

* **Headers** : `Content-Type: application/json`
* **Corps attendu (Request Body)** :
  ```json
  {
    "name": "Pathé NDIAYE",
    "number": "1A-B1"
  }
  ```
* **Réponse (201 Created)** :
  ```json
  {
    "id": 1,
    "name": "Pathé NDIAYE",
    "number": "1A-B1"
  }
  ```
* **Exemple cURL** :
  ```bash
  curl -X POST http://localhost:3000/students \
    -H "Content-Type: application/json" \
    -d '{"name": "Pathé NDIAYE", "number": "1A-B1"}'
  ```

---

### `GET /students`
Récupère la liste de tous les étudiants.

* **Réponse (200 OK)** :
  ```json
  [
    {
      "id": 1,
      "name": "Pathé NDIAYE",
      "number": "1A-B1"
    }
  ]
  ```
* **Exemple cURL** :
  ```bash
  curl -X GET http://localhost:3000/students
  ```

---

### `GET /students/:id`
Récupère un étudiant par son **ID** numérique ou son **matricule / number**.

* **Paramètres d'URL** : `:id` (ex: `1` ou `1A-B1`)
* **Réponse (200 OK)** :
  ```json
  {
    "id": 1,
    "name": "Pathé NDIAYE",
    "number": "1A-B1"
  }
  ```
* **Réponse (404 Not Found)** :
  ```json
  {
    "status": 404,
    "error": "Étudiant non trouvé."
  }
  ```
* **Exemple cURL** :
  ```bash
  curl -X GET http://localhost:3000/students/1
  ```

---

### `PUT /students/:id`
Met à jour les informations d'un étudiant existant.

* **Paramètres d'URL** : `:id` (ex: `1`)
* **Corps attendu (Request Body)** :
  ```json
  {
    "name": "Ngoné DIENG",
    "number": "1A-B1"
  }
  ```
* **Réponse (200 OK)** :
  ```json
  {
    "id": 1,
    "name": "Ngoné DIENG",
    "number": "1A-B1"
  }
  ```
* **Exemple cURL** :
  ```bash
  curl -X PUT http://localhost:3000/students/1 \
    -H "Content-Type: application/json" \
    -d '{"name": "Ngoné DIENG"}'
  ```

---

### `DELETE /students/:id`
Supprime un étudiant du système.

* **Paramètres d'URL** : `:id` (ex: `1` ou `1A-B1`)
* **Réponse (200 OK)** :
  ```json
  {
    "message": "Étudiant supprimé avec succès."
  }
  ```
* **Exemple cURL** :
  ```bash
  curl -X DELETE http://localhost:3000/students/1
  ```

---

## 2. API REST Cours (`/courses`)

### `POST /courses`
Ajoute un nouveau cours.

* **Headers** : `Content-Type: application/json`
* **Corps attendu (Request Body)** :
  ```json
  {
    "name": "NodeJS & Express",
    "code": "UE-NODE",
    "credits": 6
  }
  ```
* **Réponse (201 Created)** :
  ```json
  {
    "id": 1,
    "name": "NodeJS & Express",
    "code": "UE-NODE",
    "credits": 6
  }
  ```
* **Exemple cURL** :
  ```bash
  curl -X POST http://localhost:3000/courses \
    -H "Content-Type: application/json" \
    -d '{"name": "NodeJS & Express", "code": "UE-NODE", "credits": 6}'
  ```

---

### `GET /courses`
Récupère la liste de tous les cours disponibles.

* **Réponse (200 OK)** :
  ```json
  [
    {
      "id": 1,
      "name": "NodeJS & Express",
      "code": "UE-NODE",
      "credits": 6
    }
  ]
  ```
* **Exemple cURL** :
  ```bash
  curl -X GET http://localhost:3000/courses
  ```

---

### `GET /courses/:id`
Récupère un cours par son **ID** ou son **code**.

* **Paramètres d'URL** : `:id` (ex: `1` ou `UE-NODE`)
* **Réponse (200 OK)** :
  ```json
  {
    "id": 1,
    "name": "NodeJS & Express",
    "code": "UE-NODE",
    "credits": 6
  }
  ```
* **Exemple cURL** :
  ```bash
  curl -X GET http://localhost:3000/courses/UE-NODE
  ```

---

### `PUT /courses/:id`
Met à jour un cours.

* **Paramètres d'URL** : `:id` (ex: `1`)
* **Corps attendu (Request Body)** :
  ```json
  {
    "name": "NodeJS & Express Avancé",
    "credits": 8
  }
  ```
* **Réponse (200 OK)** :
  ```json
  {
    "id": 1,
    "name": "NodeJS & Express Avancé",
    "code": "UE-NODE",
    "credits": 8
  }
  ```

---

### `DELETE /courses/:id`
Supprime un cours.

* **Paramètres d'URL** : `:id` (ex: `1` ou `UE-NODE`)
* **Réponse (200 OK)** :
  ```json
  {
    "message": "Cours supprimé avec succès."
  }
  ```

---

## 3. API REST Inscriptions (`/subscriptions`)

### `POST /subscriptions`
Inscrit un étudiant à un cours.

* **Corps attendu (Request Body)** :
  ```json
  {
    "student_id": 1,
    "course_id": 1
  }
  ```
* **Réponse (201 Created)** :
  ```json
  {
    "id": 1,
    "student_id": 1,
    "course_id": 1,
    "subscribed_at": "2026-08-18T16:01:39.629Z"
  }
  ```
* **Exemple cURL** :
  ```bash
  curl -X POST http://localhost:3000/subscriptions \
    -H "Content-Type: application/json" \
    -d '{"student_id": 1, "course_id": 1}'
  ```

---

### `GET /subscriptions/courses/:courseId`
Récupère les inscriptions pour un cours donné.

* **Réponse (200 OK)** :
  ```json
  [
    {
      "id": 1,
      "student_id": 1,
      "course_id": 1,
      "subscribed_at": "2026-08-18T16:01:39.629Z"
    }
  ]
  ```

---

### `GET /subscriptions/courses/:courseId/students`
Récupère la liste des étudiants inscrits à un cours donné.

* **Réponse (200 OK)** :
  ```json
  [
    {
      "id": 1,
      "name": "Pathé NDIAYE",
      "number": "1A-B1"
    }
  ]
  ```
* **Exemple cURL** :
  ```bash
  curl -X GET http://localhost:3000/subscriptions/courses/1/students
  ```

---

### `GET /subscriptions/students/:studentId`
Récupère la liste des inscriptions pour un étudiant donné.

* **Réponse (200 OK)** :
  ```json
  [
    {
      "id": 1,
      "student_id": 1,
      "course_id": 1,
      "subscribed_at": "2026-08-18T16:01:39.629Z"
    }
  ]
  ```

---

### `GET /subscriptions/students/:studentId/courses`
Récupère la liste des cours auxquels un étudiant est inscrit.

* **Réponse (200 OK)** :
  ```json
  [
    {
      "id": 1,
      "name": "NodeJS & Express",
      "code": "UE-NODE",
      "credits": 6
    }
  ]
  ```
* **Exemple cURL** :
  ```bash
  curl -X GET http://localhost:3000/subscriptions/students/1/courses
  ```

---

### `DELETE /subscriptions/:id`
Désinscrire un étudiant d'un cours en supprimant son inscription via son `:id`.

* **Réponse (200 OK)** :
  ```json
  {
    "message": "Inscription supprimée avec succès."
  }
  ```
* **Exemple cURL** :
  ```bash
  curl -X DELETE http://localhost:3000/subscriptions/1
  ```

---

## 4. Gestion des Erreurs & Validation

En cas de problème, l'API retourne un code de statut HTTP adapté accompagné d'un message structuré en JSON :

* **`400 Bad Request`** (Données d'entrée invalides ou contrainte d'unicité violée) :
  ```json
  {
    "status": 400,
    "error": "Validation Failed",
    "details": [
      "\"name\" length must be at least 2 characters long",
      "Le numéro/matricule de l'étudiant est obligatoire."
    ]
  }
  ```
* **`404 Not Found`** (Ressource non trouvée) :
  ```json
  {
    "status": 404,
    "error": "Étudiant non trouvé."
  }
  ```
* **`500 Internal Server Error`** (Erreur serveur non gérée) :
  ```json
  {
    "status": 500,
    "error": "Internal Server Error",
    "message": "Erreur système"
  }
  ```
