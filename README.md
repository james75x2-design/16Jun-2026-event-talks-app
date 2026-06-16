# BigQuery Release Notes Viewer & Tweet Bot

## Overview
A lightweight **Flask** web application that:
- Fetches the public **BigQuery release‑notes** Atom feed (`https://docs.cloud.google.com/feeds/bigquery-release-notes.xml`).
- Displays the notes in a modern, dark‑mode UI with a **Refresh** button and a loading spinner.
- Allows the user to **select any note** and compose a tweet about it.
- Posts the tweet to **Twitter** using **tweepy** (credentials are read from environment variables).

The UI is built with vanilla HTML, CSS (glass‑morphism, micro‑animations) and plain JavaScript—no frameworks required.

---
## Features
| Feature | Description |
|---|---|
| **Fetch release notes** | `GET /api/notes` – pulls the Atom XML, parses it, and returns a JSON array. |
| **Refresh** | A button re‑calls the same endpoint; a spinner indicates loading. |
| **Select & tweet** | Click a note, pre‑filled tweet textarea appears; press **Tweet** to post. |
| **Docker‑ready** | The app can be containerised for Cloud Run or any container platform. |
| **Simple dev setup** | Only Flask, Requests, and Tweepy are required. |

---
## Quick start (local development)
```bash
# 1️⃣ Clone the repo
git clone https://github.com/james75x2-design/16Jun-2026-event-talks-app.git
cd 16Jun-2026-event-talks-app

# 2️⃣ Create a virtual environment and install deps
python -m venv .venv
source .venv/bin/activate   # on Windows: .\.venv\Scripts\activate
pip install -r requirements.txt

# 3️⃣ (Optional) Set Twitter credentials as env vars
#    Create a Twitter developer app and generate the four keys/tokens.
export TWITTER_API_KEY="..."
export TWITTER_API_SECRET="..."
export TWITTER_ACCESS_TOKEN="..."
export TWITTER_ACCESS_SECRET="..."
# Windows PowerShell example:
# $env:TWITTER_API_KEY = "..."

# 4️⃣ Run the development server
python app.py
```
Open your browser at **http://localhost:5000**.

---
## API reference
### `GET /api/notes`
Returns a JSON array of release‑note objects:
```json
[
  {
    "title": "BigQuery 2.0 released",
    "link": "https://cloud.google.com/bigquery/release-notes#2.0",
    "updated": "2026-06-15T08:00:00Z",
    "content": "New features …"
  },
  ...
]
```

### `POST /api/tweet`
Accepts JSON `{ "content": "Your tweet text" }`.
- **Success** – `{ "tweet_url": "https://twitter.com/<user>/status/<id>" }`
- **Error** – `{ "error": "description" }` (status 400 or 500)

---
## Environment variables (Twitter integration)
| Variable | Meaning |
|---|---|
| `TWITTER_API_KEY` | Consumer API key |
| `TWITTER_API_SECRET` | Consumer API secret |
| `TWITTER_ACCESS_TOKEN` | Access token |
| `TWITTER_ACCESS_SECRET` | Access token secret |

If any of these are missing, the **Tweet** endpoint will return a 500 error.

---
## Docker (optional)
A minimal Dockerfile is provided for quick deployment to Cloud Run or any container host.
```Dockerfile
# Use a lightweight Python base image
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8080
# Flask defaults to port 5000, but Cloud Run expects $PORT
ENV PORT=8080
CMD ["python", "app.py"]
```
Build & run:
```bash
docker build -t bigquery-notes .
docker run -p 8080:8080 bigquery-notes
```
Visit **http://localhost:8080**.

---
## Contributing
Feel free to open issues or pull requests. Typical contributions:
- UI polish or additional themes.
- Pagination / filtering of notes.
- Tests (e.g., using `pytest` and mocking the external XML feed).
- CI workflow (GitHub Actions) for linting and automated Docker builds.

---
## License
This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---
## Author
Created by **James Felipe** (GitHub: [james75x2-design](https://github.com/james75x2-design)).
