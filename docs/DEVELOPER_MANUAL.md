# Developer Manual

## How to Install

## Prerequisites

Make sure to have the following installed:

 - [Node.js](https://nodejs.org/) v18 or higher
 - npm 
 - A [supabase](https://supabase.com) account with a project set up

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


## API Documentation
All endpoints are prefixed with `/api`

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | Checks backend is running and Supabase is connected |
| `GET` | `/api/search?q=...` | Searches CrossRef API with optional filters and pagination |
| `GET` | `/api/paper/*` | Fetches full metadata for one paper by DOI |
| `GET` | `/api/saved` | Returns all saved papers from Supabase |
| `POST` | `/api/saved` | Saves a paper to Supabase |
| `DELETE` | `/api/saved/:doi` | Removes a saved paper from Supabase by DOI |
| `PUT` | `/api/saved/:doi/notes` | Updates the notes field for a saved paper |


## Known bugs and Road-map for Future Development
| Bug | Description | Fix |
|-----|-------------|-----|
| Abstract often missing | Many publishers don't share abstract data with CrossRef | Expected behavior — "Open Full Paper" link is the workaround |
| No user accounts | All papers save to one shared Supabase table, no user separation | Add Supabase Auth |

### Road-map for Future Development
 - Add Supabase Auth so each user has own library.