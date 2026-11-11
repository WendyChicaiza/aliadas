// Servidor de ALIADAS: chat con IA (Gemini), catálogo y contacto con MongoDB.
// Las llaves viven solo en backend/.env (nunca en GitHub ni en el frontend).
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';
import { Curso, Mentora, Contacto, Usuaria, Movimiento, Inscripcion } from './models.js';

const app = express();
const PORT = process.env.PORT || 3001;
// Si el primer modelo falla, se prueban los siguientes automáticamente.
// Modelos de respaldo; además se piden a Google los que tu llave realmente tiene disponibles.
const BASE = [process.env.GEMINI_MODEL, 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'].filter(Boolean);
let MODELOS = [...new Set(BASE)];

async function descubrirModelos() {
  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', {
      headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY }
    });
    if (!r.ok) return;
    const d = await r.json();
    const utiles = (d.models || [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => m.name.replace('models/', ''))
      .filter((n) => /flash/.test(n) && !/(image|tts|live|audio|thinking|embedding|robotics|computer)/.test(n))
      .sort()
      .reverse(); // los números más altos (más nuevos) primero
    MODELOS = [...new Set([...utiles.slice(0, 4), ...BASE])];
    console.log('Modelos de Gemini a probar:', MODELOS.join(', '));
  } catch (e) {
    console.error('No pude listar modelos:', e.message);
  }
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json({ limit: '50kb' }));

const hayDB = () => mongoose.connection.readyState === 1;

// ---------- Datos: MongoDB si está conectado; si no, los JSON de public/ ----------
async function leerJson(nombre) {
  try {
    return JSON.parse(await readFile(path.join(__dirname, '..', 'public', nombre), 'utf8'));
  } catch {
    return [];
  }
}
// El frontend usa "id": en MongoDB viene como _id, así que lo copiamos.
const conId = (docs) => docs.map((d) => ({ ...d, id: String(d._id ?? d.id) }));
const obtenerCursos = async () => conId(hayDB() ? await Curso.find().lean() : await leerJson('cursos.json'));
const obtenerMentoras = async () => conId(hayDB() ? await Mentora.find().lean() : await leerJson('mentoras.json'));

async function conectarDB() {
  if (!process.env.MONGODB_URI) {
    console.log('Sin MONGODB_URI: se usan los archivos JSON de public/');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    // Carga inicial: si las colecciones están vacías, se llenan con los JSON de ejemplo
    if ((await Curso.countDocuments()) === 0) {
      await Curso.insertMany((await leerJson('cursos.json')).map(({ titulo, nivel, descripcion }) => ({ titulo, nivel, descripcion })));
    }
    if ((await Mentora.countDocuments()) === 0) {
      await Mentora.insertMany((await leerJson('mentoras.json')).map(({ nombre, especialidad, descripcion }) => ({ nombre, especialidad, descripcion })));
    }
  } catch (e) {
    console.error('No se pudo conectar a MongoDB:', e.message);
  }
}

// ---------- IA ----------
async function construirInstrucciones() {
  const cursos = await obtenerCursos();
  const mentoras = await obtenerMentoras();
  return `Eres el asistente de ALIADAS, una plataforma digital de educación financiera y mentoría para mujeres que comienzan un emprendimiento.
Tono: cálido, empático y claro, como una amiga que sabe de finanzas. Tutea, evita tecnicismos y responde en español, en máximo 120 palabras.
Módulos de la app: Inicio, Mis finanzas (ingresos, gastos, ganancia), Academia, Comunidad y Mi crecimiento.
Cursos disponibles:
${cursos.map((c) => `- ${c.titulo} (${c.nivel}): ${c.descripcion}`).join('\n')}
Mentoras:
${mentoras.map((m) => `- ${m.nombre}: ${m.especialidad}`).join('\n')}
Reglas: usa solo esta información sobre ALIADAS; si no sabes algo, dilo y sugiere escribir a wendyestefi1999@gmail.com.
ALIADAS todavía NO otorga créditos: es una visión futura. No prometas financiamiento ni des asesoría legal.
Si te lo piden, redacta textos listos (publicaciones para redes, mensajes para clientas) con este mismo tono.`;
}

// Prueba los modelos en orden. Devuelve { texto, modelo } o { fallos } con el motivo de cada fallo.
async function preguntarIA(contents, instrucciones) {
  const fallos = [];
  for (const modelo of MODELOS) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: instrucciones }] },
          contents,
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
        })
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        const texto = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('');
        if (texto) return { texto, modelo };
        fallos.push(`${modelo}: respuesta vacía`);
        continue;
      }
      fallos.push(`${modelo}: ${r.status} ${data.error?.message || ''}`.trim());
      if (r.status === 401 || r.status === 403) break; // llave mala: probar otros modelos no sirve
    } catch (e) {
      fallos.push(`${modelo}: sin conexión (${e.message})`);
    }
  }
  return { fallos };
}

app.get('/api/salud', (_req, res) => res.json({ ok: true, mongo: hayDB() }));

// Revisa todo de una vez: abre http://localhost:3001/api/diagnostico en el navegador
app.get('/api/diagnostico', async (_req, res) => {
  const out = { llaveConfigurada: Boolean(process.env.GEMINI_API_KEY), modelos: MODELOS, mongo: hayDB() };
  if (out.llaveConfigurada) {
    const r = await preguntarIA([{ role: 'user', parts: [{ text: 'Responde solo: ok' }] }], 'Responde brevemente.');
    out.gemini = r.texto ? { ok: true, modeloQueFunciona: r.modelo } : { ok: false, fallos: r.fallos };
  }
  res.json(out);
});

app.post('/api/chat', async (req, res) => {
  const { mensajes } = req.body;
  if (!Array.isArray(mensajes) || mensajes.length === 0) {
    return res.status(400).json({ error: 'Escribe un mensaje.' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Falta GEMINI_API_KEY en backend/.env' });
  }
  // Solo los últimos 10 mensajes, recortados; Gemini exige que el primero sea de la usuaria.
  const contents = mensajes.slice(-10).map((m) => ({
    role: m.rol === 'asistente' ? 'model' : 'user',
    parts: [{ text: String(m.texto).slice(0, 1000) }]
  }));
  while (contents.length && contents[0].role === 'model') contents.shift();

  const r = await preguntarIA(contents, await construirInstrucciones());
  if (r.texto) return res.json({ respuesta: r.texto });
  console.error('Fallos de Gemini:', r.fallos);
  const limite = r.fallos.some((f) => f.includes(': 429'));
  res.status(limite ? 429 : 502).json({
    error: limite ? 'Hay muchas consultas ahora. Intenta en un minuto.' : 'La IA no pudo responder.',
    detalle: r.fallos
  });
});

// ---------- Catálogo y contacto ----------
app.get('/api/cursos', async (_req, res) => {
  try { res.json(await obtenerCursos()); } catch (e) { console.error(e); res.status(500).json({ error: 'Error del servidor.' }); }
});
app.get('/api/mentoras', async (_req, res) => {
  try { res.json(await obtenerMentoras()); } catch (e) { console.error(e); res.status(500).json({ error: 'Error del servidor.' }); }
});

// Códigos: 201 creado, 400 datos inválidos, 503 sin base de datos, 500 error del servidor
app.post('/api/contacto', async (req, res) => {
  if (!hayDB()) return res.status(503).json({ error: 'La base de datos aún no está conectada.' });
  try {
    await Contacto.create(req.body);
    res.status(201).json({ ok: true });
  } catch (e) {
    if (e.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(e.errors).map((x) => x.message).join(' ') });
    }
    console.error(e);
    res.status(500).json({ error: 'Error del servidor.' });
  }
});


// ---------- Administradora: login y rutas protegidas ----------
// Las credenciales viven en backend/.env (ADMIN_EMAIL y ADMIN_PASSWORD), nunca en el código.
const SECRETO = process.env.ADMIN_SECRET || crypto.randomBytes(32).toString('hex');
const firmar = (texto) => crypto.createHmac('sha256', SECRETO).update(texto).digest('hex');
const hash = (texto) => crypto.createHash('sha256').update(String(texto)).digest();
const iguales = (a, b) => crypto.timingSafeEqual(hash(a), hash(b)); // comparación segura

// El token es "vencimiento.firma": si alguien lo modifica, la firma ya no coincide.
function crearToken() {
  const vence = String(Date.now() + 2 * 60 * 60 * 1000); // dura 2 horas
  return `${vence}.${firmar(vence)}`;
}
function tokenValido(token) {
  const [vence, firma] = String(token || '').split('.');
  if (!vence || !firma) return false;
  return iguales(firma, firmar(vence)) && Number(vence) > Date.now();
}
function requiereAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!tokenValido(token)) return res.status(401).json({ error: 'Sesión de administradora no válida. Ingresa de nuevo.' });
  next();
}

app.post('/api/admin/login', (req, res) => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'Falta configurar ADMIN_EMAIL y ADMIN_PASSWORD en backend/.env' });
  }
  const { correo, clave } = req.body || {};
  // Se evalúan las dos comparaciones siempre, para no dar pistas de cuál falló.
  const okCorreo = iguales(String(correo || '').trim().toLowerCase(), ADMIN_EMAIL.trim().toLowerCase());
  const okClave = iguales(clave || '', ADMIN_PASSWORD);
  if (!okCorreo || !okClave) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  res.json({ token: crearToken() });
});

const necesitaDB = (_req, res, next) =>
  hayDB() ? next() : res.status(503).json({ error: 'La base de datos aún no está conectada.' });

// Mensajes recibidos por el formulario de contacto
app.get('/api/admin/contactos', requiereAdmin, necesitaDB, async (_req, res) => {
  try { res.json(conId(await Contacto.find().sort({ createdAt: -1 }).lean())); }
  catch (e) { console.error(e); res.status(500).json({ error: 'Error del servidor.' }); }
});
app.delete('/api/admin/contactos/:id', requiereAdmin, necesitaDB, async (req, res) => {
  try {
    const borrado = await Contacto.findByIdAndDelete(req.params.id);
    if (!borrado) return res.status(404).json({ error: 'Mensaje no encontrado.' });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: 'Identificador no válido.' }); }
});

// Usuarias registradas. Nunca se devuelve la contraseña ni su hash.
app.get('/api/admin/usuarias', requiereAdmin, necesitaDB, async (_req, res) => {
  try {
    const usuarias = await Usuaria.find().sort({ createdAt: -1 }).select('correo createdAt').lean();
    const conteos = await Movimiento.aggregate([{ $group: { _id: '$usuaria', total: { $sum: 1 } } }]);
    const porUsuaria = Object.fromEntries(conteos.map((c) => [String(c._id), c.total]));
    // Cursos a los que se inscribió cada usuaria
    const inscripciones = await Inscripcion.find().populate('curso', 'titulo').lean();
    const cursosDe = {};
    for (const i of inscripciones) {
      if (!i.curso) continue; // el curso fue borrado
      (cursosDe[String(i.usuaria)] ||= []).push(i.curso.titulo);
    }
    res.json(usuarias.map((u) => ({
      id: String(u._id), correo: u.correo, createdAt: u.createdAt,
      movimientos: porUsuaria[String(u._id)] || 0,
      cursos: cursosDe[String(u._id)] || []
    })));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Error del servidor.' }); }
});
// Borrar una cuenta también borra sus movimientos.
app.delete('/api/admin/usuarias/:id', requiereAdmin, necesitaDB, async (req, res) => {
  try {
    const borrada = await Usuaria.findByIdAndDelete(req.params.id);
    if (!borrada) return res.status(404).json({ error: 'Usuaria no encontrada.' });
    await Movimiento.deleteMany({ usuaria: req.params.id });
    await Inscripcion.deleteMany({ usuaria: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: 'Identificador no válido.' }); }
});

// CRUD de cursos y mentoras (mismo código para las dos colecciones)
function crud(ruta, Modelo, campos, alBorrar = async () => {}) {
  const limpiar = (b = {}) => Object.fromEntries(campos.filter((c) => b[c] !== undefined).map((c) => [c, b[c]]));
  const manejarError = (e, res) => {
    if (e.name === 'ValidationError') return res.status(400).json({ error: Object.values(e.errors).map((x) => x.message).join(' ') });
    if (e.name === 'CastError') return res.status(400).json({ error: 'Identificador no válido.' });
    console.error(e);
    res.status(500).json({ error: 'Error del servidor.' });
  };
  app.post(ruta, requiereAdmin, necesitaDB, async (req, res) => {
    try { res.status(201).json(await Modelo.create(limpiar(req.body))); } catch (e) { manejarError(e, res); }
  });
  app.put(`${ruta}/:id`, requiereAdmin, necesitaDB, async (req, res) => {
    try {
      const nuevo = await Modelo.findByIdAndUpdate(req.params.id, limpiar(req.body), { new: true, runValidators: true });
      if (!nuevo) return res.status(404).json({ error: 'No encontrado.' });
      res.json(nuevo);
    } catch (e) { manejarError(e, res); }
  });
  app.delete(`${ruta}/:id`, requiereAdmin, necesitaDB, async (req, res) => {
    try {
      const borrado = await Modelo.findByIdAndDelete(req.params.id);
      if (!borrado) return res.status(404).json({ error: 'No encontrado.' });
      await alBorrar(req.params.id);
      res.json({ ok: true });
    } catch (e) { manejarError(e, res); }
  });
}
// Si se borra un curso, también se borran sus inscripciones.
crud('/api/cursos', Curso, ['titulo', 'nivel', 'descripcion', 'enlace'], (id) => Inscripcion.deleteMany({ curso: id }));
crud('/api/mentoras', Mentora, ['nombre', 'especialidad', 'descripcion']);


// ---------- Usuarias: registro, ingreso y sus movimientos ----------
// La contraseña se guarda con scrypt (cifrado de una sola vía) + una sal aleatoria por usuaria.
const cifrar = (clave, sal) => crypto.scryptSync(clave, sal, 64).toString('hex');

// Token de usuaria: "u:<id>:<vencimiento>.<firma>". Dura 30 días.
function crearTokenUsuaria(id) {
  const payload = `u:${id}:${Date.now() + 30 * 24 * 60 * 60 * 1000}`;
  return `${payload}.${firmar(payload)}`;
}
function requiereUsuaria(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const [payload, firma] = token.split('.');
  const [tipo, id, vence] = String(payload || '').split(':');
  if (tipo !== 'u' || !firma || !iguales(firma, firmar(payload)) || Number(vence) < Date.now()) {
    return res.status(401).json({ error: 'Tu sesión venció. Ingresa de nuevo.' });
  }
  req.usuariaId = id;
  next();
}

app.post('/api/usuarias/registro', async (req, res) => {
  if (!hayDB()) return res.status(503).json({ error: 'La base de datos aún no está conectada.' });
  const correo = String(req.body?.correo || '').trim().toLowerCase();
  const clave = String(req.body?.clave || '');
  if (!/^\S+@\S+\.\S+$/.test(correo)) return res.status(400).json({ error: 'Escribe un correo válido.' });
  if (clave.length < 6) return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres.' });
  try {
    const sal = crypto.randomBytes(16).toString('hex');
    const u = await Usuaria.create({ correo, sal, hash: cifrar(clave, sal) });
    res.status(201).json({ token: crearTokenUsuaria(u.id), usuaria: { id: u.id, email: u.correo } });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Ese correo ya tiene cuenta. Toca "Ya tengo cuenta".' });
    console.error(e);
    res.status(500).json({ error: 'Error del servidor.' });
  }
});

app.post('/api/usuarias/ingreso', async (req, res) => {
  if (!hayDB()) return res.status(503).json({ error: 'La base de datos aún no está conectada.' });
  try {
    const correo = String(req.body?.correo || '').trim().toLowerCase();
    const u = await Usuaria.findOne({ correo });
    // Mismo mensaje si el correo no existe o la clave falla: no damos pistas.
    if (!u || !iguales(cifrar(String(req.body?.clave || ''), u.sal), u.hash)) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }
    res.json({ token: crearTokenUsuaria(u.id), usuaria: { id: u.id, email: u.correo } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error del servidor.' });
  }
});

app.get('/api/movimientos', requiereUsuaria, necesitaDB, async (req, res) => {
  try { res.json(conId(await Movimiento.find({ usuaria: req.usuariaId }).sort({ fecha: 1 }).lean())); }
  catch (e) { console.error(e); res.status(500).json({ error: 'Error del servidor.' }); }
});

app.post('/api/movimientos', requiereUsuaria, necesitaDB, async (req, res) => {
  try {
    const { tipo, concepto, monto, fecha, ambito } = req.body || {};
    // La usuaria sale del token, nunca del cuerpo: nadie puede escribir en la cuenta de otra.
    const m = await Movimiento.create({ usuaria: req.usuariaId, tipo, concepto, monto, fecha, ambito });
    res.status(201).json({ ...m.toObject(), id: m.id });
  } catch (e) {
    if (e.name === 'ValidationError') return res.status(400).json({ error: Object.values(e.errors).map((x) => x.message).join(' ') });
    console.error(e);
    res.status(500).json({ error: 'Error del servidor.' });
  }
});

// Inscripciones a cursos de la Academia (de la usuaria que tiene la sesión abierta)
app.get('/api/inscripciones', requiereUsuaria, necesitaDB, async (req, res) => {
  try {
    const mias = await Inscripcion.find({ usuaria: req.usuariaId }).lean();
    res.json(mias.map((i) => String(i.curso))); // lista de ids de cursos
  } catch (e) { console.error(e); res.status(500).json({ error: 'Error del servidor.' }); }
});
app.post('/api/inscripciones', requiereUsuaria, necesitaDB, async (req, res) => {
  try {
    if (!(await Curso.findById(req.body?.curso))) return res.status(404).json({ error: 'Ese curso ya no existe.' });
    await Inscripcion.create({ usuaria: req.usuariaId, curso: req.body.curso });
    res.status(201).json({ ok: true });
  } catch (e) {
    if (e.code === 11000) return res.json({ ok: true }); // ya estaba inscrita
    if (e.name === 'CastError') return res.status(400).json({ error: 'Curso no válido.' });
    console.error(e);
    res.status(500).json({ error: 'Error del servidor.' });
  }
});
app.delete('/api/inscripciones/:curso', requiereUsuaria, necesitaDB, async (req, res) => {
  try {
    await Inscripcion.deleteOne({ usuaria: req.usuariaId, curso: req.params.curso });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: 'Curso no válido.' }); }
});

app.listen(PORT, () => console.log(`Backend de ALIADAS en http://localhost:${PORT}`));
conectarDB();
if (process.env.GEMINI_API_KEY) descubrirModelos();
