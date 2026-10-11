# One-Minute Demonstration Video — Shot Script

Target length: **~60 seconds**. Record your screen (OBS, or your OS's built-in
screen recorder) with both a terminal and the browser visible. Practice once
before the real take — timing is tight.

**Before recording:**
- Backend running: `cd backend && source venv/bin/activate && python app.py`
- Frontend open in browser: `frontend/index.html` (or `http://localhost:8080`)
- Postman open in a second window/tab with the imported collection

---

## Shot-by-shot (approx. timing)

**0:00–0:08 — Backend + frontend running**
- Show terminal with Flask server running (`* Running on http://127.0.0.1:5000`).
- Switch to browser showing the portal homepage with the opportunity list loaded.
- Say: *"This is the University Research Opportunity Portal — Flask REST API, MySQL database, vanilla JS frontend."*

**0:08–0:20 — Create an opportunity**
- Fill the form: Title, Description, Research Area, Faculty Name, Department,
  Required Skills, Available Positions, Deadline.
- Click **Create Opportunity**.
- Point out the success toast and the new card appearing in the list.

**0:20–0:28 — Retrieve / display opportunities**
- Click **View** on a card to open the detail modal — show all fields populated
  from the database (not hard-coded).
- Close the modal.

**0:28–0:38 — Update an opportunity**
- Click **Edit** on a card, change the "Available Positions" or "Required Skills".
- Click **Save Changes**, show the success toast and updated card.

**0:38–0:45 — Close an opportunity**
- Click **Close** on an Open card.
- Show the badge flip from **Open** (green) to **Closed** (red).

**0:45–0:50 — Delete an opportunity**
- Click **Delete**, confirm the browser prompt.
- Show the card disappearing from the list.

**0:50–0:58 — Postman: error handling**
- Switch to Postman.
- Run the "Get Deleted Opportunity" request → show **404 Not Found** response.
- Run the "Create Opportunity with Invalid Data" request → show **400 Bad Request**
  response with validation error details.

**0:58–1:00 — Close**
- Brief closing line: *"That covers create, read, update, close, delete, and error handling — thank you."*

---

## Checklist (must all appear on camera)

- [ ] Backend server running
- [ ] Frontend application running
- [ ] Create a research opportunity
- [ ] Retrieve and display stored opportunities
- [ ] Update an opportunity
- [ ] Close an opportunity (Open → Closed)
- [ ] Delete an opportunity
- [ ] At least one validation or 404 error shown
- [ ] API request/response visible in Postman

After recording, upload the video (YouTube "Unlisted", Google Drive with link
sharing, or similar) and paste the link into `README.md` and the final submission.
