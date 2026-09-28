import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  BarChart3,
  BookOpen,
  CalendarDays,
  Camera,
  ChevronDown,
  CloudRain,
  CloudSun,
  CheckCircle2,
  Droplets,
  Flower2,
  MapPin,
  Menu,
  MessageCircle,
  LocateFixed,
  Mic,
  Volume2,
  Square,
  Save,
  RefreshCw,
  ShieldAlert,
  Thermometer,
  Database,
  ClipboardList,
  Settings2,
  ShieldCheck,
  Search,
  Sprout,
  Sun,
  TrendingUp,
  Users,
  Upload,
  X,
  ExternalLink,
} from "lucide-react";
import "./App.css";

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("register");
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    district: "",
    village: "",
    preferredLanguage: "English",
    farmSize: "",
    mainCrops: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const payload =
      mode === "register"
        ? {
            ...form,
            mainCrops: form.mainCrops
              .split(",")
              .map((crop) => crop.trim())
              .filter(Boolean),
          }
        : { email: form.email, password: form.password };
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to continue.");
      onAuthenticated(result.farmer);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="auth-brand">
          <span className="brand-mark">
            <Sprout size={20} />
          </span>
          <span>
            Fieldwise<span className="brand-dot">.</span>
          </span>
        </div>
        <div className="auth-quote">
          <span>“</span>
          <h1>
            Better decisions
            <br />
            for every field.
          </h1>
          <p>Practical crop intelligence for the people who grow our food.</p>
        </div>
        <div className="auth-weather">
          <Sun size={18} />
          <span>29° in Thanjavur</span>
          <span className="auth-live">Live conditions</span>
        </div>
      </div>
      <main className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-heading">
            <p className="section-kicker">
              {mode === "register" ? "START YOUR FARM PROFILE" : "WELCOME BACK"}
            </p>
            <h2>
              {mode === "register"
                ? "Create your farmer profile"
                : "Sign in to Fieldwise"}
            </h2>
            <p>
              {mode === "register"
                ? "Your recommendations get smarter when they know your field."
                : "Continue where you left off with your farm decisions."}
            </p>
          </div>
          <div className="auth-tabs">
            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              Register
            </button>
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Login
            </button>
          </div>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}
          <form className="auth-form" onSubmit={submit}>
            {mode === "register" && (
              <>
                <div className="form-row">
                  <label>
                    Full name
                    <input
                      required
                      value={form.name}
                      onChange={updateField("name")}
                      placeholder="e.g. Rajesh Kumar"
                    />
                  </label>
                  <label>
                    Mobile number
                    <input
                      required
                      type="tel"
                      value={form.mobile}
                      onChange={updateField("mobile")}
                      placeholder="+91 98765 43210"
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Email address
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={updateField("email")}
                      placeholder="you@example.com"
                    />
                  </label>
                  <label>
                    Password
                    <input
                      required
                      minLength="8"
                      type="password"
                      value={form.password}
                      onChange={updateField("password")}
                      placeholder="At least 8 characters"
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    District
                    <input
                      required
                      value={form.district}
                      onChange={updateField("district")}
                      placeholder="e.g. Thanjavur"
                    />
                  </label>
                  <label>
                    Village
                    <input
                      required
                      value={form.village}
                      onChange={updateField("village")}
                      placeholder="e.g. Kumbakonam"
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Preferred language
                    <select
                      value={form.preferredLanguage}
                      onChange={updateField("preferredLanguage")}
                    >
                      <option>English</option>
                      <option>Tamil</option>
                    </select>
                  </label>
                  <label>
                    Farm size
                    <input
                      required
                      value={form.farmSize}
                      onChange={updateField("farmSize")}
                      placeholder="e.g. 3 acres"
                    />
                  </label>
                </div>
                <label>
                  Main crops
                  <input
                    required
                    value={form.mainCrops}
                    onChange={updateField("mainCrops")}
                    placeholder="Rice, groundnut, sugarcane"
                  />
                  <span className="field-help">
                    Separate multiple crops with commas
                  </span>
                </label>
              </>
            )}
            {mode === "login" && (
              <>
                <label>
                  Email address
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    placeholder="you@example.com"
                  />
                </label>
                <label>
                  Password
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={updateField("password")}
                    placeholder="Your password"
                  />
                </label>
              </>
            )}
            <button className="auth-submit" disabled={loading}>
              {loading
                ? "Securing your profile..."
                : mode === "register"
                  ? "Create farmer profile"
                  : "Sign in"}{" "}
              <ArrowUpRight size={16} />
            </button>
          </form>
          <p className="auth-privacy">
            <ShieldCheck size={14} /> Your password is encrypted and never
            stored in plain text.
          </p>
        </div>
      </main>
    </div>
  );
}

function FarmDetails({
  farmer,
  onBack,
  onSignOut,
  onSaved,
  language,
  setLanguage,
}) {
  const saved = farmer.farmDetails || {};
  const [form, setForm] = useState({
    state: saved.state || "Tamil Nadu",
    district: saved.district || farmer.district || "",
    village: saved.village || farmer.village || "",
    latitude: saved.latitude ?? "",
    longitude: saved.longitude ?? "",
    nitrogen: saved.nitrogen ?? "",
    phosphorus: saved.phosphorus ?? "",
    potassium: saved.potassium ?? "",
    soilPh: saved.soilPh ?? "",
    soilType: saved.soilType || "Loamy",
    organicCarbon: saved.organicCarbon ?? "",
    temperature: saved.temperature ?? "",
    humidity: saved.humidity ?? "",
    rainfall: saved.rainfall ?? "",
    season: saved.season || "Kharif",
  });
  const [weatherState, setWeatherState] = useState("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  const useWeather = async () => {
    if (!form.latitude || !form.longitude) {
      setError(
        "Add latitude and longitude first so we can find local weather.",
      );
      return;
    }
    setWeatherState("loading");
    setError("");
    try {
      const response = await fetch(
        `/api/weather?latitude=${encodeURIComponent(form.latitude)}&longitude=${encodeURIComponent(form.longitude)}`,
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Weather could not be loaded.");
      setForm((current) => ({
        ...current,
        temperature: result.temperature,
        humidity: result.humidity,
        rainfall: result.rainfall,
      }));
      setWeatherState("success");
    } catch (requestError) {
      setError(requestError.message);
      setWeatherState("error");
    }
  };
  const save = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/farm-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Farm details could not be saved.");
      onSaved({ ...farmer, farmDetails: result.farmDetails });
      setMessage("Farm details saved to your profile.");
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  const input = (label, field, type = "text", placeholder = "") => (
    <label className="farm-field">
      {label}
      <input
        required={[
          "state",
          "district",
          "village",
          "latitude",
          "longitude",
          "nitrogen",
          "phosphorus",
          "potassium",
          "soilPh",
          "soilType",
          "season",
        ].includes(field)}
        type={type}
        step={type === "number" ? "any" : undefined}
        value={form[field]}
        onChange={update(field)}
        placeholder={placeholder}
      />
    </label>
  );

  const tamil = language === "TA";
  return (
    <div className="farm-details-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Sprout size={20} />
          </span>
          <span>
            Fieldwise<span className="brand-dot">.</span>
          </span>
        </div>
        <div className="profile-card">
          <div className="avatar">
            {farmer.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <strong>{farmer.name}</strong>
            <span>Smallholder farmer</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <nav className="nav-list">
          <button className="nav-item" onClick={onBack}>
            <Flower2 size={18} />
            <span>{tamil ? "முகப்பு" : "Overview"}</span>
          </button>
          <button className="nav-item active">
            <ClipboardList size={18} />
            <span>{tamil ? "பண்ணை விவரங்கள்" : "Farm details"}</span>
          </button>
          <button className="nav-item" onClick={onBack}>
            <Sprout size={18} />
            <span>{tamil ? "பயிர் ஆலோசனை" : "Crop advisor"}</span>
          </button>
          <button className="nav-item" onClick={onBack}>
            <Camera size={18} />
            <span>{tamil ? "நோய் பரிசோதனை" : "Disease scan"}</span>
          </button>
          <button className="nav-item" onClick={onBack}>
            <CloudRain size={18} />
            <span>{tamil ? "வானிலை" : "Weather"}</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button className="settings-link" onClick={onBack}>
            <ArrowUpRight size={16} />{" "}
            {tamil ? "பணியிடத்திற்குத் திரும்பு" : "Back to workspace"}
          </button>
          <button className="logout-link" onClick={onSignOut}>
            {tamil ? "வெளியேறு" : "Sign out"}
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>{tamil ? "பண்ணை விவரங்கள்" : "Farm details"}</strong>
          </div>
          <div className="top-actions">
            <div className="location">
              <MapPin size={16} />
              <span>
                {form.village || (tamil ? "உங்கள் கிராமம்" : "Your village")}
              </span>
            </div>
            <div className="language-toggle">
              <button
                className={!tamil ? "selected" : ""}
                onClick={() => setLanguage("EN")}
              >
                EN
              </button>
              <button
                className={tamil ? "selected" : ""}
                onClick={() => setLanguage("TA")}
              >
                தமிழ்
              </button>
            </div>
            <button
              className="icon-button notification"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>
          </div>
        </header>
        <div className="content-wrap farm-details-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">
                {tamil ? "உங்கள் பண்ணை சுயவிவரம்" : "YOUR FARM PROFILE"}{" "}
                <span className="live-dot" />{" "}
                {tamil
                  ? "உங்கள் கணக்கிற்கு மட்டும்"
                  : "PRIVATE TO YOUR ACCOUNT"}
              </p>
              <h1>{tamil ? "பண்ணை விவரங்கள்" : "Farm details"}</h1>
              <p className="subheading">
                {tamil
                  ? "சிறந்த பயிர் பரிந்துரைகளுக்கு உங்கள் வயல் நிலவரத்தைப் புதுப்பிக்கவும்."
                  : "Keep your field conditions current for sharper crop recommendations."}
              </p>
            </div>
            <button className="primary-button" onClick={save}>
              <Save size={16} /> {tamil ? "சேமிக்கவும்" : "Save details"}
            </button>
          </section>
          {message && (
            <div className="farm-message">
              <ShieldCheck size={16} /> {message}
            </div>
          )}
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}
          <form className="farm-form" onSubmit={save}>
            <section className="farm-panel">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">
                    {tamil
                      ? "நீங்கள் விவசாயம் செய்யும் இடம்"
                      : "WHERE YOU FARM"}
                  </p>
                  <h2>{tamil ? "இடம்" : "Location"}</h2>
                </div>
                <LocateFixed size={20} />
              </div>
              <div className="farm-fields-grid">
                {input(
                  tamil ? "மாநிலம்" : "State",
                  "state",
                  "text",
                  "Tamil Nadu",
                )}
                {input(
                  tamil ? "மாவட்டம்" : "District",
                  "district",
                  "text",
                  "Thanjavur",
                )}
                {input(
                  tamil ? "கிராமம்" : "Village",
                  "village",
                  "text",
                  "Kumbakonam",
                )}
                {input("Latitude", "latitude", "number", "10.7870")}
                {input("Longitude", "longitude", "number", "79.1378")}
              </div>
              <p className="farm-help">
                <LocateFixed size={13} />{" "}
                {tamil
                  ? "உள்ளூர் வானிலையைப் பெற அட்சரேகை மற்றும் தீர்க்கரேகை உதவும்."
                  : "Coordinates help us fetch local weather."}
              </p>
            </section>
            <section className="farm-panel">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">
                    {tamil ? "உங்கள் மண்ணில் உள்ளவை" : "WHAT IS IN YOUR SOIL"}
                  </p>
                  <h2>{tamil ? "மண் தகவல்" : "Soil information"}</h2>
                </div>
                <Sprout size={20} />
              </div>
              <div className="farm-fields-grid">
                {input("Nitrogen (N)", "nitrogen", "number", "e.g. 90 mg/kg")}
                {input(
                  "Phosphorus (P)",
                  "phosphorus",
                  "number",
                  "e.g. 42 mg/kg",
                )}
                {input("Potassium (K)", "potassium", "number", "e.g. 55 mg/kg")}
                {input("Soil pH", "soilPh", "number", "e.g. 6.8")}
                <label className="farm-field">
                  {tamil ? "மண் வகை" : "Soil type"}
                  <select
                    required
                    value={form.soilType}
                    onChange={update("soilType")}
                  >
                    <option>Loamy</option>
                    <option>Clay</option>
                    <option>Sandy</option>
                    <option>Silty</option>
                    <option>Red soil</option>
                    <option>Black soil</option>
                  </select>
                </label>
                {input(
                  tamil
                    ? "கரிம கார்பன் (விருப்பம்)"
                    : "Organic carbon (optional)",
                  "organicCarbon",
                  "number",
                  "e.g. 0.6%",
                )}
              </div>
            </section>
            <section className="farm-panel environment-panel">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">
                    {tamil
                      ? "உங்கள் வயல் அனுபவிக்கும் நிலை"
                      : "WHAT YOUR FIELD IS EXPERIENCING"}
                  </p>
                  <h2>
                    {tamil
                      ? "சுற்றுச்சூழல் தகவல்"
                      : "Environmental information"}
                  </h2>
                </div>
                <button
                  type="button"
                  className="weather-sync"
                  onClick={useWeather}
                  disabled={weatherState === "loading"}
                >
                  {weatherState === "loading" ? (
                    <RefreshCw size={14} className="spin" />
                  ) : (
                    <Thermometer size={14} />
                  )}{" "}
                  {weatherState === "success"
                    ? tamil
                      ? "வானிலை புதுப்பிக்கப்பட்டது"
                      : "Weather updated"
                    : tamil
                      ? "தற்போதைய வானிலை"
                      : "Use current weather"}
                </button>
              </div>
              <div className="farm-fields-grid">
                {input("Temperature (°C)", "temperature", "number", "e.g. 29")}
                {input("Humidity (%)", "humidity", "number", "e.g. 78")}
                {input("Rainfall (mm)", "rainfall", "number", "e.g. 42")}
                <label className="farm-field">
                  {tamil ? "பருவம்" : "Season"}
                  <select
                    required
                    value={form.season}
                    onChange={update("season")}
                  >
                    <option>Kharif</option>
                    <option>Rabi</option>
                    <option>Zaid</option>
                    <option>Year-round</option>
                  </select>
                </label>
              </div>
              <p className="farm-help">
                <CloudRain size={13} />{" "}
                {tamil
                  ? "அட்சரேகை மற்றும் தீர்க்கரேகை இருந்தால் வானிலை தானாகப் பெறப்படும்."
                  : "Weather values are fetched securely through Fieldwise when coordinates are available."}
              </p>
            </section>
            <div className="farm-form-actions">
              <span>
                {tamil
                  ? "இந்த மாற்றங்கள் அடுத்த பயிர் பரிந்துரையைப் புதுப்பிக்கும்."
                  : "Changes update your next crop recommendation."}
              </span>
              <button type="submit" className="primary-button">
                <Save size={16} />{" "}
                {tamil ? "பண்ணை சுயவிவரத்தை சேமிக்கவும்" : "Save farm profile"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function LandingPage({ onGetStarted }) {
  return <div className="landing-page"><nav className="landing-nav"><div className="brand"><span className="brand-mark"><Sprout size={20} /></span><span>Fieldwise<span className="brand-dot">.</span></span></div><div className="landing-nav-links"><a href="#how-it-works">How it works</a><a href="#features">Features</a><button className="landing-login" onClick={onGetStarted}>Sign in <ArrowUpRight size={14} /></button></div></nav><main><section className="landing-hero"><div className="landing-hero-copy"><p className="eyebrow landing-eyebrow"><span className="live-dot" /> BUILT FOR EVERY FIELD</p><h1>Clarity for the next <em>season.</em></h1><p className="landing-lede">Fieldwise brings crop intelligence, plant health, weather, and market signals together so every farming decision starts with better information.</p><div className="landing-actions"><button className="landing-cta" onClick={onGetStarted}>Get started <ArrowUpRight size={17} /></button><span className="landing-trust"><ShieldCheck size={15} /> Practical guidance, human decisions</span></div></div><div className="landing-hero-art"><div className="sun-disc" /><div className="field-line line-one" /><div className="field-line line-two" /><div className="field-line line-three" /><div className="hero-weather-card"><CloudSun size={18} /><div><strong>29°</strong><span>Thanjavur · Live</span></div></div><div className="hero-crop-card"><span className="hero-crop-icon"><Sprout size={18} /></span><div><strong>Rice · ADT 45</strong><span><b>94%</b> field fit</span></div><TrendingUp size={16} /></div></div></section><section className="landing-proof"><span>USED TO MAKE BETTER CALLS ABOUT</span><strong>SOIL</strong><strong>SEASONS</strong><strong>PLANT HEALTH</strong><strong>MARKETS</strong><strong>WATER</strong></section><section className="landing-features" id="features"><div className="landing-section-intro"><p className="section-kicker">ONE FARM WORKSPACE</p><h2>Everything your field is asking for.</h2><p>Simple tools for the moments that matter, from the first soil reading to the next harvest plan.</p></div><div className="feature-grid"><article className="feature-card feature-green"><span><Sprout size={20} /></span><h3>Know what to plant</h3><p>Rank suitable crops using soil, weather, season, and local context.</p><b>Crop advisor <ArrowUpRight size={14} /></b></article><article className="feature-card feature-gold"><span><Camera size={20} /></span><h3>See plant health clearly</h3><p>Screen leaf images and get safe, disease-specific next steps.</p><b>Disease scan <ArrowUpRight size={14} /></b></article><article className="feature-card feature-blue"><span><CloudRain size={20} /></span><h3>Plan around change</h3><p>Bring forecasts, farming alerts, and mandi signals into one view.</p><b>Weather & market <ArrowUpRight size={14} /></b></article></div></section><section className="landing-workflow" id="how-it-works"><div className="workflow-image"><div className="workflow-note"><CheckCircle2 size={16} /><span>Farm profile ready</span></div></div><div className="workflow-copy"><p className="section-kicker">HOW IT WORKS</p><h2>From your field to your next decision.</h2><div className="workflow-step"><span>01</span><div><strong>Tell us about your farm</strong><p>Location, soil readings, crops, and growing conditions.</p></div></div><div className="workflow-step"><span>02</span><div><strong>Get a clearer picture</strong><p>Recommendations and advisories explain the why, not just the result.</p></div></div><div className="workflow-step"><span>03</span><div><strong>Act with confidence</strong><p>Keep your history, ask the assistant, and consult experts when it matters.</p></div></div></div></section><section className="landing-bottom"><div><p className="section-kicker">READY WHEN YOUR FIELD IS</p><h2>Make the next decision a little clearer.</h2></div><button className="landing-cta" onClick={onGetStarted}>Create your farm profile <ArrowUpRight size={17} /></button></section></main><footer className="landing-footer"><span>Fieldwise<span className="brand-dot">.</span></span><span>Decision support for the people who grow our food.</span><span>© 2026</span></footer></div>;
}

function FarmerToolShell({
  farmer,
  active,
  onNavigate,
  onSignOut,
  language,
  setLanguage,
  children,
}) {
  const tamil = language === "TA";
  const navItems = [
    ["Overview", Flower2, tamil ? "முகப்பு" : "Overview"],
    ["Farm details", ClipboardList, tamil ? "பண்ணை விவரங்கள்" : "Farm details"],
    ["Crop advisor", Sprout, tamil ? "பயிர் ஆலோசனை" : "Crop advisor"],
    ["Disease scan", Camera, tamil ? "நோய் பரிசோதனை" : "Disease scan"],
    [
      "Weather & market",
      CloudSun,
      tamil ? "வானிலை மற்றும் சந்தை" : "Weather & market",
    ],
    ["History", ClipboardList, tamil ? "முந்தைய பதிவுகள்" : "History"],
  ];

  return (
    <div className="tool-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Sprout size={20} />
          </span>
          <span>
            Fieldwise<span className="brand-dot">.</span>
          </span>
        </div>
        <div className="profile-card">
          <div className="avatar">
            {farmer.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <strong>{farmer.name}</strong>
            <span>{tamil ? "சிறு விவசாயி" : "Smallholder farmer"}</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <nav className="nav-list">
          {navItems.map(([item, Icon, label]) => (
            <button
              key={item}
              className={active === item ? "nav-item active" : "nav-item"}
              onClick={() => onNavigate(item)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <MessageCircle size={18} />
            </div>
            <strong>{tamil ? "உதவி வேண்டுமா?" : "Need help?"}</strong>
            <span>
              {tamil
                ? "பண்ணை உதவியாளரிடம் கேளுங்கள்"
                : "Ask our farm assistant"}
            </span>
            <button onClick={() => onNavigate("Assistant")}>
              {tamil ? "உதவியாளரைத் திறக்கவும்" : "Open assistant"}{" "}
              <ArrowUpRight size={14} />
            </button>
          </div>
          <button
            className="settings-link"
            onClick={() => onNavigate("Overview")}
          >
            <ArrowUpRight size={16} />{" "}
            {tamil ? "பணியிடத்திற்குத் திரும்பு" : "Back to workspace"}
          </button>
          <button className="logout-link" onClick={onSignOut}>
            {tamil ? "வெளியேறு" : "Sign out"}
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>
              {tamil && active === "Crop advisor" ? "பயிர் ஆலோசனை" : active}
            </strong>
          </div>
          <div className="top-actions">
            <div className="location">
              <MapPin size={16} />
              <span>{farmer.district}</span>
            </div>
            <div className="language-toggle">
              <button
                className={!tamil ? "selected" : ""}
                onClick={() => setLanguage("EN")}
              >
                EN
              </button>
              <button
                className={tamil ? "selected" : ""}
                onClick={() => setLanguage("TA")}
              >
                தமிழ்
              </button>
            </div>
            <button
              className="icon-button notification"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function CropAdvisor({ farmer, onNavigate, onSignOut, language, setLanguage }) {
  const details = farmer.farmDetails || {};
  const tamil = language === "TA";
  const [form, setForm] = useState({
    nitrogen: details.nitrogen ?? 90,
    phosphorus: details.phosphorus ?? 42,
    potassium: details.potassium ?? 55,
    soilPh: details.soilPh ?? 6.8,
    temperature: details.temperature ?? 29,
    humidity: details.humidity ?? 78,
    rainfall: details.rainfall ?? 900,
    season: details.season || "Kharif",
    district: details.district || farmer.district || "Thanjavur",
  });
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/crop-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setResults(result.recommendations);
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
      return;
    }
    setStatus("success");
  };
  return (
    <FarmerToolShell
      farmer={farmer}
      active="Crop advisor"
      onNavigate={onNavigate}
      onSignOut={onSignOut}
      language={language}
      setLanguage={setLanguage}
    >
      <div className="content-wrap tool-content">
        <section className="welcome-row">
          <div>
            <p className="eyebrow">
              AI CROP ADVISOR <span className="live-dot" />{" "}
              {tamil ? "பயிர் பொருத்தம்" : "AGRONOMIC FIT"}
            </p>
            <h1>
              {tamil ? "சிறந்த பயிரை கண்டறியுங்கள்" : "Find your best crop"}
            </h1>
            <p className="subheading">
              {tamil
                ? "இந்த பருவத்திற்கு ஏற்ற பயிர்களை உங்கள் வயல் நிலவரத்தின் அடிப்படையில் தரவரிசைப்படுத்துங்கள்."
                : "Use your current field conditions to rank suitable crops for this season."}
            </p>
          </div>
          <div className="tool-badge">
            <Sprout size={16} />{" "}
            {tamil
              ? "உள்ளூர் தகவலுடன் 5 உள்ளீடுகள்"
              : "5 inputs + local context"}
          </div>
        </section>
        <div className="tool-two-column">
          <form className="tool-panel advisor-form" onSubmit={submit}>
            <div className="section-heading">
              <div>
                <p className="section-kicker">
                  {tamil ? "வயல் தகவல்கள்" : "FIELD SIGNALS"}
                </p>
                <h2>{tamil ? "உங்கள் நிலவரம்" : "Your conditions"}</h2>
              </div>
              <button
                type="button"
                className="text-button"
                onClick={() => onNavigate("Farm details")}
              >
                {tamil ? "பண்ணை விவரங்களைத் திருத்து" : "Edit farm details"}{" "}
                <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="tool-fields">
              {[
                ["Nitrogen (N)", "nitrogen"],
                ["Phosphorus (P)", "phosphorus"],
                ["Potassium (K)", "potassium"],
                ["Soil pH", "soilPh"],
                ["Temperature °C", "temperature"],
                ["Humidity %", "humidity"],
                ["Rainfall mm", "rainfall"],
              ].map(([label, field]) => (
                <label key={field}>
                  {label}
                  <input
                    required
                    type="number"
                    step="any"
                    value={form[field]}
                    onChange={update(field)}
                  />
                </label>
              ))}
              <label>
                {tamil ? "பருவம்" : "Season"}
                <select value={form.season} onChange={update("season")}>
                  <option>Kharif</option>
                  <option>Rabi</option>
                  <option>Zaid</option>
                  <option>Year-round</option>
                </select>
              </label>
              <label className="full-field">
                {tamil ? "மாவட்டம்" : "District"}
                <input
                  required
                  value={form.district}
                  onChange={update("district")}
                />
              </label>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button
              className="primary-button advisor-submit"
              disabled={status === "loading"}
            >
              <Sprout size={16} />{" "}
              {status === "loading"
                ? tamil
                  ? "கணக்கிடுகிறது..."
                  : "Calculating fit..."
                : tamil
                  ? "பயிர்களைப் பரிந்துரைக்கவும்"
                  : "Recommend crops"}{" "}
              <ArrowUpRight size={15} />
            </button>
            <p className="tool-note">
              {tamil
                ? "இது முடிவு ஆதரவு மட்டுமே; உள்ளூர் வேளாண் ஆலோசனையை மாற்றாது."
                : "Recommendations are decision support, not a substitute for local agronomy advice."}
            </p>
          </form>
          <div className="tool-panel advisor-results">
            <div className="section-heading">
              <div>
                <p className="section-kicker">
                  {tamil ? "இந்த வயலுக்கான தரவரிசை" : "RANKED FOR THIS FIELD"}
                </p>
                <h2>
                  {results.length
                    ? tamil
                      ? "சிறந்த பரிந்துரைகள்"
                      : "Top recommendations"
                    : tamil
                      ? "உங்கள் பயிர் பட்டியல்"
                      : "Your crop shortlist"}
                </h2>
              </div>
              <CheckCircle2 size={19} />
            </div>
            {results.length ? (
              <div className="result-list">
                {results.map((result, index) => (
                  <div className="result-card" key={result.crop}>
                    <div className="result-rank">0{index + 1}</div>
                    <div className="result-copy">
                      <strong>
                        {result.crop} <span>· {result.variety}</span>
                      </strong>
                      <p>{result.explanation}</p>
                      <div className="result-tags">
                        {result.factors.season && (
                          <span>{tamil ? "பருவ பொருத்தம்" : "Season fit"}</span>
                        )}
                        {result.factors.location && (
                          <span>
                            {tamil ? "உள்ளூர் பொருத்தம்" : "Local fit"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="suitability">
                      <strong>{result.suitability}%</strong>
                      <span>{tamil ? "பொருத்தம்" : "fit"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-tool">
                <Sprout size={31} />
                <p>
                  {tamil
                    ? "மண் மற்றும் வானிலை மதிப்புகளை உள்ளிட்டு எளிய காரணங்களுடன் பட்டியலைப் பெறுங்கள்."
                    : "Enter your latest soil and weather values, then get a ranked shortlist with simple reasons."}
                </p>
                <span>
                  {tamil
                    ? "ஒரே ஒரு மண் மதிப்பில் இருந்து பரிந்துரைக்க மாட்டோம்."
                    : "We never recommend from a single soil number."}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </FarmerToolShell>
  );
}

function DiseaseScan({ farmer, onNavigate, onSignOut, language, setLanguage }) {
  const tamil = language === "TA";
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const scan = async (event) => {
    event.preventDefault();
    if (!file) return;
    setStatus("loading");
    setError("");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch("/api/disease-detection", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data);
      setStatus("success");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  };
  return (
    <FarmerToolShell
      farmer={farmer}
      active="Disease scan"
      onNavigate={onNavigate}
      onSignOut={onSignOut}
      language={language}
      setLanguage={setLanguage}
    >
      <div className="content-wrap tool-content">
        <section className="welcome-row">
          <div>
            <p className="eyebrow">
              {tamil ? "தாவர ஆரோக்கிய பரிசோதனை" : "PLANT HEALTH CHECK"} <span className="live-dot" /> {tamil ? "பாதுகாப்பான முடிவுகள்" : "MODEL-SAFE RESULTS"}
            </p>
            <h1>{tamil ? "இலையை பரிசோதிக்கவும்" : "Scan a leaf"}</h1>
            <p className="subheading">
              {tamil ? "தெளிவான பயிர் படத்தைப் பதிவேற்றி நோய் பரிசோதனை மற்றும் அடுத்த படிகளைப் பெறுங்கள்." : "Upload a clear crop image for model-backed disease screening and practical next steps."}
            </p>
          </div>
          <div className="tool-badge amber-badge">
            <ShieldAlert size={16} /> No unsupported pesticide doses
          </div>
        </section>
        <div className="tool-two-column disease-layout">
          <form className="tool-panel upload-panel" onSubmit={scan}>
            <div className="section-heading">
              <div>
                <p className="section-kicker">STEP 01</p>
                <h2>Upload a crop leaf</h2>
              </div>
              <Camera size={20} />
            </div>
            <label className="upload-zone">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                  setResult(null);
                  setError("");
                }}
              />
              <span className="upload-circle">
                <Upload size={22} />
              </span>
              <strong>{file ? file.name : "Choose a clear leaf photo"}</strong>
              <span>JPG, PNG or WEBP · max 5 MB</span>
            </label>
            {error && <div className="auth-error">{error}</div>}
            <button
              className="primary-button advisor-submit"
              disabled={!file || status === "loading"}
            >
              <Camera size={16} />{" "}
              {status === "loading" ? "Checking leaf..." : "Run disease check"}{" "}
              <ArrowUpRight size={15} />
            </button>
            <p className="tool-note">
              Take the photo in daylight and include the whole leaf. A model
              result should still be confirmed locally.
            </p>
          </form>
          <div className="tool-panel disease-result-panel">
            <div className="section-heading">
              <div>
                <p className="section-kicker">STEP 02</p>
                <h2>Result & advisory</h2>
              </div>
              <ShieldCheck size={19} />
            </div>
            {result ? (
              <>
                <div className="disease-result-head">
                  <div
                    className={result.healthy ? "health-icon" : "disease-icon"}
                  >
                    {result.healthy ? (
                      <CheckCircle2 size={25} />
                    ) : (
                      <ShieldAlert size={25} />
                    )}
                  </div>
                  <div>
                    <strong>{result.disease}</strong>
                    <span>
                      {Math.round(result.confidence * 100)}% model confidence ·{" "}
                      {result.model}
                    </span>
                  </div>
                </div>
                <div className="advisory-sections">
                  <div>
                    <strong>Symptoms to watch</strong>
                    <ul>
                      {result.advisory.symptoms.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Prevention</strong>
                    <ul>
                      {result.advisory.prevention.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Safe management</strong>
                    <ul>
                      {result.advisory.management.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="expert-callout">
                    <strong>When to consult an expert</strong>
                    <p>{result.advisory.expertWhen}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-tool">
                <ShieldCheck size={31} />
                <p>
                  Your result and disease-specific guidance will appear here.
                </p>
                <span>
                  Image diagnosis is disabled until a trained model endpoint is
                  configured.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </FarmerToolShell>
  );
}

  const fetchWeatherMarket = async (latitude, longitude) => {
    const [weatherResult, marketResult] = await Promise.allSettled([
      fetch(`/api/weather?latitude=${latitude}&longitude=${longitude}`, { credentials: 'include' }),
      fetch('/api/market', { credentials: 'include' }),
    ]);
    if (weatherResult.status === 'rejected') throw new Error('Weather service is unavailable.');
    const weatherResponse = weatherResult.value;
    const weatherData = await weatherResponse.json();
    if (!weatherResponse.ok) throw new Error(weatherData.error);
    const marketData = marketResult.status === 'fulfilled' ? await marketResult.value.json() : { error: 'Live market data is unavailable.' };
    return { weatherData, marketData: marketResult.status === 'fulfilled' && marketResult.value.ok ? marketData : null, marketError: marketData.error };
};

function WeatherMarket({
  farmer,
  onNavigate,
  onSignOut,
  language,
  setLanguage,
}) {
  const tamil = language === "TA";
  const details = farmer.farmDetails || {};
  const [weather, setWeather] = useState(null);
  const [market, setMarket] = useState(null);
  const [error, setError] = useState("");
  const latitude = details.latitude || 10.787;
  const longitude = details.longitude || 79.1378;
  const load = async () => {
    setError("");
    try {
      const { weatherData, marketData } = await fetchWeatherMarket(
        latitude,
        longitude,
      );
      setWeather(weatherData);
      setMarket(marketData);
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  useEffect(() => {
    let active = true;
    fetchWeatherMarket(latitude, longitude)
      .then(({ weatherData, marketData }) => {
        if (active) {
          setWeather(weatherData);
          setMarket(marketData);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [latitude, longitude]);
  return (
    <FarmerToolShell
      farmer={farmer}
      active="Weather & market"
      onNavigate={onNavigate}
      onSignOut={onSignOut}
      language={language}
      setLanguage={setLanguage}
    >
      <div className="content-wrap tool-content">
        <section className="welcome-row">
          <div>
            <p className="eyebrow">
              {tamil ? "வானிலை மற்றும் சந்தை" : "WEATHER & MARKET"} <span className="live-dot" /> {tamil ? "நேரடி ஆதாரங்கள்" : "LIVE SOURCES"}
            </p>
            <h1>{tamil ? "அடுத்த சில நாட்களுக்கு திட்டமிடுங்கள்" : "Plan around the next few days"}</h1>
            <p className="subheading">
              {tamil ? "தற்போதைய நிலை, பண்ணை எச்சரிக்கைகள் மற்றும் சந்தை தகவல்கள் ஒரே இடத்தில்." : "Current conditions, farm alerts, and market signals in one place."}
            </p>
          </div>
          <button className="primary-button" onClick={load}>
            <RefreshCw size={16} /> Refresh data
          </button>
        </section>
        {error && <div className="auth-error">{error}</div>}
        <div className="weather-hero tool-panel">
          <div>
            <p className="section-kicker">CURRENT CONDITIONS</p>
            <div className="big-weather">
              <CloudSun size={37} />
              <strong>{weather ? `${weather.temperature}°C` : "--"}</strong>
            </div>
            <span>
              {weather
                ? `${weather.humidity}% humidity · ${weather.rainfall} mm precipitation`
                : "Loading local conditions..."}
            </span>
          </div>
          <div className="weather-alert">
            <ShieldAlert size={18} />
            <div>
              <strong>Farming alert</strong>
              <p>
                {weather?.forecast?.precipitation_sum?.[1] > 20
                  ? "Rain is likely tomorrow. Delay foliar sprays and check drainage."
                  : "No heavy-rain alert from the current forecast. Keep monitoring local conditions."}
              </p>
            </div>
          </div>
        </div>
        <div className="tool-two-column weather-market-grid">
          <div className="tool-panel">
            <div className="section-heading">
              <div>
                <p className="section-kicker">5-DAY OUTLOOK</p>
                <h2>Forecast</h2>
              </div>
              <CloudRain size={19} />
            </div>
            <div className="forecast-list">
              {(weather?.forecast?.time || []).map((day, index) => (
                <div className="forecast-row" key={day}>
                  <strong>
                    {new Date(day).toLocaleDateString("en-IN", {
                      weekday: "short",
                    })}
                  </strong>
                  <span>
                    {weather.forecast.temperature_2m_min[index]}° –{" "}
                    {weather.forecast.temperature_2m_max[index]}°
                  </span>
                  <span>
                    <CloudRain size={14} />{" "}
                    {weather.forecast.precipitation_sum[index]} mm
                  </span>
                </div>
              ))}
            </div>
            <p className="source-line">
              <ExternalLink size={12} /> Source: Open-Meteo · current and
              forecast weather
            </p>
          </div>
          <div className="tool-panel">
            <div className="section-heading">
              <div>
                <p className="section-kicker">MARKET WATCH</p>
                <h2>Nearby prices</h2>
              </div>
              <TrendingUp size={19} />
            </div>
            <div className="market-tool-list">
              {market?.prices?.length ? market.prices.map((item) => (
                <div className="market-tool-row" key={item.crop}>
                  <div>
                    <strong>{item.crop}</strong>
                    <span>
                      {item.market} · {item.variety}
                    </span>
                  </div>
                  <div>
                    <strong>₹ {item.price.toLocaleString("en-IN")}</strong>
                    <span
                      className={item.change >= 0 ? "market-up" : "market-down"}
                    >
                      {item.change > 0 ? "+" : ""}
                      {item.change}%
                    </span>
                  </div>
                </div>
              )) : <p className="history-empty">Live market prices are unavailable until an official market adapter is configured.</p>}
            </div>
            <p className="source-line">
              <ExternalLink size={12} />{" "}
              {market?.source || "No live market source configured"} ·{" "}
              {market?.asOf
                ? new Date(market.asOf).toLocaleDateString("en-IN")
                : "today"}
            </p>
          </div>
        </div>
      </div>
    </FarmerToolShell>
  );
}

function HistoryWorkspace({
  farmer,
  onNavigate,
  onSignOut,
  language,
  setLanguage,
}) {
  const tamil = language === "TA";
  const [history, setHistory] = useState({
    recommendations: [],
    diseaseScans: [],
    chats: [],
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/history", { credentials: "include" })
      .then((response) => response.json())
      .then(setHistory)
      .finally(() => setLoading(false));
  }, []);
  return (
    <FarmerToolShell
      farmer={farmer}
      active="History"
      onNavigate={onNavigate}
      onSignOut={onSignOut}
      language={language}
      setLanguage={setLanguage}
    >
      <div className="content-wrap tool-content">
        <section className="welcome-row">
          <div>
            <p className="eyebrow">
              {tamil ? "உங்கள் பதிவுகள்" : "YOUR RECORDS"}{" "}
              <span className="live-dot" /> PRIVATE TO YOUR ACCOUNT
            </p>
            <h1>{tamil ? "முந்தைய செயல்பாடுகள்" : "Your history"}</h1>
            <p className="subheading">
              {tamil
                ? "முந்தைய பயிர் பரிந்துரைகள், நோய் பரிசோதனைகள் மற்றும் கேள்விகளைப் பாருங்கள்."
                : "Review previous crop recommendations, disease scans, and assistant conversations."}
            </p>
          </div>
          <div className="tool-badge">
            <ClipboardList size={16} />{" "}
            {tamil ? "தனிப்பட்ட பதிவு" : "Private record"}
          </div>
        </section>
        {loading ? (
          <div className="tool-panel empty-tool">
            <RefreshCw className="spin" size={26} />
            <p>
              {tamil ? "பதிவுகளை ஏற்றுகிறது..." : "Loading your records..."}
            </p>
          </div>
        ) : (
          <div className="history-grid">
            <div className="tool-panel">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">
                    {tamil ? "பயிர் ஆலோசனைகள்" : "CROP ADVICE"}
                  </p>
                  <h2>{tamil ? "பரிந்துரைகள்" : "Recommendations"}</h2>
                </div>
                <Sprout size={19} />
              </div>
              {history.recommendations.length ? (
                history.recommendations.map((item) => (
                  <div className="history-row" key={item._id}>
                    <div>
                      <strong>
                        {item.recommendations?.[0]?.crop ||
                          "Crop recommendation"}
                      </strong>
                      <span>
                        {new Date(item.createdAt).toLocaleDateString("en-IN")} ·{" "}
                        {item.recommendations?.length || 0} crops ranked
                      </span>
                    </div>
                    <ArrowUpRight size={15} />
                  </div>
                ))
              ) : (
                <p className="history-empty">
                  {tamil
                    ? "இன்னும் பரிந்துரைகள் இல்லை."
                    : "No crop recommendations yet."}
                </p>
              )}
            </div>
            <div className="tool-panel">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">
                    {tamil ? "தாவர ஆரோக்கியம்" : "PLANT HEALTH"}
                  </p>
                  <h2>{tamil ? "நோய் பரிசோதனைகள்" : "Disease scans"}</h2>
                </div>
                <Camera size={19} />
              </div>
              {history.diseaseScans.length ? (
                history.diseaseScans.map((item) => (
                  <div className="history-row" key={item._id}>
                    <div>
                      <strong>{item.disease}</strong>
                      <span>
                        {new Date(item.createdAt).toLocaleDateString("en-IN")} ·{" "}
                        {Math.round(item.confidence * 100)}% confidence
                      </span>
                    </div>
                    <ShieldCheck size={15} />
                  </div>
                ))
              ) : (
                <p className="history-empty">
                  {tamil
                    ? "இன்னும் நோய் பரிசோதனைகள் இல்லை."
                    : "No disease scans yet."}
                </p>
              )}
            </div>
            <div className="tool-panel history-chat-panel">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">
                    {tamil ? "உதவியாளர்" : "ASSISTANT"}
                  </p>
                  <h2>{tamil ? "கேள்விகள்" : "Chat history"}</h2>
                </div>
                <MessageCircle size={19} />
              </div>
              {history.chats.length ? (
                history.chats.slice(0, 5).map((item) => (
                  <div className="history-chat" key={item._id}>
                    <span>{item.question}</span>
                    <small>
                      <ExternalLink size={11} /> {item.source}
                    </small>
                  </div>
                ))
              ) : (
                <p className="history-empty">
                  {tamil
                    ? "இன்னும் உரையாடல்கள் இல்லை."
                    : "No conversations yet."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </FarmerToolShell>
  );
}

function OfflineGuide({ farmer, onNavigate, onSignOut, language, setLanguage }) {
  const tamil = language === "TA";
  const [content] = useState(() => { try { return JSON.parse(localStorage.getItem("fieldwise_offline_content") || "null"); } catch { return null; } });
  return <FarmerToolShell farmer={farmer} active="Offline guide" onNavigate={onNavigate} onSignOut={onSignOut} language={language} setLanguage={setLanguage}><div className="content-wrap tool-content"><section className="welcome-row"><div><p className="eyebrow">{tamil ? "ஆஃப்லைன் வழிகாட்டி" : "OFFLINE GUIDE"} <span className="live-dot" /> {tamil ? "சேமிக்கப்பட்ட தகவல்" : "CACHED CONTENT"}</p><h1>{tamil ? "இணையம் இல்லாமலும் கற்றுக்கொள்ளுங்கள்" : "Field guide, offline"}</h1><p className="subheading">{tamil ? "அடிப்படை பயிர், நோய் மற்றும் ஆலோசனை தகவல்கள் உங்கள் சாதனத்தில் சேமிக்கப்பட்டுள்ளன." : "Basic crop, disease, and advisory information saved on this device."}</p></div><div className="tool-badge"><Database size={16} /> {content?.version || "Not cached"}</div></section>{content ? <div className="history-grid">{[...(content.crops || []), ...(content.diseases || [])].slice(0, 6).map((item, index) => <div className="tool-panel offline-card" key={item.name || item.title || index}><p className="section-kicker">{item.name ? (tamil ? "பயிர் / நோய்" : "CROP / DISEASE") : (tamil ? "ஆதாரம்" : "SOURCE")}</p><h2>{item.name || item.title}</h2><p>{item.summary || item.answer || item.tamil}</p></div>)}</div> : <div className="tool-panel empty-tool"><Database size={31} /><p>{tamil ? "இணையம் கிடைக்கும் போது மீண்டும் முயற்சிக்கவும்." : "Connect once to download the basic offline guide."}</p></div>}</div></FarmerToolShell>;
}

function AdminWorkspace({ setLanguage, tamil, setRole }) {
  const [adminTab, setAdminTab] = useState("Dashboard");
  const [contentMessage, setContentMessage] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const adminNav = [
    ["Dashboard", BarChart3],
    ["Farmers", Users],
    ["Crop library", Sprout],
    ["Disease library", ShieldCheck],
    ["Advisory content", BookOpen],
    ["Market updates", TrendingUp],
    ["Activity log", ClipboardList],
  ];

  const publishContent = () => {
    setContentMessage("Knowledge base synced just now");
    window.setTimeout(() => setContentMessage(""), 2600);
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats", { credentials: "include" }).then((response) => response.ok ? response.json() : null),
      fetch("/api/admin/model-evaluation", { credentials: "include" }).then((response) => response.ok ? response.json() : null),
    ]).then(([stats, metrics]) => { setAnalytics(stats); setEvaluation(metrics); }).catch(() => undefined);
  }, []);

  return (
    <div className="admin-shell">
      <aside className="sidebar admin-sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Sprout size={20} />
          </span>
          <span>
            Fieldwise<span className="brand-dot">.</span>
          </span>
        </div>
        <div className="admin-mode">
          <ShieldCheck size={15} />
          <span>Admin workspace</span>
          <span className="secure-dot" />
        </div>
        <nav className="nav-list" aria-label="Admin navigation">
          {adminNav.map(([item, Icon]) => (
            <button
              key={item}
              className={adminTab === item ? "nav-item active" : "nav-item"}
              onClick={() => setAdminTab(item)}
            >
              <Icon size={18} />
              <span>{item}</span>
              {item === "Activity log" && (
                <span className="activity-count">12</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card admin-help">
            <div className="help-icon">
              <Database size={18} />
            </div>
            <strong>Knowledge base</strong>
            <span>Last synced 18 min ago</span>
            <button onClick={publishContent}>
              Sync updates <ArrowUpRight size={14} />
            </button>
          </div>
          <button className="settings-link">
            <Settings2 size={16} /> Settings
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Fieldwise</span>
            <span>/</span>
            <strong>{adminTab}</strong>
          </div>
          <div className="top-actions">
            <button className="role-switch" onClick={() => setRole("farmer")}>
              <Sprout size={14} /> Farmer view
            </button>
            <div className="admin-user">
              <div className="admin-avatar">AD</div>
              <span>Admin</span>
              <ChevronDown size={14} />
            </div>
            <button
              className="icon-button notification"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>
            <div className="language-toggle">
              <button
                className={!tamil ? "selected" : ""}
                onClick={() => setLanguage("EN")}
              >
                EN
              </button>
              <button
                className={tamil ? "selected" : ""}
                onClick={() => setLanguage("TA")}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </header>
        <div className="content-wrap admin-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">
                MONDAY, 14 OCTOBER 2024 <span className="live-dot" /> SYSTEM
                HEALTHY
              </p>
              <h1>{tamil ? "நிர்வாகக் கண்ணோட்டம்" : "Good morning, Admin"}</h1>
              <p className="subheading">
                Monitor your agricultural advisory network and keep its
                knowledge current.
              </p>
            </div>
            <button className="primary-button" onClick={publishContent}>
              <Database size={17} /> Update knowledge base{" "}
              <ArrowUpRight size={16} />
            </button>
          </section>
          {contentMessage && (
            <div className="admin-toast">
              <ShieldCheck size={16} /> {contentMessage}
            </div>
          )}
          <section className="admin-stats">
            <div className="admin-stat">
              <span className="admin-stat-icon green">
                <Users size={18} />
              </span>
              <div>
                <span>Registered farmers</span>
                <strong>{analytics?.farmers?.toLocaleString() || "--"}</strong>
                <small>
                  <b>+12.6%</b> this month
                </small>
              </div>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-icon blue">
                <Sprout size={18} />
              </span>
              <div>
                <span>Predictions this month</span>
                <strong>{analytics?.recommendations?.toLocaleString() || "--"}</strong>
                <small>
                  <b>+8.2%</b> from last month
                </small>
              </div>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-icon amber">
                <Camera size={18} />
              </span>
              <div>
                <span>Disease scans</span>
                <strong>{analytics?.diseaseScans?.toLocaleString() || "--"}</strong>
                <small>
                  <b>94.1%</b> model confidence
                </small>
              </div>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-icon purple">
                <MessageCircle size={18} />
              </span>
              <div>
                <span>AI questions answered</span>
                <strong>{analytics?.chatMessages?.toLocaleString() || "--"}</strong>
                <small>
                  <b>97.8%</b> helpful rating
                </small>
              </div>
            </div>
          </section>
          <section className="analytics-strip">
            <div className="admin-panel analytics-panel">
              <div className="section-heading"><div><p className="section-kicker">POPULAR CROPS</p><h2>What farmers are choosing</h2></div><TrendingUp size={19} /></div>
              {(analytics?.popularCrops || []).length ? analytics.popularCrops.map((item, index) => <div className="bar-row" key={item.name}><span>{index + 1}. {item.name}</span><div><i style={{ width: `${Math.min(100, item.count * 12)}%` }} /></div><strong>{item.count}</strong></div>) : <p className="history-empty">Analytics will appear as farmers use recommendations.</p>}
            </div>
            <div className="admin-panel analytics-panel">
              <div className="section-heading"><div><p className="section-kicker">COMMON DISEASES</p><h2>Plant health signals</h2></div><ShieldAlert size={19} /></div>
              {(analytics?.commonDiseases || []).length ? analytics.commonDiseases.map((item) => <div className="bar-row disease-bar" key={item.name}><span>{item.name}</span><div><i style={{ width: `${Math.min(100, item.count * 12)}%` }} /></div><strong>{item.count}</strong></div>) : <p className="history-empty">Disease trends will appear after scans are recorded.</p>}
            </div>
            <div className="admin-panel metrics-panel">
              <div className="section-heading"><div><p className="section-kicker">MODEL EVALUATION</p><h2>Validation metrics</h2></div><ShieldCheck size={19} /></div>
              {evaluation?.available ? <><div className="metric-model"><strong>Crop model</strong><span>Accuracy {Math.round(evaluation.crop.accuracy * 100)}% · F1 {Math.round(evaluation.crop.f1 * 100)}%</span></div><div className="metric-model"><strong>Disease model</strong><span>Accuracy {Math.round(evaluation.disease.accuracy * 100)}% · F1 {Math.round(evaluation.disease.f1 * 100)}%</span></div><div className="matrix-label">Confusion matrix · {evaluation.confusionMatrix.labels.join(" / ")}</div><div className="matrix-grid">{evaluation.confusionMatrix.values.flat().map((value, index) => <span key={`${value}-${index}`} style={{ opacity: 0.45 + value / 200 }}>{value}</span>)}</div><small className="metrics-note">{evaluation.confusionMatrix.note}</small></> : <p className="history-empty">{evaluation?.message || "Loading signed evaluation metrics..."}</p>}
            </div>
          </section>
          <section className="admin-main-grid">
            <div className="admin-panel">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">SYSTEM ACTIVITY</p>
                  <h2>Prediction & scan activity</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => setAdminTab("Activity log")}
                >
                  View activity <ArrowUpRight size={14} />
                </button>
              </div>
              <div className="activity-chart">
                <div className="chart-labels">
                  <span>12k</span>
                  <span>8k</span>
                  <span>4k</span>
                  <span>0</span>
                </div>
                <div className="chart-body">
                  <div className="chart-grid">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <svg
                    viewBox="0 0 540 170"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Activity trend chart"
                  >
                    <path
                      d="M0 136 C35 128 43 119 72 126 S110 113 133 119 S161 91 190 105 S220 99 250 108 S278 72 310 85 S348 66 375 82 S402 54 430 67 S465 45 493 52 S520 37 540 42"
                      fill="none"
                      stroke="#4f9566"
                      strokeWidth="3"
                    />
                    <path
                      d="M0 136 C35 128 43 119 72 126 S110 113 133 119 S161 91 190 105 S220 99 250 108 S278 72 310 85 S348 66 375 82 S402 54 430 67 S465 45 493 52 S520 37 540 42 L540 170 L0 170 Z"
                      fill="url(#chartFill)"
                      opacity=".38"
                    />
                    <defs>
                      <linearGradient
                        id="chartFill"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop stopColor="#9bceb0" />
                        <stop offset="1" stopColor="#edf7ed" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="chart-months">
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Aug</span>
                    <span>Sep</span>
                    <span>Oct</span>
                  </div>
                </div>
              </div>
              <p className="responsible-note"><ShieldAlert size={13} /> This is a screening result, not a guaranteed diagnosis. Confirm important treatment decisions with a local agricultural expert.</p>
            </div>
            <div className="admin-panel recent-panel">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">LIVE FEED</p>
                  <h2>Recent registrations</h2>
                </div>
                <button className="dots-button" aria-label="More options">
                  •••
                </button>
              </div>
              <div className="farmer-list">
                <div className="farmer-row">
                  <div className="farmer-mini-avatar peach">KS</div>
                  <div>
                    <strong>Kavitha S.</strong>
                    <span>Thanjavur · 2 min ago</span>
                  </div>
                  <span className="verified">Verified</span>
                </div>
                <div className="farmer-row">
                  <div className="farmer-mini-avatar blue-bg">MP</div>
                  <div>
                    <strong>Murugan P.</strong>
                    <span>Trichy · 18 min ago</span>
                  </div>
                  <span className="verified">Verified</span>
                </div>
                <div className="farmer-row">
                  <div className="farmer-mini-avatar gold">AR</div>
                  <div>
                    <strong>Anitha R.</strong>
                    <span>Madurai · 42 min ago</span>
                  </div>
                  <span className="pending">Pending</span>
                </div>
              </div>
              <button
                className="full-link"
                onClick={() => setAdminTab("Farmers")}
              >
                Manage all farmers <ArrowUpRight size={14} />
              </button>
            </div>
          </section>
          <section className="admin-bottom-grid">
            <div className="admin-panel content-health">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">CONTENT HEALTH</p>
                  <h2>Knowledge base coverage</h2>
                </div>
                <BookOpen size={20} />
              </div>
              <div className="health-row">
                <div className="health-label">
                  <span>Crop information</span>
                  <strong>42 / 50</strong>
                </div>
                <div className="progress-track">
                  <i style={{ width: "84%" }} />
                </div>
              </div>
              <div className="health-row">
                <div className="health-label">
                  <span>Disease advisories</span>
                  <strong>118 / 120</strong>
                </div>
                <div className="progress-track">
                  <i style={{ width: "98%", background: "#6c9f68" }} />
                </div>
              </div>
              <div className="health-row">
                <div className="health-label">
                  <span>Market sources</span>
                  <strong>12 / 12</strong>
                </div>
                <div className="progress-track">
                  <i style={{ width: "100%", background: "#d49b43" }} />
                </div>
              </div>
              <button
                className="full-link"
                onClick={() => setAdminTab("Advisory content")}
              >
                Review content gaps <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="admin-panel quick-panel">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">QUICK ACTIONS</p>
                  <h2>Manage your system</h2>
                </div>
              </div>
              <button onClick={() => setAdminTab("Crop library")}>
                <span>
                  <Sprout size={17} />
                </span>{" "}
                Add crop information <ArrowUpRight size={14} />
              </button>
              <button onClick={() => setAdminTab("Disease library")}>
                <span>
                  <ShieldCheck size={17} />
                </span>{" "}
                Update disease advisory <ArrowUpRight size={14} />
              </button>
              <button onClick={() => setAdminTab("Market updates")}>
                <span>
                  <TrendingUp size={17} />
                </span>{" "}
                Refresh market prices <ArrowUpRight size={14} />
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [farmer, setFarmer] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [language, setLanguage] = useState("EN");
  const [activeTab, setActiveTab] = useState("Overview");
  const [showAlert, setShowAlert] = useState(true);
  const [uploadedFile, setUploadedFile] = useState("");
  const [question, setQuestion] = useState("");
  const [sentQuestion, setSentQuestion] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const [assistantSource, setAssistantSource] = useState("");
  const [role, setRole] = useState("farmer");
  const [voiceListening, setVoiceListening] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [offlineReady, setOfflineReady] = useState(() => Boolean(localStorage.getItem("fieldwise_offline_content")));

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    fetch("/api/offline-content").then((response) => response.ok ? response.json() : null).then((content) => {
      if (content) {
        localStorage.setItem("fieldwise_offline_content", JSON.stringify(content));
        setOfflineReady(true);
      }
    }).catch(() => undefined);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const handleAuthenticated = (profile) => {
    setFarmer(profile);
    setLanguage(profile.preferredLanguage === "Tamil" ? "TA" : "EN");
  };
  if (!farmer && showLanding) return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  if (!farmer) return <AuthScreen onAuthenticated={handleAuthenticated} />;

  const tamil = language === "TA";
  if (role === "admin")
    return (
      <AdminWorkspace
        setLanguage={setLanguage}
        tamil={tamil}
        setRole={setRole}
      />
    );
  if (activeTab === "Farm details")
    return (
      <FarmDetails
        farmer={farmer}
        language={language}
        setLanguage={setLanguage}
        onBack={() => setActiveTab("Overview")}
        onSignOut={async () => {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
          setFarmer(null);
        }}
        onSaved={setFarmer}
      />
    );
  if (activeTab === "Crop advisor")
    return (
      <CropAdvisor
        farmer={farmer}
        language={language}
        setLanguage={setLanguage}
        onNavigate={setActiveTab}
        onSignOut={async () => {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
          setFarmer(null);
        }}
      />
    );
  if (activeTab === "Disease scan")
    return (
      <DiseaseScan
        farmer={farmer}
        language={language}
        setLanguage={setLanguage}
        onNavigate={setActiveTab}
        onSignOut={async () => {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
          setFarmer(null);
        }}
      />
    );
  if (activeTab === "Weather & market")
    return (
      <WeatherMarket
        farmer={farmer}
        language={language}
        setLanguage={setLanguage}
        onNavigate={setActiveTab}
        onSignOut={async () => {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
          setFarmer(null);
        }}
      />
    );
  if (activeTab === "History")
    return (
      <HistoryWorkspace
        farmer={farmer}
        language={language}
        setLanguage={setLanguage}
        onNavigate={setActiveTab}
        onSignOut={async () => {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
          setFarmer(null);
        }}
      />
    );
  if (activeTab === "Offline guide")
    return <OfflineGuide farmer={farmer} language={language} setLanguage={setLanguage} onNavigate={setActiveTab} onSignOut={async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); setFarmer(null); }} />;
  const copy = {
    greeting: tamil ? "வணக்கம், ராஜேஷ்" : "Good morning, Rajesh",
    overview: tamil
      ? "உங்கள் பண்ணையின் இன்றைய பார்வை"
      : "Here’s your farm's outlook for today",
    recommend: tamil ? "பயிர் பரிந்துரை" : "Crop recommendation",
    analyze: tamil
      ? "உங்கள் நிலத்திற்கு ஏற்ற பயிரை கண்டறியுங்கள்"
      : "Find the best crop for your field",
    scan: tamil ? "நோய் கண்டறிதல்" : "Disease detection",
    scanHelp: tamil
      ? "இலையின் புகைப்படத்தை பதிவேற்றவும்"
      : "Upload a leaf photo for an instant health check",
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) setUploadedFile(file.name);
  };

  const handleAsk = async (event) => {
    event.preventDefault();
    if (question.trim()) {
      const askedQuestion = question.trim();
      setSentQuestion(askedQuestion);
      setQuestion("");
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question: askedQuestion, language }),
      });
      const result = await response.json();
      setAssistantAnswer(response.ok ? result.answer : result.error);
      setAssistantSource(response.ok ? result.source : "");
    }
  };

  const toggleVoice = () => {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setAssistantAnswer(
        tamil
          ? "இந்த உலாவியில் குரல் உள்ளீடு கிடைக்கவில்லை."
          : "Voice input is not available in this browser.",
      );
      return;
    }
    if (voiceListening) {
      window.speechRecognition?.stop();
      setVoiceListening(false);
      return;
    }
    const recognition = new Recognition();
    recognition.lang = tamil ? "ta-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setVoiceListening(true);
    recognition.onresult = (event) =>
      setQuestion(event.results[0][0].transcript);
    recognition.onerror = () => setVoiceListening(false);
    recognition.onend = () => setVoiceListening(false);
    window.speechRecognition = recognition;
    recognition.start();
  };

  const speakAnswer = () => {
    if (!assistantAnswer || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(assistantAnswer);
    utterance.lang = tamil ? "ta-IN" : "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="app-shell">
      {!isOnline && <button className="offline-banner" onClick={() => setActiveTab("Offline guide")}><CloudRain size={15} /> {tamil ? "இணைய இணைப்பு இல்லை. சேமிக்கப்பட்ட வழிகாட்டியைத் திறக்கவும்." : `Offline mode · ${offlineReady ? "open saved field guide" : "saved content is not available yet"}.`}</button>}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Sprout size={20} />
          </span>
          <span>
            Fieldwise<span className="brand-dot">.</span>
          </span>
        </div>
        <div className="profile-card">
          <div className="avatar">
            {farmer.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <strong>{farmer.name}</strong>
            <span>Smallholder farmer</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <nav className="nav-list" aria-label="Main navigation">
          {[
            ["Overview", Flower2, tamil ? "முகப்பு" : "Overview"],
            [
              "Farm details",
              ClipboardList,
              tamil ? "பண்ணை விவரங்கள்" : "Farm details",
            ],
            ["Crop advisor", Sprout, tamil ? "பயிர் ஆலோசனை" : "Crop advisor"],
            ["Disease scan", Camera, tamil ? "நோய் பரிசோதனை" : "Disease scan"],
            [
              "Weather & market",
              CloudRain,
              tamil ? "வானிலை மற்றும் சந்தை" : "Weather & market",
            ],
            ["History", ClipboardList, tamil ? "முந்தைய பதிவுகள்" : "History"],
          ].map(([item, Icon, label]) => {
            return (
              <button
                key={item}
                className={activeTab === item ? "nav-item active" : "nav-item"}
                onClick={() => setActiveTab(item)}
              >
                <Icon size={18} />
                <span>{label}</span>
                {item === "Disease scan" && (
                  <span className="new-pill">NEW</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <MessageCircle size={18} />
            </div>
            <strong>Need help?</strong>
            <span>Ask our farm assistant</span>
            <button onClick={() => setActiveTab("Assistant")}>
              Open assistant <ArrowUpRight size={14} />
            </button>
          </div>
          <button className="settings-link">
            <span>◌</span> Settings
          </button>
          <button
            className="logout-link"
            onClick={async () => {
              await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
              });
              setFarmer(null);
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>{activeTab}</strong>
          </div>
          <div className="top-actions">
            <button className="role-switch" onClick={() => setRole("admin")}>
              <ShieldCheck size={14} /> Admin view
            </button>
            <div className="location">
              <MapPin size={16} />
              <span>Thanjavur, TN</span>
              <ChevronDown size={14} />
            </div>
            <button className="icon-button" aria-label="Search">
              <Search size={18} />
            </button>
            <button
              className="icon-button notification"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>
            <div className="language-toggle">
              <button
                className={!tamil ? "selected" : ""}
                onClick={() => setLanguage("EN")}
              >
                EN
              </button>
              <button
                className={tamil ? "selected" : ""}
                onClick={() => setLanguage("TA")}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">
                MONDAY, 14 OCTOBER 2024 <span className="live-dot" /> LIVE FARM
                DATA
              </p>
              <h1>{copy.greeting}</h1>
              <p className="subheading">{copy.overview}</p>
            </div>
            <button
              className="primary-button"
              onClick={() => setActiveTab("Crop advisor")}
            >
              <Sprout size={17} />{" "}
              {tamil ? "பயிர் பரிந்துரை" : "Get crop advice"}{" "}
              <ArrowUpRight size={16} />
            </button>
          </section>

          {showAlert && (
            <div className="alert-banner">
              <div className="alert-symbol">
                <AlertTriangle size={19} />
              </div>
              <div>
                <strong>
                  {tamil
                    ? "நாளை கனமழை எதிர்பார்க்கப்படுகிறது"
                    : "Heavy rain expected tomorrow"}
                </strong>
                <span>
                  {tamil
                    ? "தஞ்சாவூரில் 42mm மழை. உரமிடுவதைத் தாமதிக்கவும்."
                    : "Rainfall of 42mm is forecast for Thanjavur. Consider postponing fertilizer application."}
                </span>
              </div>
              <button
                className="alert-action"
                onClick={() => setActiveTab("Weather & market")}
              >
                {tamil ? "வானிலையைப் பார்க்கவும்" : "View weather"}{" "}
                <ArrowUpRight size={14} />
              </button>
              <button
                className="close-alert"
                onClick={() => setShowAlert(false)}
                aria-label="Dismiss alert"
              >
                <X size={17} />
              </button>
            </div>
          )}

          <section className="stats-grid">
            <div className="stat-card weather-card">
              <div className="stat-top">
                <span>{tamil ? "இன்றைய வானிலை" : "Today’s weather"}</span>
                <Sun size={18} />
              </div>
              <div className="weather-value">
                <strong>29°</strong>
                <div>
                  <b>{tamil ? "சிறிது மேகமூட்டம்" : "Partly cloudy"}</b>
                  <span>{tamil ? "உணர்வு 32°" : "Feels like 32°"}</span>
                </div>
              </div>
              <div className="stat-meta">
                <span>
                  <Droplets size={14} /> 78% {tamil ? "ஈரப்பதம்" : "humidity"}
                </span>
                <span>
                  <CloudRain size={14} /> 12% {tamil ? "மழை" : "rain"}
                </span>
              </div>
            </div>
            <div className="stat-card soil-card">
              <div className="stat-top">
                <span>{tamil ? "மண் ஆரோக்கியம்" : "Soil health"}</span>
                <span className="status-good">{tamil ? "நன்று" : "Good"}</span>
              </div>
              <div className="score-row">
                <strong>78</strong>
                <span>/ 100</span>
                <div className="score-ring">
                  <div />
                </div>
              </div>
              <p>
                {tamil ? (
                  "நெற்பயிருக்கு NPK சமநிலை நன்றாக உள்ளது"
                ) : (
                  <>
                    NPK balance is healthy for <b>rice</b>
                  </>
                )}
              </p>
              <button
                onClick={() => setActiveTab("Farm details")}
                className="text-button"
              >
                {tamil ? "மண் அறிக்கையைப் பார்க்கவும்" : "View soil report"}{" "}
                <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="stat-card market-card">
              <div className="stat-top">
                <span>{tamil ? "சந்தை கண்காணிப்பு" : "Market watch"}</span>
                <TrendingUp size={18} />
              </div>
              <div className="market-price">
                <strong>₹ 2,180</strong>
                <span className="rise">+3.4%</span>
              </div>
              <p>
                {tamil ? "நெல் · தஞ்சாவூர் சந்தை" : "Rice · Thanjavur mandi"}{" "}
                <span>{tamil ? "இன்று" : "today"}</span>
              </p>
              <button
                onClick={() => setActiveTab("Weather & market")}
                className="text-button"
              >
                {tamil ? "அனைத்து விலைகள்" : "See all prices"}{" "}
                <ArrowUpRight size={14} />
              </button>
            </div>
          </section>

          <section className="work-grid">
            <div className="section-column">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">MAKE A DECISION</p>
                  <h2>What do you need today?</h2>
                </div>
                <button className="dots-button" aria-label="More options">
                  •••
                </button>
              </div>
              <div className="action-grid">
                <button
                  className="action-card crop-action"
                  onClick={() => setActiveTab("Crop advisor")}
                >
                  <span className="action-icon">
                    <Sprout size={22} />
                  </span>
                  <strong>{copy.recommend}</strong>
                  <span>{copy.analyze}</span>
                  <ArrowUpRight size={17} className="action-arrow" />
                </button>
                <label className="action-card disease-action">
                  <input type="file" accept="image/*" onChange={handleUpload} />
                  <span className="action-icon">
                    <Camera size={22} />
                  </span>
                  <strong>{copy.scan}</strong>
                  <span>
                    {uploadedFile ? `Ready: ${uploadedFile}` : copy.scanHelp}
                  </span>
                  <Upload size={17} className="action-arrow" />
                </label>
              </div>
            </div>

            <div className="assistant-panel">
              <div className="assistant-header">
                <div className="assistant-avatar">
                  <MessageCircle size={19} />
                </div>
                <div>
                  <strong>Ask Fieldwise</strong>
                  <span>Verified agriculture knowledge · Online</span>
                </div>
                <span className="online-dot" />
              </div>
              {sentQuestion ? (
                <div className="assistant-response">
                  <span className="user-bubble">{sentQuestion}</span>
                  <p>{assistantAnswer || "Checking verified guidance..."}</p>
                  {assistantSource && (
                    <small>
                      <ExternalLink size={11} /> {assistantSource}
                    </small>
                  )}
                </div>
              ) : (
                <div className="assistant-prompt">
                  <span>“</span>
                  <p>What should I plant after harvesting my rice?</p>
                </div>
              )}
              <form className="assistant-form" onSubmit={handleAsk}>
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask anything about your farm..."
                  aria-label="Ask the farm assistant"
                />
                <button type="button" className={voiceListening ? "voice-button listening" : "voice-button"} onClick={toggleVoice} aria-label={voiceListening ? "Stop voice input" : "Ask by voice"} title={voiceListening ? "Stop voice input" : "Ask by voice"}>
                  {voiceListening ? <Square size={14} /> : <Mic size={16} />}
                </button>
                <button type="submit" aria-label="Send question">
                  <ArrowUpRight size={17} />
                </button>
              </form>
              {assistantAnswer && <button type="button" className="speak-answer" onClick={speakAnswer}><Volume2 size={13} /> {tamil ? "பதிலை கேளுங்கள்" : "Listen to answer"}</button>}
              <div className="suggestion-row">
                <button
                  type="button"
                  onClick={() => setQuestion("How much water does rice need?")}
                >
                  Rice water needs
                </button>
                <button
                  type="button"
                  onClick={() => setQuestion("Best time to spray?")}
                >
                  Spraying time
                </button>
              </div>
            </div>
          </section>

          <section className="lower-grid">
            <div className="recommendation-panel">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">PERSONALIZED FOR YOU</p>
                  <h2>Top crop recommendations</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => setActiveTab("Crop advisor")}
                >
                  View all <ArrowUpRight size={14} />
                </button>
              </div>
              <div className="crop-list">
                <div className="crop-row">
                  <div className="crop-thumb rice-thumb">
                    <span>🌾</span>
                  </div>
                  <div className="crop-info">
                    <strong>Rice · ADT 45</strong>
                    <span>Excellent fit for your soil and season</span>
                  </div>
                  <div className="fit-score">
                    <strong>94%</strong>
                    <span>match</span>
                  </div>
                  <button
                    className="row-arrow"
                    aria-label="View rice recommendation"
                  >
                    <ArrowUpRight size={16} />
                  </button>
                </div>
                <div className="crop-row">
                  <div className="crop-thumb groundnut-thumb">
                    <span>🥜</span>
                  </div>
                  <div className="crop-info">
                    <strong>Groundnut · TMV 7</strong>
                    <span>Good water efficiency · 110 day cycle</span>
                  </div>
                  <div className="fit-score">
                    <strong>87%</strong>
                    <span>match</span>
                  </div>
                  <button
                    className="row-arrow"
                    aria-label="View groundnut recommendation"
                  >
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="calendar-panel">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">NEXT 7 DAYS</p>
                  <h2>Farm calendar</h2>
                </div>
                <CalendarDays size={20} />
              </div>
              <div className="calendar-item">
                <span className="date-badge">
                  15<span>OCT</span>
                </span>
                <div>
                  <strong>Apply neem spray</strong>
                  <span>Preventive care · Rice</span>
                </div>
                <span className="priority">Due tomorrow</span>
              </div>
              <div className="calendar-item">
                <span className="date-badge muted-date">
                  18<span>OCT</span>
                </span>
                <div>
                  <strong>Check field drainage</strong>
                  <span>After rain inspection</span>
                </div>
              </div>
              <button className="calendar-link">
                Open farm calendar <ArrowUpRight size={14} />
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
