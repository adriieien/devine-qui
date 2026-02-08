# 🚀 Comment Publier votre Jeu "Devine Qui - Historique"

Pour que le monde entier puisse jouer, nous allons déployer votre site sur **Render.com**. C'est une plateforme gratuite et facile à utiliser qui supporte à la fois notre Backend (Node.js) et notre Frontend (React) en un seul service.

## Prérequis
1. Un compte GitHub (gratuit).
2. Un compte Render.com (gratuit).

## Étape 1 : Préparer les fichiers (Fullstack)
Le serveur a été configuré pour servir le site web. Il faut juste s'assurer que Render installe tout et construise le frontend.

### Vérifier le script de build
Dans `package.json`, nous devons avoir un script qui installe tous les paquets et construit le frontend.
(Je vais vérifier cela pour vous, s'il manque je l'ajouterai).

## Étape 2 : Mettre le code sur GitHub
(Si ce n'est pas déjà fait, il faut initialiser un dépôt git et pousser le code).

```bash
git init
git add .
git commit -m "Version finale pour déploiement"
# Créez le dépôt sur GitHub.com puis :
git remote add origin <VOTRE_URL_GITHUB>
git push -u origin main
```

## Étape 3 : Déployer sur Render
1. Allez sur **Render Dashboard** > **New +** > **Web Service**.
2. Connectez votre compte GitHub et sélectionnez votre dépôt.
3. Remplissez les infos :
   - **Name**: `devine-qui-historique`
   - **Region**: Frankfurt (ou autre proche)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server.js`
4. **Environment Variables** (Très Important !)
   - Ajoutez une variable `GEMINI_API_KEY` avec votre clé API secrète.
5. Cliquez sur **Deploy Web Service**.

## Étape 4 : Jouer !
Render va mouliner quelques minutes, puis vous donnera une URL du type `https://devine-qui-historique.onrender.com`.

Votre jeu est en ligne ! 🌍
