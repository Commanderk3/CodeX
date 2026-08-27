# CodeX ⚔️

**A 1v1 coding battle game.**

Challenge another developer head-to-head: same problem, same clock, whoever ships a correct, faster, or cleaner solution wins.


---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
  - [Running Tests](#running-tests)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Overview

CodeX is a real-time, 1-on-1 competitive coding platform. The core idea: two players are matched, given the same coding problem, and race to submit a correct solution first similar in spirit to competitive coding duels, but focused on head-to-head matches rather than large tournaments or leaderboards.

Since the project is still early-stage, exact gameplay mechanics (problem selection, scoring, time limits, supported languages) are still being defined and implemented. This README will be updated as those pieces land.

## Features

Planned / in-progress functionality includes:

- 🥊 **1v1 matchmaking** — pair up with another player for a live coding duel
- 🧩 **Shared problem set** — both players solve the same challenge simultaneously
- ⏱️ **Real-time competition** — live status of both players as they work
- ✅ **Automated judging** — submissions checked for correctness (and possibly performance)
- 🏆 **Win/loss tracking** — results recorded per match

*(This list reflects the project's stated goal and is subject to change as development progresses — see the repo's Issues/Projects tab for the most current scope.)*

## Tech Stack

Based on the repository layout, CodeX is a JavaScript/Node.js project split into separate `frontend` and `backend` services (a typical client/server web app structure), with `package-lock.json` indicating npm-managed dependencies and a `test.js` file for test coverage.

Specific frameworks and libraries (e.g., the exact backend framework, frontend framework, database, and real-time communication layer) aren't finalized/documented in the repo yet. Once dependencies are locked in, this section should be updated with:

- Frontend framework (e.g., React/Vue/plain JS)
- Backend framework (e.g., Express/Fastify/Nest)
- Real-time layer (e.g., WebSockets/Socket.IO)
- Database/storage solution
- Code execution/judging sandbox

## Project Structure

```
CodeX/
├── backend/            # Server-side application code
├── frontend/            # Client-side application code
├── test.js              # Test file(s)
├── package-lock.json     # Locked npm dependency tree
├── .gitignore
└── README.md
```

## Getting Started

Since the project is under active development, setup instructions may change. The general flow for a Node.js-based client/server app like this one typically looks like:

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- npm (comes bundled with Node.js)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Commanderk3/CodeX.git
   cd CodeX
   ```
2. Install dependencies for the backend:
   ```bash
   cd backend
   npm install
   ```
3. Install dependencies for the frontend:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the App

Typical commands (confirm against each folder's `package.json` `scripts` section, since these aren't finalized yet):

```bash
# From the backend/ directory
npm start

# From the frontend/ directory
npm start
```

### Running Tests

```bash
node test.js
```
*(Adjust once a formal test runner such as Jest or Mocha is introduced.)*

## Roadmap

- [ ] Finalize matchmaking flow
- [ ] Define supported languages for submissions
- [ ] Build the automated judge/execution sandbox
- [ ] Real-time match UI (live opponent progress)
- [ ] User accounts and match history
- [ ] Public beta release

## Contributing

The project doesn't yet have a formal `CONTRIBUTING.md`. Until one exists:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request describing what you changed and why

Given the early stage, it's a good idea to open an issue first to discuss significant changes before investing time in a PR.

## License

No license file is currently present in the repository. Until one is added, please check with the repository owner before reusing or redistributing this code.

## Author

**Diwangshu Kakoty** ([@Commanderk3](https://github.com/Commanderk3))
