import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const companies = [
  { id: 1, name: 'TechVision Corp', ticker: 'TVIS', sector: 'Software', region: 'North America', marketCap: 2.5, revenue: 450, ebitda: 135, ebitdaMargin: 30, leverage: 1.2, dealProbTarget: 78, dealProbBuyer: 23, recentEvents: ['CEO Change', 'Activist Entry'], lastPrice: 45.3, change: 2.3 },
  { id: 2, name: 'DataFlow Systems', ticker: 'DFLW', sector: 'Data Analytics', region: 'Europe', marketCap: 1.8, revenue: 320, ebitda: 96, ebitdaMargin: 30, leverage: 0.8, dealProbTarget: 65, dealProbBuyer: 45, recentEvents: ['Strong Earnings', 'Product Launch'], lastPrice: 32.15, change: -1.2 },
  { id: 3, name: 'CloudScale Inc', ticker: 'CLSC', sector: 'Cloud Infrastructure', region: 'North America', marketCap: 4.2, revenue: 780, ebitda: 156, ebitdaMargin: 20, leverage: 2.1, dealProbTarget: 42, dealProbBuyer: 67, recentEvents: ['Acquisition Announced', 'Debt Raised'], lastPrice: 78.9, change: 5.1 },
  { id: 4, name: 'SecureNet GmbH', ticker: 'SCNT', sector: 'Cybersecurity', region: 'Europe', marketCap: 0.9, revenue: 180, ebitda: 45, ebitdaMargin: 25, leverage: 0.5, dealProbTarget: 85, dealProbBuyer: 12, recentEvents: ['Credit Downgrade', 'CFO Departure'], lastPrice: 23.45, change: -3.8 },
  { id: 5, name: 'AIWare Solutions', ticker: 'AIWS', sector: 'AI/ML', region: 'North America', marketCap: 3.1, revenue: 520, ebitda: 130, ebitdaMargin: 25, leverage: 1.5, dealProbTarget: 55, dealProbBuyer: 58, recentEvents: ['Patent Filing', 'Revenue Beat'], lastPrice: 61.2, change: 4.2 },
  { id: 6, name: 'FinTech Innovations', ticker: 'FTIN', sector: 'FinTech', region: 'Asia', marketCap: 1.2, revenue: 240, ebitda: 60, ebitdaMargin: 25, leverage: 1.8, dealProbTarget: 71, dealProbBuyer: 28, recentEvents: ['Regulatory Approval', 'Management Change'], lastPrice: 28.75, change: 1.5 },
];

const events = [
  { id: 1, companyId: 4, company: 'SecureNet GmbH', type: 'Credit Downgrade', date: '2 days ago', impact: 'High', description: "Moody's downgraded from BBB+ to BBB due to declining margins" },
  { id: 2, companyId: 1, company: 'TechVision Corp', type: 'CEO Change', date: '5 days ago', impact: 'High', description: 'Former CFO appointed as CEO, strategic review announced' },
  { id: 3, companyId: 1, company: 'TechVision Corp', type: 'Activist Entry', date: '1 week ago', impact: 'High', description: 'Valor Capital acquired 8.5% stake, pushing for strategic alternatives' },
  { id: 4, companyId: 3, company: 'CloudScale Inc', type: 'Acquisition', date: '3 days ago', impact: 'Medium', description: 'Acquired EdgeCompute for $450M to expand edge computing capabilities' },
  { id: 5, companyId: 6, company: 'FinTech Innovations', type: 'Management Change', date: '1 week ago', impact: 'Medium', description: 'New COO hired from payments industry leader' },
  { id: 6, companyId: 5, company: 'AIWare Solutions', type: 'Patent Filing', date: '4 days ago', impact: 'Low', description: 'Filed 12 new AI-related patents in generative AI space' },
];

const dealWorkspaces = [
  { id: 1, buyer: 'CloudScale Inc', target: 'SecureNet GmbH', status: 'Active', fitScore: 87, synergies: 45, createdDate: 'Nov 28, 2024' },
  { id: 2, buyer: 'AIWare Solutions', target: 'DataFlow Systems', status: 'Active', fitScore: 72, synergies: 38, createdDate: 'Nov 25, 2024' },
];

// --- Phishing URL Analyzer ---

function analyzeUrl(rawUrl) {
  let fullUrl = rawUrl.trim();
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    fullUrl = 'http://' + fullUrl;
  }

  let parsed;
  try {
    parsed = new URL(fullUrl);
  } catch {
    return { error: 'Ungultige URL' };
  }

  const hostname = parsed.hostname.toLowerCase();
  const urlLower = fullUrl.toLowerCase();
  const indicators = [];
  let score = 0;

  const add = (name, desc, severity, points) => {
    indicators.push({ name, desc, severity });
    score += points;
  };

  // 1. HTTP statt HTTPS
  if (parsed.protocol === 'http:') {
    add('Kein HTTPS', 'Die Verbindung ist unverschlusselt (HTTP statt HTTPS).', 'medium', 15);
  }

  // 2. IP-Adresse als Host
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    add('IP-Adresse statt Domain', 'Phishing-Seiten verstecken sich oft hinter rohen IP-Adressen.', 'high', 30);
  }

  // 3. URL-Lange
  if (rawUrl.length > 75) {
    add('Sehr lange URL', `URL ist ${rawUrl.length} Zeichen lang (normal: unter 75).`, 'low', 10);
  }

  // 4. URL-Shortener
  const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'rb.gy', 'tiny.cc', 'cutt.ly'];
  if (shorteners.some(s => hostname === s || hostname.endsWith('.' + s))) {
    add('URL-Shortener erkannt', 'Verschleiert das echte Ziel der URL - klassische Phishing-Technik.', 'medium', 20);
  }

  // 5. Verdachtige TLDs
  const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click', '.download', '.stream', '.work', '.party', '.loan', '.win', '.monster', '.rest'];
  if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) {
    add('Verdachtige Domain-Endung', 'Diese TLD wird uberdurchschnittlich haufig fur Phishing missbraucht.', 'high', 25);
  }

  // 6. @ Symbol in URL
  if (rawUrl.includes('@')) {
    add('@ Symbol in URL', 'Alles vor dem @ wird ignoriert - verschleiert den echten Zielserver.', 'high', 30);
  }

  // 7. Viele Subdomains (Subdomain-Spoofing)
  const parts = hostname.split('.');
  if (parts.length > 4) {
    add('Viele Subdomains', `${parts.length - 2} Subdomains erkannt - z. B. "paypal.com.evil.com" ist nicht paypal.com.`, 'medium', 20);
  }

  // 8. Verdachtige Schlusselworter
  const keywords = ['login', 'signin', 'sign-in', 'verify', 'secure', 'account', 'update', 'confirm', 'banking', 'credential', 'password', 'recover', 'support', 'helpdesk', 'validate'];
  const found = keywords.filter(kw => urlLower.includes(kw));
  if (found.length > 0) {
    add('Sicherheitsrelevante Schlusselworter', `Enthalt: "${found.join('", "')}" - typisch fur Social-Engineering-Angriffe.`, 'medium', Math.min(found.length * 8, 25));
  }

  // 9. Bekannte Marken im Pfad (nicht in der Domain)
  const brands = ['paypal', 'amazon', 'apple', 'microsoft', 'google', 'facebook', 'netflix', 'dhl', 'fedex', 'sparkasse', 'volksbank', 'commerzbank'];
  const domainWithoutTLD = parts.slice(0, -1).join('.');
  const pathBrands = brands.filter(b => (parsed.pathname + parsed.search).toLowerCase().includes(b));
  const domainBrands = brands.filter(b => domainWithoutTLD.includes(b) && !hostname.endsWith(b + '.' + parts[parts.length - 1]));
  if (pathBrands.length > 0 || domainBrands.length > 0) {
    const allBrands = [...new Set([...pathBrands, ...domainBrands])];
    add('Markenname in URL eingebettet', `Enthalt "${allBrands.join('", "')}" - Marke wird imitiert.`, 'high', 25);
  }

  // 10. Viele Bindestriche in der Domain (Typosquatting)
  if ((hostname.match(/-/g) || []).length >= 2) {
    add('Viele Bindestriche in der Domain', 'Typisches Merkmal von Typosquatting (z. B. "pay-pal-secure.com").', 'low', 10);
  }

  // 11. Ungewohnlicher Port
  if (parsed.port && !['80', '443'].includes(parsed.port)) {
    add('Ungewohnlicher Port', `Port ${parsed.port} statt Standard (80/443) - unublich fur legitime Seiten.`, 'medium', 20);
  }

  // 12. Punycode / IDN-Homograph-Angriff
  if (hostname.includes('xn--')) {
    add('Internationalisierter Domainname (IDN)', 'Kann bekannte Domains durch ahnlich aussehende Unicode-Zeichen imitieren.', 'high', 25);
  }

  // 13. Doppeltes Slash im Pfad (Open Redirect)
  if (parsed.pathname.includes('//')) {
    add('Doppelter Slash im Pfad', 'Kann fur Open-Redirect-Angriffe verwendet werden.', 'low', 10);
  }

  score = Math.min(score, 100);

  let verdict, verdictLevel;
  if (score < 20) { verdict = 'Vermutlich sicher'; verdictLevel = 'safe'; }
  else if (score < 50) { verdict = 'Verdachtig'; verdictLevel = 'warning'; }
  else { verdict = 'Gefahrlich'; verdictLevel = 'danger'; }

  return { url: rawUrl, score, verdict, verdictLevel, indicators, domain: hostname, protocol: parsed.protocol, checkedAt: new Date().toISOString() };
}

app.post('/api/phishing-check', express.json(), (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string' || url.length > 2048) {
    return res.status(400).json({ error: 'Bitte eine gultige URL angeben (max. 2048 Zeichen).' });
  }
  const result = analyzeUrl(url);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

// ---

app.get('/api/companies', (_req, res) => {
  res.json(companies);
});

app.get('/api/events', (_req, res) => {
  res.json(events);
});

app.get('/api/workspaces', (_req, res) => {
  res.json(dealWorkspaces);
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ message: 'Not found' });
    return;
  }

  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('<h1>DealMind API</h1><p>Build the frontend with "npm run build" to serve the SPA.</p>');
    }
  });
});

app.listen(PORT, () => {
  console.log(`DealMind API server running on http://localhost:${PORT}`);
});
