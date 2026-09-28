import mongoose from 'mongoose'

const farmerSchema = new mongoose.Schema({
  legacyId: { type: String, unique: true, index: true },
  name: String,
  mobile: { type: String, index: true },
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  district: String,
  village: String,
  preferredLanguage: { type: String, enum: ['English', 'Tamil'], default: 'English' },
  farmSize: String,
  mainCrops: [String],
  farmDetails: mongoose.Schema.Types.Mixed,
}, { timestamps: true })

const recommendationSchema = new mongoose.Schema({
  farmerId: { type: String, index: true },
  inputs: mongoose.Schema.Types.Mixed,
  recommendations: mongoose.Schema.Types.Mixed,
  method: String,
}, { timestamps: true })

const diseaseScanSchema = new mongoose.Schema({
  farmerId: { type: String, index: true },
  fileName: String,
  healthy: Boolean,
  disease: String,
  confidence: Number,
  model: String,
  advisory: mongoose.Schema.Types.Mixed,
}, { timestamps: true })

const advisorySchema = new mongoose.Schema({
  key: { type: String, unique: true },
  name: String,
  symptoms: [String],
  prevention: [String],
  management: [String],
  expertWhen: String,
  source: String,
}, { timestamps: true })

const marketSchema = new mongoose.Schema({
  source: String,
  asOf: Date,
  prices: mongoose.Schema.Types.Mixed,
}, { timestamps: true })

const chatSchema = new mongoose.Schema({
  farmerId: { type: String, index: true },
  question: String,
  answer: String,
  language: { type: String, enum: ['EN', 'TA'] },
  source: String,
  grounded: Boolean,
}, { timestamps: true })

const models = {
  Farmer: mongoose.models.Farmer || mongoose.model('Farmer', farmerSchema),
  Recommendation: mongoose.models.Recommendation || mongoose.model('Recommendation', recommendationSchema),
  DiseaseScan: mongoose.models.DiseaseScan || mongoose.model('DiseaseScan', diseaseScanSchema),
  Advisory: mongoose.models.Advisory || mongoose.model('Advisory', advisorySchema),
  Market: mongoose.models.Market || mongoose.model('Market', marketSchema),
  Chat: mongoose.models.Chat || mongoose.model('Chat', chatSchema),
}

let connected = false

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not set; using the local development store.')
    return false
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    connected = true
    console.log('MongoDB connected')
    return true
  } catch (error) {
    console.error('MongoDB connection failed; using the local development store.', error.message)
    return false
  }
}

export function isMongoConnected() {
  return connected
}

export async function saveFarmer(farmer) {
  if (!connected) return
  await models.Farmer.findOneAndUpdate({ legacyId: farmer.id }, { ...farmer, legacyId: farmer.id }, { upsert: true, new: true, setDefaultsOnInsert: true })
}

export async function saveFarmDetails(farmerId, farmDetails) {
  if (!connected) return
  await models.Farmer.findOneAndUpdate({ legacyId: farmerId }, { farmDetails }, { upsert: true })
}

export async function saveRecommendation(farmerId, inputs, recommendations, method) {
  if (!connected) return
  await models.Recommendation.create({ farmerId, inputs, recommendations, method })
}

export async function saveDiseaseScan(farmerId, scan) {
  if (!connected) return
  await models.DiseaseScan.create({ farmerId, ...scan })
}

export async function saveAdvisories(advisories) {
  if (!connected) return
  await Promise.all(Object.entries(advisories).map(([key, advisory]) => models.Advisory.findOneAndUpdate({ key }, { key, ...advisory, source: 'TNAU / Government agricultural guidance' }, { upsert: true })))
}

export async function saveMarketSnapshot(snapshot) {
  if (!connected) return
  await models.Market.create(snapshot)
}

export async function saveChatMessage(farmerId, message) {
  if (!connected) return
  await models.Chat.create({ farmerId, ...message })
}

export async function getHistory(farmerId) {
  if (!connected) return { recommendations: [], diseaseScans: [], chats: [] }
  const [recommendations, diseaseScans, chats] = await Promise.all([
    models.Recommendation.find({ farmerId }).sort({ createdAt: -1 }).limit(10).lean(),
    models.DiseaseScan.find({ farmerId }).sort({ createdAt: -1 }).limit(10).lean(),
    models.Chat.find({ farmerId }).sort({ createdAt: -1 }).limit(10).lean(),
  ])
  return { recommendations, diseaseScans, chats }
}
