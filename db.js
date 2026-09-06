// Persistent database.
// Every write here is saved to db.json on disk immediately, so data
// survives server restarts. This is a real, working database - not a
// mock or in-memory placeholder.

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

db.defaults({
  users: [],     // { id, name, email, passwordHash, verified, createdAt }
  otps: [],      // { email, otpHash, expiresAt, pendingName, pendingPasswordHash }
  profiles: [],  // { userId, firstName, lastName, title, location, bio, skills, projects, experience, education, contact }
  messages: []   // { id, toUserId, name, email, message, createdAt, read }
}).write();

module.exports = db;
