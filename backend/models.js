// Esquemas de MongoDB (Mongoose): definen qué datos guarda cada colección.
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const Curso = model('Curso', new Schema({
  titulo: { type: String, required: [true, 'El curso necesita un título.'], trim: true },
  nivel: { type: String, default: 'Básico' },
  descripcion: { type: String, default: '' },
  enlace: { type: String, default: '' }
}, { timestamps: true }));

export const Mentora = model('Mentora', new Schema({
  nombre: { type: String, required: [true, 'La mentora necesita un nombre.'], trim: true },
  especialidad: { type: String, default: '' },
  descripcion: { type: String, default: '' }
}, { timestamps: true }));

// Mensajes del formulario de contacto
export const Contacto = model('Contacto', new Schema({
  nombre: { type: String, required: [true, 'Escribe tu nombre.'], trim: true, maxlength: 80 },
  correo: { type: String, required: [true, 'Escribe tu correo.'], trim: true, match: [/^\S+@\S+\.\S+$/, 'El correo no es válido.'] },
  mensaje: { type: String, required: [true, 'Escribe tu mensaje.'], trim: true, maxlength: [1000, 'El mensaje es muy largo.'] }
}, { timestamps: true }));

// Cuentas de usuarias. Nunca se guarda la contraseña: solo su "hash" (huella cifrada) y la sal.
export const Usuaria = model('Usuaria', new Schema({
  correo: { type: String, required: [true, 'Escribe tu correo.'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'El correo no es válido.'] },
  hash: { type: String, required: true },
  sal: { type: String, required: true }
}, { timestamps: true }));

// Ingresos y gastos de cada usuaria (solo ella los puede ver)
export const Movimiento = model('Movimiento', new Schema({
  usuaria: { type: Schema.Types.ObjectId, ref: 'Usuaria', required: true, index: true },
  tipo: { type: String, enum: { values: ['ingreso', 'gasto'], message: 'El tipo debe ser ingreso o gasto.' }, required: true },
  concepto: { type: String, required: [true, 'Escribe el concepto.'], trim: true, maxlength: 120 },
  monto: { type: Number, required: [true, 'Escribe el monto.'], min: [0, 'El monto no puede ser negativo.'] },
  fecha: { type: String, required: [true, 'Escribe la fecha.'], match: [/^\d{4}-\d{2}-\d{2}$/, 'La fecha no es válida.'] },
  ambito: { type: String, enum: ['emprendimiento', 'personal'], default: 'emprendimiento' }
}, { timestamps: true }));

// Inscripción de una usuaria a un curso de la Academia (una sola vez por curso)
const esquemaInscripcion = new Schema({
  usuaria: { type: Schema.Types.ObjectId, ref: 'Usuaria', required: true },
  curso: { type: Schema.Types.ObjectId, ref: 'Curso', required: true }
}, { timestamps: true });
esquemaInscripcion.index({ usuaria: 1, curso: 1 }, { unique: true }); // evita inscribirse dos veces
export const Inscripcion = model('Inscripcion', esquemaInscripcion);
