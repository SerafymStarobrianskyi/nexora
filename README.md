
# [Nexora](https://nexora-eight-mu.vercel.app/)

Nexora is a workspace-based note app for writing, organizing, and connecting ideas. It combines folders, Markdown files, internal links, and a visual graph so a workspace can grow from simple notes into a connected knowledge map.

<img width="1899" height="909" alt="projects-page-with-graph" src="https://github.com/user-attachments/assets/72648122-1af9-4fe5-b344-a3941f51a9dd" />

## Live Demo

[Live Demo](https://nexora-eight-mu.vercel.app/)

## Features

- **Workspaces** for separating projects, topics, courses, or research areas.
- **Folder tree** for organizing files inside each workspace.
- **Markdown editor** with edit, preview, and split modes.
- **Internal links** between files using Markdown-style references.
- **Workspace graph** built with a force-directed layout to visualize folders, files, and links.
- **Readable graph labels** that stay visible without needing hover.
- **Protected routes** for authenticated app usage.

## Markdown Tips
````md
# Main title
## Section title

**Bold text**
*Italic text*

- Bullet item
- Another item

> Quote or callout

`inline code`

```
console.log("Code block");
```
````

## Tech Stack

- React
- TypeScript
- Vite
- Zustand
- React Router
- Lucide React
- React Kapsule / Force Graph
- Express
- PostgreSQL
- Node.js
- Express
- PostgreSQL

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Start the backend:

```bash
npm run server
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```txt
nexora/
├── backend/
│   ├── controllers/
│   ├── db/
│   │   ├── index.js
│   │   └── schema.sql
│   ├── middlewares/
│   ├── routes/
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── lib/
│       ├── pages/
│       └── store/
├── index.html
├── package.json
├── vite.config.ts
└── vercel.json
```

## Environment

Create a `.env` file in the project root and add the values required by the backend, such as database connection and auth secrets.
```env
DB_URL=postgresql://...
JWT_SECRET=your-random-secret
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
```
# Database Setup

The PostgreSQL schema is located at:
```txt
backend/db/schema.sql
```
To set up the database in Supabase:

1.Open your Supabase project.

2.Go to SQL Editor.

3.Paste the contents of backend/db/schema.sql.

4.Run the query.

5.Copy the PostgreSQL connection string.

6.Use that connection string as DB_URL in the backend environment variables.

## Status

This project is in active development. Core note, folder, workspace, Markdown, and graph features are being shaped into a smoother knowledge-work experience.
