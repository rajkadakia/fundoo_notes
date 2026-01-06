# FundooNotes Backend

A simplified REST API for FundooNotes application.

## 🚀 Getting Started

### Prerequisites

1. **Node.js**: Ensure Node.js is installed.
2. **MongoDB**: Ensure MongoDB is running locally on default port `27017`.

### 🛠 Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure Environment:
   - Ensure `.env` file exists in the root directory with the following content:
     ```env
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/fundoo_notes
     JWT_SECRET=supersecretkeyfundoo
     ```

### ▶️ Running the Server

Start the development server:

```bash
npm start
```

The server will run at `http://localhost:3000`.
