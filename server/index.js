import 'dotenv/config'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { connectDatabase, getHistory, saveAdvisories, saveChatMessage, saveDiseaseScan, saveFarmDetails, saveFarmer, saveMarketSnapshot, saveRecommendation } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDirectory = path.join(__dirname, 'data')
const farmersFile = path.join(dataDirectory, 'farmers.json')
const port = Number(process.env.PORT || 3001)
const jwtSecret = process.env.JWT_SECRET
const diseaseModelUrl = process.env.DISEASE_MODEL_URL

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.')
}

const app = express()
const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })
app.use(helmet())
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false }))

const readFarmers = async () => {
  try {
    return JSON.parse(await fs.readFile(farmersFile, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    await fs.mkdir(dataDirectory, { recursive: true })
    await fs.writeFile(farmersFile, '[]')
    return []
  }
}

const publicProfile = (farmer) => ({
  id: farmer.id,
  name: farmer.name,
  mobile: farmer.mobile,
  email: farmer.email,
  district: farmer.district,
  village: farmer.village,
  preferredLanguage: farmer.preferredLanguage,
  farmSize: farmer.farmSize,
  mainCrops: farmer.mainCrops,
  farmDetails: farmer.farmDetails || null,
  createdAt: farmer.createdAt,
})

const issueSession = (res, farmerId) => {
  const token = jwt.sign({ sub: farmerId, role: 'farmer' }, jwtSecret, { expiresIn: '7d' })
  res.cookie('fieldwise_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.fieldwise_session
    if (!token) return res.status(401).json({ error: 'Authentication required.' })
    const payload = jwt.verify(token, jwtSecret)
    const farmers = await readFarmers()
    const farmer = farmers.find((item) => item.id === payload.sub)
    if (!farmer) return res.status(401).json({ error: 'Session is no longer valid.' })
    req.farmer = farmer
    return next()
  } catch {
    return res.status(401).json({ error: 'Authentication required.' })
  }
}

const cropProfiles = [
  { crop: 'Rice', variety: 'ADT 45', seasons: ['Kharif', 'Year-round'], ph: [5.5, 7.5], temperature: [20, 35], humidity: [60, 95], rainfall: [900, 2500], npk: [80, 35, 40], districts: ['Thanjavur', 'Trichy', 'Nagapattinam'], explanation: 'Strong match for warm, humid fields with dependable rainfall and balanced nitrogen.' },
  { crop: 'Groundnut', variety: 'TMV 7', seasons: ['Kharif', 'Rabi'], ph: [6, 7.5], temperature: [24, 32], humidity: [45, 75], rainfall: [500, 1000], npk: [35, 25, 45], districts: ['Thanjavur', 'Madurai', 'Villupuram'], explanation: 'A water-efficient choice for well-drained soil and moderate rainfall.' },
  { crop: 'Blackgram', variety: 'VBN 6', seasons: ['Rabi', 'Zaid'], ph: [6, 7.5], temperature: [25, 35], humidity: [40, 70], rainfall: [400, 800], npk: [25, 20, 25], districts: ['Thanjavur', 'Madurai', 'Trichy'], explanation: 'Fits a shorter season and helps rotate nitrogen-demanding crops.' },
  { crop: 'Maize', variety: 'COH(M) 8', seasons: ['Kharif', 'Rabi'], ph: [5.8, 7.2], temperature: [21, 32], humidity: [50, 80], rainfall: [500, 800], npk: [100, 45, 45], districts: ['Salem', 'Erode', 'Villupuram'], explanation: 'Good option when nitrogen is available and the field has reliable drainage.' },
  { crop: 'Cotton', variety: 'MCU 5', seasons: ['Kharif'], ph: [6, 8], temperature: [21, 35], humidity: [40, 70], rainfall: [500, 900], npk: [60, 30, 35], districts: ['Madurai', 'Salem', 'Villupuram'], explanation: 'Suitable for a warm Kharif cycle with moderate rainfall and neutral soil.' },
]

const diseaseAdvisories = {
  healthy: { name: 'Healthy leaf', symptoms: ['Even green colour', 'No spreading spots or curling'], prevention: ['Inspect both sides of leaves weekly', 'Keep tools and nursery material clean'], management: ['Continue balanced irrigation and nutrition', 'Remove badly damaged leaves from the field'], expertWhen: 'Consult an expert if spots, wilt, or rapid yellowing appears across multiple plants.' },
  bacterial_leaf_blight: { name: 'Bacterial leaf blight', symptoms: ['Water-soaked streaks along leaf edges', 'Yellowing that moves inward from the margin'], prevention: ['Use clean seed and avoid working in wet foliage', 'Maintain field drainage and balanced nitrogen'], management: ['Remove heavily affected leaves where practical', 'Use only locally approved, label-directed products after expert confirmation'], expertWhen: 'Contact a local agriculture officer when symptoms spread beyond one patch or reach the flag leaf.' },
  leaf_blast: { name: 'Leaf blast', symptoms: ['Spindle-shaped grey or brown lesions', 'Lesions may join and dry large areas of the leaf'], prevention: ['Use resistant varieties where recommended', 'Avoid excess nitrogen and keep spacing open'], management: ['Remove volunteer plants and crop residue where appropriate', 'Follow local integrated disease management guidance'], expertWhen: 'Seek expert advice before treatment if lesions appear near the neck or panicle.' },
}

const knowledgeBase = [
  { keywords: ['rice', 'water', 'irrigation'], answer: 'For rice, keep the field moist and avoid continuous deep flooding. After establishment, alternate wetting and drying can reduce water use where your local extension guidance supports it.', tamil: 'நெல்லுக்கு வயலை ஈரமாக வைத்துக் கொள்ளுங்கள்; தொடர்ந்து ஆழமாக நீர் தேங்க விட வேண்டாம். உள்ளூர் வேளாண் ஆலோசனை அனுமதித்தால், மாறி மாறி ஈரப்படுத்துதல் நீரை சேமிக்க உதவும்.', source: 'Tamil Nadu Agricultural University, Water management in rice' },
  { keywords: ['soil', 'ph'], answer: 'Most field crops perform well around mildly acidic to neutral soil. Test soil before applying lime or nutrients, and use the soil test recommendation rather than a generic dose.', tamil: 'பெரும்பாலான பயிர்கள் மிதமான அமிலம் முதல் நடுநிலை மண் வரை நன்றாக வளரும். சுண்ணாம்பு அல்லது உரம் இடுவதற்கு முன் மண் பரிசோதனை செய்யுங்கள்.', source: 'Soil Health Card Programme, Government of India' },
  { keywords: ['disease', 'leaf', 'spot', 'spray'], answer: 'Isolate the affected patch, avoid handling wet foliage, and take clear photos of both leaf surfaces. Confirm the disease with an agriculture expert before using any plant-protection product.', tamil: 'பாதிக்கப்பட்ட பகுதியை தனிமைப்படுத்தி, ஈரமான இலைகளை கையாளாமல் இருங்கள். எந்த தாவர பாதுகாப்பு பொருளையும் பயன்படுத்தும் முன் வேளாண் நிபுணரிடம் நோயை உறுதி செய்யுங்கள்.', source: 'TNAU Agritech Portal, Integrated Pest and Disease Management' },
  { keywords: ['rain', 'weather', 'fertilizer'], answer: 'Avoid foliar sprays and fertilizer application immediately before heavy rain. Check the local forecast and wait for a dry window when the product label permits.', tamil: 'கனமழைக்கு முன் இலைத் தெளிப்பு மற்றும் உரமிடுதலை தவிர்க்கவும். உள்ளூர் வானிலை முன்னறிவிப்பைப் பார்த்து, லேபிள் அனுமதிக்கும் உலர் நேரத்தைத் தேர்வு செய்யுங்கள்.', source: 'IMD Agromet Advisory Service' },
]

app.post('/api/auth/register', async (req, res) => {
  const { name, mobile, email, password, district, village, preferredLanguage, farmSize, mainCrops } = req.body
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedMobile = String(mobile || '').replace(/\s/g, '')
  const crops = Array.isArray(mainCrops) ? mainCrops.map((crop) => String(crop).trim()).filter(Boolean).slice(0, 8) : []

  if (!name || !/^\+?[0-9]{10,15}$/.test(normalizedMobile) || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || typeof password !== 'string' || password.length < 8 || !district || !village || !preferredLanguage || !farmSize || crops.length === 0) {
    return res.status(400).json({ error: 'Please complete every field with valid information.' })
  }

  const farmers = await readFarmers()
  if (farmers.some((farmer) => farmer.email === normalizedEmail || farmer.mobile === normalizedMobile)) {
    return res.status(409).json({ error: 'An account with that email or mobile number already exists.' })
  }

  const farmer = {
    id: randomUUID(),
    name: String(name).trim(),
    mobile: normalizedMobile,
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
    district: String(district).trim(),
    village: String(village).trim(),
    preferredLanguage,
    farmSize: String(farmSize).trim(),
    mainCrops: crops,
    farmDetails: null,
    createdAt: new Date().toISOString(),
  }
  farmers.push(farmer)
  await fs.mkdir(dataDirectory, { recursive: true })
  await fs.writeFile(farmersFile, JSON.stringify(farmers, null, 2))
  await saveFarmer(farmer)
  issueSession(res, farmer.id)
  return res.status(201).json({ farmer: publicProfile(farmer) })
})

app.post('/api/auth/login', async (req, res) => {
  const normalizedEmail = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  const farmers = await readFarmers()
  const farmer = farmers.find((item) => item.email === normalizedEmail)
  const validPassword = farmer ? await bcrypt.compare(password, farmer.passwordHash) : false
  if (!validPassword) return res.status(401).json({ error: 'Email or password is incorrect.' })
  issueSession(res, farmer.id)
  return res.json({ farmer: publicProfile(farmer) })
})

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('fieldwise_session', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  return res.status(204).end()
})

app.get('/api/auth/me', requireAuth, (req, res) => res.json({ farmer: publicProfile(req.farmer) }))

app.put('/api/farm-details', requireAuth, async (req, res) => {
  const { state, district, village, latitude, longitude, nitrogen, phosphorus, potassium, soilPh, soilType, organicCarbon, temperature, humidity, rainfall, season } = req.body
  const numericFields = [latitude, longitude, nitrogen, phosphorus, potassium, soilPh, organicCarbon, temperature, humidity, rainfall]
  if (!state || !district || !village || !soilType || !season || numericFields.some((value) => value !== '' && value !== null && value !== undefined && Number.isNaN(Number(value)))) {
    return res.status(400).json({ error: 'Please complete the required location, soil, and environmental fields.' })
  }

  const farmers = await readFarmers()
  const farmerIndex = farmers.findIndex((item) => item.id === req.farmer.id)
  if (farmerIndex < 0) return res.status(404).json({ error: 'Farmer profile not found.' })
  farmers[farmerIndex].farmDetails = { state: String(state).trim(), district: String(district).trim(), village: String(village).trim(), latitude: Number(latitude), longitude: Number(longitude), nitrogen: Number(nitrogen), phosphorus: Number(phosphorus), potassium: Number(potassium), soilPh: Number(soilPh), soilType: String(soilType).trim(), organicCarbon: organicCarbon === '' ? null : Number(organicCarbon), temperature: temperature === '' ? null : Number(temperature), humidity: humidity === '' ? null : Number(humidity), rainfall: rainfall === '' ? null : Number(rainfall), season: String(season).trim(), updatedAt: new Date().toISOString() }
  await fs.writeFile(farmersFile, JSON.stringify(farmers, null, 2))
  await saveFarmDetails(req.farmer.id, farmers[farmerIndex].farmDetails)
  return res.json({ farmDetails: farmers[farmerIndex].farmDetails })
})

app.get('/api/weather', async (req, res) => {
  const latitude = Number(req.query.latitude)
  const longitude = Number(req.query.longitude)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return res.status(400).json({ error: 'Valid latitude and longitude are required.' })
  try {
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum&forecast_days=5&timezone=auto`)
    if (!weatherResponse.ok) return res.status(502).json({ error: 'Weather service is unavailable.' })
    const weather = await weatherResponse.json()
    return res.json({ temperature: weather.current.temperature_2m, humidity: weather.current.relative_humidity_2m, rainfall: weather.current.precipitation, forecast: weather.daily, units: weather.current_units })
  } catch {
    return res.status(502).json({ error: 'Weather service is unavailable.' })
  }
})

app.post('/api/crop-recommendations', requireAuth, async (req, res) => {
  const { nitrogen, phosphorus, potassium, soilPh, temperature, humidity, rainfall, season, district } = req.body
  const values = [nitrogen, phosphorus, potassium, soilPh, temperature, humidity, rainfall].map(Number)
  if (values.some((value) => !Number.isFinite(value)) || !season || !district) return res.status(400).json({ error: 'Complete soil, weather, season, and location values first.' })
  const [n, p, k, ph, temp, humidityValue, rain] = values
  const scoreRange = (value, range) => Math.max(0, 1 - Math.abs(value - ((range[0] + range[1]) / 2)) / ((range[1] - range[0]) * 1.5))
  const recommendations = cropProfiles.map((profile) => {
    const nutrientScore = (scoreRange(n, [profile.npk[0] * .65, profile.npk[0] * 1.35]) + scoreRange(p, [profile.npk[1] * .65, profile.npk[1] * 1.35]) + scoreRange(k, [profile.npk[2] * .65, profile.npk[2] * 1.35])) / 3
    const score = (nutrientScore * .32) + (scoreRange(ph, profile.ph) * .18) + (scoreRange(temp, profile.temperature) * .16) + (scoreRange(humidityValue, profile.humidity) * .1) + (scoreRange(rain, profile.rainfall) * .14) + (profile.seasons.includes(season) ? .07 : .015) + (profile.districts.includes(String(district).trim()) ? .03 : .01)
    return { crop: profile.crop, variety: profile.variety, suitability: Math.min(98, Math.max(45, Math.round(score * 100))), explanation: profile.explanation, factors: { season: profile.seasons.includes(season), location: profile.districts.includes(String(district).trim()) } }
  }).sort((a, b) => b.suitability - a.suitability).slice(0, 5)
  const method = 'Weighted agronomic fit from submitted soil, weather, season, and district values.'
  await saveRecommendation(req.farmer.id, req.body, recommendations, method)
  return res.json({ recommendations, generatedAt: new Date().toISOString(), method })
})

app.post('/api/disease-detection', requireAuth, imageUpload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Upload a crop leaf image.' })
  if (!diseaseModelUrl) return res.status(503).json({ code: 'MODEL_NOT_CONFIGURED', error: 'The disease model is not connected yet. No diagnosis was made.' })
  try {
    const formData = new FormData()
    formData.append('image', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname)
    const modelResponse = await fetch(diseaseModelUrl, { method: 'POST', body: formData })
    if (!modelResponse.ok) return res.status(502).json({ error: 'The disease model could not process this image.' })
    const prediction = await modelResponse.json()
    const advisoryKey = prediction.healthy ? 'healthy' : String(prediction.disease || '').toLowerCase().replace(/\s+/g, '_')
    const advisory = diseaseAdvisories[advisoryKey] || diseaseAdvisories.healthy
    const scan = { healthy: Boolean(prediction.healthy), disease: advisory.name, confidence: Number(prediction.confidence || 0), advisory, model: prediction.model || 'Configured plant disease model' }
    await saveDiseaseScan(req.farmer.id, { ...scan, fileName: req.file.originalname })
    return res.json(scan)
  } catch {
    return res.status(502).json({ error: 'The disease model is unavailable. No diagnosis was made.' })
  }
})

app.get('/api/disease-advisories', requireAuth, async (req, res) => { await saveAdvisories(diseaseAdvisories); return res.json({ advisories: Object.values(diseaseAdvisories) }) })

app.get('/api/market', requireAuth, async (req, res) => { const snapshot = { source: 'Demo mandi feed · replace with Agmarknet integration', asOf: new Date().toISOString(), prices: [{ crop: 'Rice', market: 'Thanjavur', variety: 'Paddy common', price: 2180, unit: '₹ / quintal', change: 3.4 }, { crop: 'Groundnut', market: 'Thanjavur', variety: 'FAQ', price: 6120, unit: '₹ / quintal', change: 1.8 }, { crop: 'Blackgram', market: 'Trichy', variety: 'FAQ', price: 7850, unit: '₹ / quintal', change: -0.7 }] }; await saveMarketSnapshot(snapshot); return res.json(snapshot) })

app.post('/api/assistant', requireAuth, async (req, res) => {
  const question = String(req.body.question || '').trim()
  const language = req.body.language === 'TA' ? 'TA' : 'EN'
  if (question.length < 3) return res.status(400).json({ error: 'Ask a little more so I can help.' })
  const match = knowledgeBase.find((entry) => entry.keywords.some((keyword) => question.toLowerCase().includes(keyword))) || knowledgeBase[1]
  const answer = language === 'TA' ? match.tamil : match.answer
  await saveChatMessage(req.farmer.id, { question, answer, language, source: match.source, grounded: true })
  return res.json({ answer, source: match.source, grounded: true })
})

app.get('/api/history', requireAuth, async (req, res) => res.json(await getHistory(req.farmer.id)))

app.get('/api/health', (req, res) => res.json({ ok: true }))

connectDatabase().finally(() => app.listen(port, () => console.log(`Fieldwise API listening on http://localhost:${port}`)))
