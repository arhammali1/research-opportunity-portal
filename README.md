# University Research Opportunity Portal

A full-stack web application that lets faculty members post, view, update, close,
and delete research opportunities — built for the **Computer Networks (CN)** Assignment #01.

**Student:** Arham Ali
**Roll Number:** 24P-0748
**Section:** BCS-5A
**University:** FAST-NUCES, Peshawar Campus

**GitHub Repository:** `<ADD_YOUR_REPO_LINK_HERE_BEFORE_SUBMISSION>`

---

## 1. Tech Stack

| Layer    | Technology                          |
|----------|--------------------------------------|
| Backend  | Python 3, Flask, Flask-CORS          |
| Database | MySQL 8                              |
| Frontend | HTML5, CSS3, Vanilla JavaScript      |
| API Testing | Postman (collection included)    |

No frameworks beyond plain Flask and vanilla JS were used, per assignment guidance
to keep the interface simple, clean, and functional.

---

## 2. Project Structure

```
research-opportunity-portal/
├── backend/
│   ├── app.py              # Flask app: all REST API routes
│   ├── db.py                # MySQL connection pool
│   ├── requirements.txt
│   ├── .env.example         # copy to .env and fill in your DB password
│   └── .env                 # (gitignored) actual local credentials
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── database/
│   └── schema.sql           # table schema + sample seed data
├── postman/
│   ├── Research-Opportunity-Portal.postman_collection.json
│   └── Research-Opportunity-Portal.postman_environment.json
└── README.md
```

---

## 3. Setup & Run Instructions

### 3.1 Prerequisites
- Python 3.10+
- MySQL Server 8.x running locally
- A modern web browser

### 3.2 Database Setup

1. Log in to MySQL as root (or any admin user):
   ```bash
   sudo mysql
   ```
2. Create a dedicated application user and database:
   ```sql
   CREATE DATABASE IF NOT EXISTS research_portal;
   CREATE USER IF NOT EXISTS 'research_app'@'localhost' IDENTIFIED BY 'your_chosen_password';
   GRANT ALL PRIVILEGES ON research_portal.* TO 'research_app'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```
3. Load the schema (creates the `opportunities` table and inserts 2 sample rows):
   ```bash
   mysql -u research_app -p research_portal < database/schema.sql
   ```

### 3.3 Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env and set DB_PASSWORD to the password you chose above

python app.py
```

The API will start at **http://localhost:5000**. Health check: `GET /api/health`.

### 3.4 Frontend Setup

The frontend is static HTML/CSS/JS — no build step required. With the backend
running, simply open `frontend/index.html` in a browser, or serve it locally:

```bash
cd frontend
python3 -m http.server 8080
```

Then visit **http://localhost:8080**.

> The frontend calls the API at `http://localhost:5000/api` (see `API_BASE` in
> `frontend/app.js`). Update that constant if your backend runs elsewhere.

---

## 4. REST API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint                  | Description                              | Success Code |
|--------|----------------------------|-------------------------------------------|--------------|
| POST   | `/opportunities`           | Create a new research opportunity         | 201 Created  |
| GET    | `/opportunities`           | Retrieve all research opportunities       | 200 OK       |
| GET    | `/opportunities/:id`       | Retrieve one opportunity by ID            | 200 OK       |
| PUT    | `/opportunities/:id`       | Update an opportunity (full or partial)   | 200 OK       |
| DELETE | `/opportunities/:id`       | Delete an opportunity                     | 200 OK       |

**Error codes used:** `400 Bad Request` (validation failure), `404 Not Found`
(missing opportunity), `500 Internal Server Error` (database/server fault).

### Research Opportunity object

```json
{
  "id": 1,
  "title": "Machine Learning for Crop Yield Prediction",
  "description": "Build ML models that predict crop yields using satellite imagery.",
  "research_area": "Machine Learning",
  "faculty_name": "Dr. Ayesha Khan",
  "department": "Computer Science",
  "required_skills": "Python, scikit-learn",
  "available_positions": 2,
  "application_deadline": "2026-12-15",
  "status": "Open",
  "created_at": "2026-10-11 12:00:00",
  "updated_at": "2026-10-11 12:00:00"
}
```

### Example: Create (POST /api/opportunities)

```json
{
  "title": "Network Security Vulnerability Analysis",
  "description": "Study common vulnerabilities in IoT network protocols.",
  "research_area": "Network Security",
  "faculty_name": "Dr. Bilal Ahmed",
  "department": "Computer Science",
  "required_skills": "Networking, Wireshark, Linux",
  "available_positions": 3,
  "application_deadline": "2026-11-30",
  "status": "Open"
}
```

### Example: Change status to Closed (PUT /api/opportunities/:id)

```json
{ "status": "Closed" }
```

---

## 5. Postman Testing

Import both files from the `postman/` folder into Postman:
- `Research-Opportunity-Portal.postman_collection.json`
- `Research-Opportunity-Portal.postman_environment.json`

Select the **Research Opportunity Portal - Local** environment, then run the
collection (Runner, top to bottom). It covers:

1. Creating 3 research opportunities
2. Retrieving all opportunities
3. Retrieving one opportunity by ID
4. Updating an opportunity
5. Changing status from Open → Closed
6. Deleting an opportunity
7. Re-requesting the deleted opportunity (expects `404`)
8. Submitting invalid/missing data (expects `400`)

---

## 6. Security Notes

- `.env` (containing the real DB password) is **gitignored** and never committed.
- `.env.example` is committed as a template only.
- No API keys, tokens, or credentials appear anywhere else in the repository.

---

## 7. Demo Video

See `docs/demo-video-script.md` for the one-minute demonstration script.
Video link: `<ADD_YOUR_VIDEO_LINK_HERE_BEFORE_SUBMISSION>`
