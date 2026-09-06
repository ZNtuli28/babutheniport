require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const PDFDocument = require('pdfkit');

const db = require('./db');
const { sendOtpEmail, sendContactNotification } = require('./email');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 days
}));

// ---------------- helpers ----------------

function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Please sign in first.' });
  next();
}

function publicUser(u) {
  if (!u) return null;
  return { id: u.id, name: u.name, email: u.email, verified: u.verified };
}

function getProfile(userId) {
  return db.get('profiles').find({ userId }).value();
}

// ---------------- auth ----------------

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const emailLower = email.trim().toLowerCase();
    if (db.get('users').find({ email: emailLower }).value()) {
      return res.status(400).json({ error: 'That email is already registered.' });
    }

    const otp = genOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const passwordHash = await bcrypt.hash(password, 10);

    db.get('otps').remove({ email: emailLower }).write();
    db.get('otps').push({
      email: emailLower,
      otpHash,
      expiresAt: Date.now() + 10 * 60 * 1000,
      pendingName: name.trim(),
      pendingPasswordHash: passwordHash
    }).write();

    await sendOtpEmail(emailLower, name.trim(), otp);
    res.json({ message: 'A verification code has been emailed to you.', email: emailLower });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not send the verification email. Check the email settings in .env.' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const emailLower = (email || '').trim().toLowerCase();
    const record = db.get('otps').find({ email: emailLower }).value();

    if (!record) return res.status(400).json({ error: 'No pending verification for this email.' });
    if (Date.now() > record.expiresAt) {
      db.get('otps').remove({ email: emailLower }).write();
      return res.status(400).json({ error: 'That code has expired. Please request a new one.' });
    }

    const match = await bcrypt.compare(otp, record.otpHash);
    if (!match) return res.status(400).json({ error: 'Incorrect verification code.' });

    const id = uuidv4();
    const user = {
      id,
      name: record.pendingName,
      email: emailLower,
      passwordHash: record.pendingPasswordHash,
      verified: true,
      createdAt: new Date().toISOString()
    };
    db.get('users').push(user).write();
    db.get('profiles').push({
      userId: id,
      firstName: record.pendingName.split(' ')[0] || record.pendingName,
      lastName: record.pendingName.split(' ').slice(1).join(' '),
      title: '',
      location: '',
      bio: '',
      skills: [],
      projects: [],
      experience: [],
      education: [],
      contact: { email: emailLower, phone: '', linkedin: '', github: '', website: '' }
    }).write();
    db.get('otps').remove({ email: emailLower }).write();

    req.session.userId = id;
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = (email || '').trim().toLowerCase();
    const record = db.get('otps').find({ email: emailLower }).value();
    if (!record) return res.status(400).json({ error: 'No pending verification for this email.' });

    const otp = genOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    db.get('otps').find({ email: emailLower })
      .assign({ otpHash, expiresAt: Date.now() + 10 * 60 * 1000 })
      .write();

    await sendOtpEmail(emailLower, record.pendingName, otp);
    res.json({ message: 'A new code has been sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not resend the code.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const emailLower = (email || '').trim().toLowerCase();
  const user = db.get('users').find({ email: emailLower }).value();
  if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ error: 'Invalid email or password.' });

  req.session.userId = user.id;
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Signed out.' }));
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const user = db.get('users').find({ id: req.session.userId }).value();
  res.json({ user: publicUser(user) });
});

// ---------------- portfolios (public) ----------------

app.get('/api/portfolios', (req, res) => {
  const { q } = req.query;
  const users = db.get('users').value();
  const profiles = db.get('profiles').value();

  let list = profiles.map(p => {
    const u = users.find(u => u.id === p.userId);
    if (!u) return null;
    return { id: u.id, name: u.name, title: p.title, location: p.location, skills: p.skills };
  }).filter(Boolean);

  if (q) {
    const query = q.toLowerCase();
    list = list.filter(p =>
      (p.name + ' ' + p.title + ' ' + p.location + ' ' + (p.skills || []).join(' ')).toLowerCase().includes(query)
    );
  }
  res.json({ portfolios: list });
});

app.get('/api/portfolios/:id', (req, res) => {
  const user = db.get('users').find({ id: req.params.id }).value();
  const profile = getProfile(req.params.id);
  if (!user || !profile) return res.status(404).json({ error: 'Portfolio not found.' });
  res.json({ user: { id: user.id, name: user.name }, profile });
});

app.post('/api/portfolios/:id/messages', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'All fields are required.' });

  const user = db.get('users').find({ id: req.params.id }).value();
  if (!user) return res.status(404).json({ error: 'Portfolio not found.' });

  db.get('messages').push({
    id: Date.now(),
    toUserId: req.params.id,
    name, email, message,
    createdAt: new Date().toISOString(),
    read: false
  }).write();

  try {
    await sendContactNotification(user.email, user.name, name, email, message);
  } catch (err) {
    console.error('Could not send contact notification email:', err);
  }

  res.json({ message: 'Message sent.' });
});

// CV / PDF export
app.get('/api/portfolios/:id/cv', (req, res) => {
  const user = db.get('users').find({ id: req.params.id }).value();
  const profile = getProfile(req.params.id);
  if (!user || !profile) return res.status(404).json({ error: 'Portfolio not found.' });

  const doc = new PDFDocument({ size: 'A4', margins: { top: 0, bottom: 50, left: 0, right: 0 } });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${user.name.replace(/\s+/g, '_')}_CV.pdf"`);
  doc.pipe(res);

  const PAGE_W = 595.28;
  const MARGIN = 50;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const ACCENT = '#e11d48';
  const DARK = '#18181b';
  const GRAY = '#71717a';
  const LIGHT_GRAY = '#e4e4e7';

  doc.rect(0, 0, PAGE_W, 130).fill('#0f0f11');
  doc.rect(0, 126, PAGE_W, 4).fill(ACCENT);

  doc.fillColor('#fafafa').font('Helvetica-Bold').fontSize(26).text(user.name, MARGIN, 40);
  doc.fillColor('#fb7185').font('Helvetica').fontSize(13).text(profile.title || 'Professional', MARGIN, 74);

  const ct = profile.contact || {};
  const contactBits = [profile.location, ct.email, ct.phone].filter(Boolean).join('    ');
  doc.fillColor('#a1a1aa').fontSize(9).text(contactBits, MARGIN, 98);
  const linkBits = [ct.linkedin, ct.github, ct.website].filter(Boolean).join('    ');
  if (linkBits) doc.fillColor('#a1a1aa').fontSize(9).text(linkBits, MARGIN, 112);

  let y = 155;

  function sectionTitle(text) {
    doc.fillColor(ACCENT).font('Helvetica-Bold').fontSize(11).text(text.toUpperCase(), MARGIN, y, { characterSpacing: 1.2 });
    y += 16;
    doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor(LIGHT_GRAY).lineWidth(1).stroke();
    y += 12;
  }

  function checkPageBreak(neededSpace) {
    if (y + neededSpace > 780) { doc.addPage(); y = 50; }
  }

  if (profile.bio) {
    sectionTitle('About');
    doc.fillColor(DARK).font('Helvetica').fontSize(10).text(profile.bio, MARGIN, y, { width: CONTENT_W, lineGap: 3 });
    y = doc.y + 18;
  }

  if ((profile.skills || []).length) {
    sectionTitle('Skills');
    let sx = MARGIN, sy = y;
    const padX = 8, gap = 6, rowH = 20;
    doc.font('Helvetica').fontSize(9);
    profile.skills.forEach(skill => {
      const w = doc.widthOfString(skill) + padX * 2;
      if (sx + w > PAGE_W - MARGIN) { sx = MARGIN; sy += rowH + gap; }
      doc.roundedRect(sx, sy, w, rowH, 4).fillAndStroke('#fdf2f4', '#fbcfe0');
      doc.fillColor(ACCENT).text(skill, sx + padX, sy + 5.5);
      sx += w + gap;
    });
    y = sy + rowH + 18;
  }

  function entryBlock(titleText, subText, descText) {
    checkPageBreak(60);
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(11).text(titleText, MARGIN, y);
    y = doc.y + 2;
    doc.fillColor(GRAY).font('Helvetica').fontSize(9).text(subText, MARGIN, y);
    y = doc.y + 4;
    if (descText) {
      doc.fillColor(DARK).font('Helvetica').fontSize(9.5).text(descText, MARGIN, y, { width: CONTENT_W, lineGap: 2 });
      y = doc.y;
    }
    y += 14;
  }

  if ((profile.experience || []).length) {
    sectionTitle('Experience');
    profile.experience.forEach(e => entryBlock(e.role || '', `${e.company || ''}   •   ${e.start || ''} – ${e.end || ''}`, e.description));
    y += 4;
  }

  if ((profile.education || []).length) {
    sectionTitle('Education & Certifications');
    profile.education.forEach(ed => entryBlock(ed.degree || '', `${ed.institution || ''}   •   ${ed.year || ''}`, ed.description));
    y += 4;
  }

  if ((profile.projects || []).length) {
    sectionTitle('Projects');
    profile.projects.forEach(p => entryBlock(p.name || '', p.tech || '', p.description));
  }

  doc.end();
});

// ---------------- profile (auth required) ----------------

app.get('/api/profile/me', requireAuth, (req, res) => {
  res.json({ profile: getProfile(req.session.userId) });
});

app.put('/api/profile', requireAuth, (req, res) => {
  const { firstName, lastName, title, location, bio, skills } = req.body;
  db.get('profiles').find({ userId: req.session.userId }).assign({
    firstName, lastName, title, location, bio,
    skills: Array.isArray(skills)
      ? skills
      : String(skills || '').split(',').map(s => s.trim()).filter(Boolean)
  }).write();
  res.json({ profile: getProfile(req.session.userId) });
});

app.put('/api/profile/contact', requireAuth, (req, res) => {
  const { email, phone, linkedin, github, website } = req.body;
  db.get('profiles').find({ userId: req.session.userId })
    .assign({ contact: { email, phone, linkedin, github, website } })
    .write();
  res.json({ profile: getProfile(req.session.userId) });
});

app.get('/api/messages', requireAuth, (req, res) => {
  const msgs = db.get('messages').filter({ toUserId: req.session.userId }).value();
  res.json({ messages: msgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

// Projects
app.post('/api/projects', requireAuth, (req, res) => {
  const { name, description, tech, link } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required.' });
  const profile = db.get('profiles').find({ userId: req.session.userId });
  const project = { id: Date.now(), name, description, tech, link };
  profile.get('projects').push(project).write();
  res.json({ project });
});

app.delete('/api/projects/:pid', requireAuth, (req, res) => {
  const profile = db.get('profiles').find({ userId: req.session.userId });
  profile.assign({
    projects: profile.get('projects').value().filter(p => p.id !== Number(req.params.pid))
  }).write();
  res.json({ message: 'Removed.' });
});

// Experience
app.post('/api/experience', requireAuth, (req, res) => {
  const { role, company, start, end, description } = req.body;
  if (!role || !company) return res.status(400).json({ error: 'Role and company are required.' });
  const profile = db.get('profiles').find({ userId: req.session.userId });
  const exp = { id: Date.now(), role, company, start, end, description };
  profile.get('experience').push(exp).write();
  res.json({ experience: exp });
});

app.delete('/api/experience/:eid', requireAuth, (req, res) => {
  const profile = db.get('profiles').find({ userId: req.session.userId });
  profile.assign({
    experience: profile.get('experience').value().filter(e => e.id !== Number(req.params.eid))
  }).write();
  res.json({ message: 'Removed.' });
});

// Education
app.post('/api/education', requireAuth, (req, res) => {
  const { institution, degree, year, description } = req.body;
  if (!institution || !degree) return res.status(400).json({ error: 'Institution and degree are required.' });
  const profile = db.get('profiles').find({ userId: req.session.userId });
  const edu = { id: Date.now(), institution, degree, year, description };
  profile.get('education').push(edu).write();
  res.json({ education: edu });
});

app.delete('/api/education/:eid', requireAuth, (req, res) => {
  const profile = db.get('profiles').find({ userId: req.session.userId });
  profile.assign({
    education: profile.get('education').value().filter(e => e.id !== Number(req.params.eid))
  }).write();
  res.json({ message: 'Removed.' });
});

// Account deletion
app.delete('/api/account', requireAuth, (req, res) => {
  const userId = req.session.userId;
  db.get('users').remove({ id: userId }).write();
  db.get('profiles').remove({ userId }).write();
  db.get('messages').remove({ toUserId: userId }).write();
  req.session.destroy(() => {});
  res.json({ message: 'Account deleted.' });
});

app.listen(PORT, () => {
  console.log(`Babutheni is running at http://localhost:${PORT}`);
});
