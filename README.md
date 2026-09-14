# Babutheni Port - Project Repository

Welcome to the **Babutheni Port** repository (`babutheniport-Dev`). This project is a web application featuring user authentication, portfolio/catalog management, dashboard interfaces, and email integration.

---

## 📂 Project Structure

```text
babutheniport-Dev/
├── db.js                 # Database configuration/connection or operations
├── db.json               # Local JSON database / data store
├── email.js              # Email notification and handling services
├── package.json          # Project metadata and dependencies
├── package-lock.json     # Locked dependency versions
├── server.js             # Main backend server entry point (Node.js/Express)
└── public/               # Frontend static assets and HTML pages
    ├── auth.html         # User authentication (Login / Signup)
    ├── builder.html      # Portfolio or item builder interface
    ├── catalog.html      # Product or portfolio catalog view
    ├── common.js         # Shared frontend utility functions
    ├── dashboard.html    # User/Admin dashboard view
    ├── index.html        # Landing page / home page
    ├── portfolio.html    # Portfolio presentation page
    ├── style.css         # Global stylesheet for styling UI components
    └── verify.html       # Account or token verification page
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v14+ recommended)
* **npm** (Node Package Manager)

### Installation

1. Clone or download the repository.
2. Navigate to the project directory:
   ```bash
   cd babutheniport-Dev
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the backend server:
```bash
node server.js
```
*(Alternatively, check `package.json` for custom scripts such as `npm start` or `npm run dev`).*

---

## 🛠️ Tech Stack & Features
* **Backend:** Node.js, Express (implied by `server.js`)
* **Database:** Local JSON-based storage (`db.json` with helper `db.js`)
* **Communication:** Nodemailer or similar email integration (`email.js`)
* **Frontend:** Vanilla HTML5, CSS3 (`style.css`), and JavaScript (`common.js`) with multi-page views (Dashboard, Builder, Catalog, Authentication).

---

## 📄 License
This project is proprietary and confidential.
