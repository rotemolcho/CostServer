# Cost Manager RESTful Web Services

## Overview
A RESTful API built with **Express.js** and **Mongoose** that enables users to track expenses categorized by `food`, `health`, `housing`, `sport`, and `education`.

## Tools & Collaboration
- **Communication**: Discord
- **Issue Tracking**: Jira (or alternative)
- **Remote Collaboration**: Git
- **Documentation**: JSDoc (https://jsdoc.app/)

## Prerequisites
- Node.js v14+ and npm
- MongoDB Atlas account
- Git

## Installation
```bash
git clone <repository-url>
cd CostServer
npm install
```

## Environment Variables
Create a `.env` file in the project root (see `.env.example`):
```dotenv
# Port for the Express server
PORT=3000

# MongoDB connection URI (replace <user>, <pass>, <dbname>)
MONGO_URI="mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net/<dbname>?retryWrites=true&w=majority"
```

## Running the App
```bash
npm start
```  
The server listens on the port defined in `PORT` (default 3000).

## API Endpoints
### 1. Add Cost Item
```
POST /api/add
```
**Body parameters**:
- `userid` (number)
- `description` (string)
- `category` ("food"|"health"|"housing"|"sport"|"education")
- `sum` (number)
- `date` (ISO string, optional)

**Sample request**:
```bash
curl -X POST http://localhost:3000/api/add   -H "Content-Type: application/json"   -d '{"userid":123123,"description":"Coffee","category":"food","sum":3.5}'
```

### 2. Get Monthly Report
```
GET /api/report?userid=<id>&year=<year>&month=<month>
```
**Query parameters**:
- `userid` (number)
- `year` (number)
- `month` (1–12)

### 3. Get User Details
```
GET /api/users/:id
```
**URL parameter**: `id` (number)

### 4. Get Team Info
```
GET /api/about
```

## Testing
Unit tests are written with **Jest** and **supertest**.  
Run:
```bash
npm test
```

## Deployment
- Deploy to any Node.js hosting (e.g., Heroku, AWS, DigitalOcean)
- Ensure `MONGO_URI` is set in production environment

## Submission & PDF Cover Page
- **Video Demo**: record a ≤60s demo showing app, Discord, Jira usage; upload as unlisted YouTube
- **ZIP**: include source code (delete `node_modules`), tests, `.env.example`
- **PDF**: include all code files, with:
  1. Team manager: First + Last name
  2. Team members: First Last – ID – Phone – Email
  3. Clickable link to the demo video

---
*Generated according to project submission guidelines.*
