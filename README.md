# Proposal & Invitation to Bid Automation

This project models a core problem Bridgeline is solving in pre-construction: taking messy, real-world subcontractor proposals and turning them into structured, usable data. The application accepts proposal files, extracts key contact and scope information, and gives users a chance to review and correct that data before it is used to populate an Invitation to Bid workflow.
---

## How to Set Up and Run Locally

### Prerequisites
- Node.js v18 or newer
- npm
- MongoDB running locally or a MongoDB Atlas connection string

### Clone the Repository
```
git clone https://github.com/AdrianRRojo/dltechnicalexercise.git
cd dltechnicalexercise
```

### Server Setup
```
cd src/server
npm install
```

Create a `.env` file in `src/server`:
```
PORT=3001
MONGO_URI=mongodb://127.0.0.1:27017/bridgeline
```

Start the server:
```
npm start
```

The API will be available at http://localhost:3001  
Health check: GET /health

### Client Setup
```
cd ../..
npm install
```

Create a `.env` file at the project root:
```
REACT_APP_API_BASE_URL=http://localhost:3001
```

Start the client:
```
npm start
```

The application will be available at http://localhost:3000

## Application Flow

1. A user uploads a subcontractor proposal file.
2. The server extracts text and attempts to identify company, contact, email, phone, and scope information.
3. Extracted data is returned to the client without being persisted.
4. The user reviews and edits the extracted fields.
5. On confirmation, the proposal and associated company are saved to the database.
6. Confirmed companies appear in the Invitation to Bid interface.

## Architecture Choices

### Client
The client is built with React using Create React App and relies on local component state and hooks to manage a multi-step workflow. The UI is intentionally simple. All extraction logic is handled server-side to keep the client focused on presentation and validation rather than parsing complexity.

### Server
The server is built with Node.js and Express, using Multer for file uploads and MongoDB with Mongoose for persistence. The API is split into clear, purpose-driven endpoints:
- /api/proposals/extract handles extraction only and does not write to the database.
- /api/proposals/confirm persists user-confirmed data.
- /api/itb/contractors grab company and proposal data for the Invitation to Bid view.

### Data Model
Companies are stored once and deduplicated using a normalized company name. A company may have multiple proposals, and each proposal stores its own scope of work.

## Tradeoffs

Extraction is implemented using rule-based parsing rather than machine learning to keep behavior transparent, predictable, and easy to debug within the scope of the exercise. Files are re-sent during confirmation instead of being cached or stored temporarily, which avoids the complexity of draft persistence but requires the user session to remain active. Scope extraction is intentionally conservative to minimize false positives and prioritize correctness over completeness.

## What I Would Improve With More Time

With more time, I would introduce optional draft persistence to support multi-session reviews and improve scope extraction using structured table detection. Additional improvements would include support for multiple contacts per company, merge suggestions for similar companies, audit history to track how extracted values change during review, and background processing for large or multi-page proposals.

