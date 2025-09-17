# Netlify Setup för Magda Portfolio

## 🚀 Snabb setup

### 1. Skapa Netlify-projekt
1. Gå till [netlify.com](https://netlify.com)
2. Klicka "New site from Git"
3. Välj GitHub och repositoryn `oujii/magda-portfolio`
4. Build settings:
   - **Build command:** `echo 'Static site'`
   - **Publish directory:** `new`

### 2. Miljövariabler
I Netlify Dashboard → Site settings → Environment variables:

```
GITHUB_TOKEN = ditt-github-personal-access-token
```

**Skapa GitHub Token:**
1. GitHub.com → Settings → Developer settings → Personal access tokens
2. "Generate new token (classic)"
3. Scope: `repo` (full access)
4. Kopiera token till Netlify

### 3. Deploy
- Pusha koden → Netlify deplojar automatiskt
- Admin-panelen fungerar nu med riktig GitHub-integration!

## ✅ Vad som händer

**När Magda använder admin-panelen:**
1. Gör ändringar i admin-interface
2. Klickar "Spara & Publicera"
3. Netlify Function pushar till GitHub automatiskt
4. Netlify rebuildar sidan automatiskt
5. Ändringar syns på sidan inom 2-3 minuter

**Inga manuella steg behövs!**

## 🔧 Teknisk info

- **Netlify Functions:** Serverless backend för GitHub API
- **Auto-deploy:** GitHub → Netlify automatiskt
- **Admin-panel:** Fungerar precis som tidigare, men pushar nu riktigt
- **Säkerhet:** GitHub token är säkert i Netlify environment

## 📝 URL:er
- **Huvudsida:** `https://SITE-NAME.netlify.app`
- **Admin:** `https://SITE-NAME.netlify.app/admin`
- **Custom domain:** Kan sättas upp senare