import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import puppeteer from 'puppeteer';
import moment from 'moment';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

console.log('1/4 — Exécution de la suite de tests Jest avec couverture...');
const testOutput = execSync('npm test', { cwd: root, encoding: 'utf-8' });
console.log(testOutput);

const suitesMatch = testOutput.match(/Test Suites:\s*([^\n]+)/);
const testsMatch = testOutput.match(/Tests:\s*([^\n]+)/);
const suitesLine = suitesMatch ? suitesMatch[1].trim() : 'N/A';
const testsLine = testsMatch ? testsMatch[1].trim() : 'N/A';

const summary = JSON.parse(fs.readFileSync(path.join(root, 'coverage', 'coverage-summary.json'), 'utf-8'));
const total = summary.total;

const fileRows = Object.entries(summary)
  .filter(([key]) => key !== 'total')
  .map(([file, data]) => {
    const relative = path.relative(root, file);
    return `<tr>
      <td>${relative}</td>
      <td>${data.statements.pct}%</td>
      <td>${data.branches.pct}%</td>
      <td>${data.functions.pct}%</td>
      <td>${data.lines.pct}%</td>
    </tr>`;
  })
  .join('\n');

console.log('2/4 — Capture du rapport de couverture HTML...');
const browser = await puppeteer.launch();
const coveragePage = await browser.newPage();
await coveragePage.setViewport({ width: 1280, height: 900 });
const coverageIndexPath = path.join(root, 'coverage', 'lcov-report', 'index.html');
await coveragePage.goto(`file://${coverageIndexPath}`, { waitUntil: 'networkidle0' });
const screenshotPath = path.join(root, 'scripts', 'coverage-summary.png');
await coveragePage.screenshot({ path: screenshotPath, fullPage: true });
await coveragePage.close();
const screenshotBase64 = fs.readFileSync(screenshotPath).toString('base64');

console.log('3/4 — Construction du document HTML du rapport...');

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #0f172a; line-height: 1.55; font-size: 13px; }
  h1 { font-size: 22px; margin-bottom: 0.2em; }
  h2 { font-size: 17px; margin-top: 1.8em; border-bottom: 2px solid #2563eb; padding-bottom: 0.3em; color: #1d4ed8; }
  h3 { font-size: 14px; margin-top: 1.2em; }
  .meta { color: #64748b; margin-bottom: 1.5em; }
  table { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 12px; }
  th, td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: left; }
  th { background: #f1f5f9; }
  code, .code-block { font-family: "SF Mono", Menlo, monospace; font-size: 11.5px; }
  .code-block { background: #0f172a; color: #e2e8f0; padding: 12px 16px; border-radius: 6px; white-space: pre-wrap; }
  .badge { display: inline-block; background: #dcfce7; color: #166534; padding: 3px 10px; border-radius: 12px; font-weight: 600; margin-right: 8px; }
  ul { margin: 0.4em 0; padding-left: 1.4em; }
  li { margin-bottom: 0.25em; }
  .screenshot { width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; margin: 1em 0; }
  .page-break { page-break-before: always; }
</style>
</head>
<body>

<h1>Compte rendu — Tests unitaires Jest & Interface Handlebars</h1>
<p class="meta">Maganga, Emilio &middot; ${moment().format('DD MMMM YYYY')} &middot; Projet emilio-express-courses</p>

<div class="badge">${suitesLine}</div>
<div class="badge">${testsLine}</div>

<h2>1. Description des tests unitaires implémentés</h2>
<p>La suite de tests couvre l'ensemble des couches applicatives : les services métier (accès aux données), les
schémas de validation Joi, le middleware d'erreur centralisé, les helpers Handlebars, ainsi que l'API REST et
l'interface web de bout en bout via Supertest. Chaque fichier de test utilise une base SQLite en mémoire
(<code>DB_FILE=':memory:'</code>), réinitialisée avant chaque cas de test, garantissant des tests isolés et
reproductibles sans dépendre ni modifier la base de données de développement.</p>

<table>
  <thead><tr><th>Fichier de test</th><th>Portée</th></tr></thead>
  <tbody>
    <tr><td>tests/student-service.test.mjs</td><td>CRUD complet du service étudiants</td></tr>
    <tr><td>tests/course-service.test.mjs</td><td>CRUD complet du service cours</td></tr>
    <tr><td>tests/subscription-service.test.mjs</td><td>Inscriptions, contraintes d'intégrité, jointures</td></tr>
    <tr><td>tests/error-and-validation.test.mjs</td><td>Schémas Joi et middleware d'erreur centralisé</td></tr>
    <tr><td>tests/helpers.test.mjs</td><td>Helpers Handlebars personnalisés</td></tr>
    <tr><td>tests/api.test.mjs</td><td>API REST JSON (Partie III) via Supertest</td></tr>
    <tr><td>tests/web.test.mjs</td><td>Interface Handlebars (Partie IV) via Supertest</td></tr>
  </tbody>
</table>

<h2>2. Couverture de code et résultats</h2>
<p>Résultat global obtenu avec <code>npm test</code> (Jest + <code>--coverage</code>) :</p>
<table>
  <thead><tr><th>Fichier</th><th>Statements</th><th>Branches</th><th>Functions</th><th>Lines</th></tr></thead>
  <tbody>
    <tr style="font-weight:700;background:#f8fafc;">
      <td>Total</td>
      <td>${total.statements.pct}%</td>
      <td>${total.branches.pct}%</td>
      <td>${total.functions.pct}%</td>
      <td>${total.lines.pct}%</td>
    </tr>
    ${fileRows}
  </tbody>
</table>

<h2>3. Captures d'écran du rapport de couverture</h2>
<p>Rapport HTML généré par Jest/Istanbul (<code>coverage/lcov-report/index.html</code>) :</p>
<img class="screenshot" src="data:image/png;base64,${screenshotBase64}" alt="Rapport de couverture Jest">

<div class="page-break"></div>

<h2>4. Résumé des cas de test pour chaque service</h2>

<h3>StudentService</h3>
<ul>
  <li>Création d'un étudiant et retour de son id auto-incrémenté</li>
  <li>Rejet d'un doublon de matricule (contrainte UNIQUE)</li>
  <li>Recherche par id numérique et par matricule</li>
  <li>Retour de <code>null</code> quand aucun étudiant ne correspond</li>
  <li>Mise à jour partielle et cas d'étudiant introuvable</li>
  <li>Suppression par id ou par matricule, avec retour booléen</li>
  <li>Récupération de la liste complète</li>
</ul>

<h3>CourseService</h3>
<ul>
  <li>Création avec crédits par défaut (0) et avec crédits explicites</li>
  <li>Rejet d'un doublon de code de cours</li>
  <li>Recherche par id ou par code</li>
  <li>Mise à jour des crédits et cas de cours introuvable</li>
  <li>Suppression et récupération de la liste complète</li>
</ul>

<h3>SubscriptionService</h3>
<ul>
  <li>Inscription valide (étudiant + cours existants)</li>
  <li>Rejet si l'étudiant ou le cours référencé n'existe pas</li>
  <li>Rejet d'une double inscription au même cours (contrainte UNIQUE composite)</li>
  <li>Récupération croisée : inscriptions par étudiant, par cours</li>
  <li>Récupération croisée : étudiants d'un cours, cours d'un étudiant (jointures SQL)</li>
  <li>Suppression d'une inscription et cas d'inscription introuvable</li>
  <li>Liste complète avec étudiant et cours joints (<code>getAll()</code>)</li>
</ul>

<h3>Validation (Joi) & gestion d'erreurs</h3>
<ul>
  <li>Acceptation des payloads valides pour étudiants, cours, inscriptions (création et mise à jour partielle)</li>
  <li>Rejet des champs obligatoires manquants et des types invalides</li>
  <li>Middleware d'erreur centralisé : statut par défaut 500, respect du statut porté par l'erreur</li>
</ul>

<h3>API REST (Partie III) & interface web (Partie IV)</h3>
<ul>
  <li>Cycle CRUD complet testé via HTTP réel (Supertest) pour étudiants, cours et inscriptions</li>
  <li>Codes de statut vérifiés : 200, 201, 302 (redirections web), 400, 404</li>
  <li>Rendu HTML des pages principales, formulaires, recherche, pagination des étudiants</li>
  <li>Réaffichage des formulaires avec messages d'erreur en cas de validation échouée</li>
</ul>

<h2>5. Configuration de Handlebars</h2>
<p>Le moteur de vues est configuré dans <code>server.mjs</code> via <code>express-handlebars</code>, avec un layout
par défaut et des helpers importés depuis un module dédié (testable indépendamment du serveur) :</p>
<div class="code-block">app.engine('handlebars', engine({
  defaultLayout: 'main',
  extname: '.handlebars',
  helpers: handlebarsHelpers // importé de ./helpers/handlebars-helpers.mjs
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));</div>

<h2>6. Création des templates pour étudiants, cours et inscriptions</h2>
<table>
  <thead><tr><th>Entité</th><th>Vues créées</th></tr></thead>
  <tbody>
    <tr><td>Étudiants</td><td>views/students/list.handlebars, detail.handlebars, form.handlebars</td></tr>
    <tr><td>Cours</td><td>views/courses/list.handlebars, detail.handlebars, form.handlebars</td></tr>
    <tr><td>Inscriptions</td><td>views/subscriptions/list.handlebars, form.handlebars</td></tr>
    <tr><td>Tableau de bord</td><td>views/home.handlebars</td></tr>
    <tr><td>Layout</td><td>views/layouts/main.handlebars</td></tr>
  </tbody>
</table>

<h2>7. Utilisation de helpers et partials Handlebars</h2>
<h3>Helpers personnalisés</h3>
<table>
  <thead><tr><th>Helper</th><th>Usage</th></tr></thead>
  <tbody>
    <tr><td><code>formatDate</code></td><td>Formate une date (Moment.js) — utilisé pour les dates d'inscription et le pied de page</td></tr>
    <tr><td><code>eq</code></td><td>Comparaison stricte, utilisée pour présélectionner une option de formulaire</td></tr>
    <tr><td><code>gt</code></td><td>Comparaison numérique &gt;, disponible pour la logique conditionnelle des vues</td></tr>
    <tr><td><code>sum</code></td><td>Addition de deux valeurs numériques</td></tr>
    <tr><td><code>json</code></td><td>Sérialisation JSON pour du débogage côté vue</td></tr>
    <tr><td><code>includes</code></td><td>Test d'appartenance à un tableau</td></tr>
    <tr><td><code>slice</code></td><td>Découpage de chaîne</td></tr>
  </tbody>
</table>

<h3>Partials réutilisables</h3>
<ul>
  <li><code>navbar</code> / <code>footer</code> — inclus dans le layout principal</li>
  <li><code>flash-messages</code> — bannières de succès/erreur alimentées par <code>connect-flash</code></li>
  <li><code>error-message</code> — liste d'erreurs de validation dans les formulaires</li>
  <li><code>student-card</code> / <code>course-card</code> — cartes réutilisées dans le tableau de bord et les fiches détail croisées</li>
  <li><code>form-input</code> / <code>form-select</code> — champs de formulaire génériques (étudiants, cours, inscriptions)</li>
</ul>

<div class="page-break"></div>

<h2>8. Améliorations possibles</h2>
<ul>
  <li><strong>Pagination en base de données</strong> : la pagination est actuellement réalisée en mémoire (<code>Array.slice</code>) après un <code>SELECT *</code> ; passer à des requêtes <code>LIMIT/OFFSET</code> serait plus performant sur un grand volume de données.</li>
  <li><strong>Couverture de code des routes web</strong> : la couverture des routes Handlebars (${summary['routes/web-routes.mjs'] ? summary['routes/web-routes.mjs'].statements.pct : 'N/A'}%) pourrait être étendue avec des cas d'erreur supplémentaires (ex : suppression d'une ressource déjà supprimée en simultané).</li>
  <li><strong>Tests end-to-end navigateur</strong> : ajouter des tests Puppeteer/Playwright pilotant un vrai navigateur pour valider le rendu visuel et les interactions JS (auto-masquage des messages flash, confirmations de suppression).</li>
  <li><strong>Authentification</strong> : l'interface d'administration n'est protégée par aucun mécanisme d'authentification ; ajouter une session utilisateur avant toute mise en production.</li>
  <li><strong>Internationalisation</strong> : externaliser les textes actuellement codés en dur en français pour permettre une éventuelle traduction.</li>
</ul>

<h2>Conclusion</h2>
<p>La mise en place d'une suite de tests Jest complète, combinée à l'interface Handlebars consommant les mêmes
services que l'API REST, a permis de valider le comportement de l'application à la fois au niveau unitaire et au
niveau des parcours utilisateur complets (HTTP réel via Supertest). L'isolation des tests via une base SQLite en
mémoire s'est révélée être l'un des choix techniques les plus importants du projet : elle garantit des résultats
déterministes sans jamais toucher aux données de développement.</p>

<p class="meta">Annexe — Lien du repository GitHub : https://github.com/tooluxarala/emilio-express-courses</p>

</body>
</html>
`;

const reportHtmlPath = path.join(root, 'scripts', '_report-render.html');
fs.writeFileSync(reportHtmlPath, html);

console.log('4/4 — Génération du PDF...');
const reportPage = await browser.newPage();
await reportPage.goto(`file://${reportHtmlPath}`, { waitUntil: 'networkidle0' });
const outputPdfPath = path.join(root, 'Maganga_Emilio_Jest_Test_handlebars_Report.pdf');
await reportPage.pdf({
  path: outputPdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '18mm', bottom: '18mm', left: '15mm', right: '15mm' }
});
await browser.close();

fs.unlinkSync(reportHtmlPath);
fs.unlinkSync(screenshotPath);

console.log(`\nRapport généré : ${path.relative(root, outputPdfPath)}`);
