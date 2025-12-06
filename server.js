import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

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
