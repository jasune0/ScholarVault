# ScholarVault 

## Decsription
A full stack web application that helps students, researchers and librarians effciently discover, filter and organics scholary sources through CrossRef REST API.

---

## Target Browsers
ScholarVault is designed and tested for the following browsers on **desktop**:

| Browser | Supported|
|---------|----------|
| Google Chrome | Yes |
| Microsoft Edge | Yes |
| Safari | Yes |

---

## Features

- **Keyword Search** — search any topic, author, or paper title across 150M+ works
- **Smart Filters** — filter by type, year range, open access, and sort by relevance or citation count
- **Paper Detail Page** — view abstract, authors, journal, citation count, DOI, and publisher
- **Save Papers** — save papers to a personal library stored in Supabase
- **Personal Notes** — attach your own notes to any saved paper
- **Copy Citation** — copy a formatted citation to your clipboard instantly
- **Credibility Signals** — every result shows peer-review status and open access badge

# Developer Manual

## How to Install

## Prerequisites

Make sure to have the following installed:

 - [Node.js](https://nodejs.org/) v18 or higher
 - npm 
 - A [supabase](https://supabase.com) account with a project set up

## a.
### 1. Clone the Repo

```bash 
git clone https://github.com/jasune0/ScholarVault.git
cd ScholarVault
```

### 2. Install backend dependencies 
```bash
 cd backend 
 npm install
```

### 3. Install front end dependencies
```bash
cd ../frontend
npm install
```

### 4. Set up Supabase Database
Create table called 'saved_papers' with following columns:

| Column | Type |
|---|---|
| id | int8 (primary key, auto increment) |
| doi | text |
| title | text |
| authors | text |
| journal | text |
| year | int4 |
| citations | int4 |
| type | text |
| open_access | bool |
| notes | text |
| saved_at | timestamptz (default: now()) |


### 5. Setup Environment Variables 
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### 6. Run both frontend and backend 

``` bash
cd backend 
node server.js
```

In new terminal:

```bash
cd frontend 
node npm run dev
```


## d. API Documentation
All endpoints are prefixed with `/api`

