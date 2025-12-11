# 🔍 Web Scraper Pro

Web Scraper Pro est un **scraper web moderne et sécurisé**, construit avec **Node.js, Express et Cheerio**, offrant une interface utilisateur responsive et une architecture propre basée sur le modèle MVC.

---

## ✨ Fonctionnalités principales

* 🎯 **Scraping complet** : titres, paragraphes, images, liens, métadonnées
* 🚀 **Performance optimisée** : système de cache (10 minutes)
* 🔐 **Sécurité avancée** : validation d’URL, anti-SSRF, rate limiting
* 📊 **Statistiques automatiques** : nombre d’éléments et nombre de mots
* 🎨 **Interface moderne** : animations, design en dégradé
* 📱 **Responsive** : compatible mobile, tablette, desktop
* 📝 **Logs avancés** : Winston pour la journalisation
* ⚡ **Architecture claire** : routes, contrôleurs, services, utils

---

## 📋 Prérequis

* Node.js **>= 16.0.0**
* npm **>= 8.0.0**

---

## 🚀 Installation

1. Cloner le projet :

```bash
git clone <votre-repo>
cd web-scraper-pro
```

2. Installer les dépendances :

```bash
npm install
```

3. Créer le fichier `.env` :

```bash
cp .env.example .env
```

4. Créer le dossier des logs :

```bash
mkdir logs
```

5. Lancer le serveur :

```bash
npm run dev   # Mode développement
npm start     # Mode production
```

6. Accéder à l’application :

```
http://localhost:3000
```

---

## 📁 Structure du projet

```
project/
├── server.js
├── routes/
│   └── scraper.js
├── controllers/
│   └── scraperController.js
├── services/
│   └── scrapingService.js
├── utils/
│   ├── validators.js
│   └── logger.js
├── public/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── logs/
├── package.json
└── README.md
```

---

## 🔧 Configuration (fichier `.env`)

```env
PORT=3000
NODE_ENV=development
SCRAPE_TIMEOUT=10000
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=20
CACHE_TTL=600
```

---

## 📡 API

### **POST /api/scrape**

Scrape une URL et retourne les données extraites.

**Body :**

```json
{
  "url": "https://example.com"
}
```

**Réponse :**

* Titre
* Métadonnées
* Headings
* Paragraphes
* Liens
* Images
* Statistiques
* Source cache ou non

### **GET /api/cache/stats**

Statistiques du cache.

### **DELETE /api/cache/clear**

Nettoyer le cache.

---

## 🛡️ Sécurité intégrée

* Validation stricte des URLs
* Protection contre les attaques SSRF
* Blocage des IP locales et privées
* Rate limiting (20 requêtes / 15 min)
* Timeout 10s
* Taille max de réponse : 10MB
* Échappement HTML (anti-XSS)

---

## 🔄 Limitations

* Ne supporte pas les sites nécessitant JavaScript
* Ne contourne pas les CAPTCHA
* Timeout 10 secondes
* 10MB maximum par réponse

---

## 🚀 Évolutions prévues

* [ ] Support de Puppeteer (JS rendering)
* [ ] Export CSV / PDF / JSON
* [ ] Scraping récursif (crawler)
* [ ] Authentification
* [ ] Sélecteurs CSS personnalisés
* [ ] Swagger documentation
* [ ] Docker

---

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche
3. Commitez votre contribution
4. Ouvrez une Pull Request

---

## 👨‍💻 Auteur

ElAyachi Nezar
GitHub : @NezarEa