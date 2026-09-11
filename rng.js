// rng.js - Sistema de Probabilidades y Pity

export const RAREZAS = [
  { id: "comun", nombre: "Común", color: "#9ca3af", icono: "⚪", prob: 60, recompensaDuplicado: 10 },
  { id: "poco_comun", nombre: "Poco Común", color: "#22c55e", icono: "🟢", prob: 25, recompensaDuplicado: 25 },
  { id: "raro", nombre: "Raro", color: "#3b82f6", icono: "🔵", prob: 10, recompensaDuplicado: 50 },
  { id: "epico", nombre: "Épico", color: "#a855f7", icono: "🟣", prob: 3.5, recompensaDuplicado: 100 },
  { id: "legendario", nombre: "Legendario", color: "#eab308", icono: "🟡", prob: 1.0, recompensaDuplicado: 250 },
  { id: "mitico", nombre: "Mítico", color: "#ef4444", icono: "🔴", prob: 0.4, recompensaDuplicado: 500 },
  { id: "secreto", nombre: "Secreto", color: "#f43f5e", icono: "🔥", prob: 0.1, recompensaDuplicado: 1000 }
];

export function calcularRareza(pityEpico, pityLegendario, usaPocion = false) {
  if (pityLegendario >= 89) return RAREZAS.find(r => r.id === "legendario");
  if (pityEpico >= 34) return RAREZAS.find(r => r.id === "epico");

  let rng = Math.random() * 100;
  if (usaPocion) rng = Math.max(0, rng - 12);

  let acumulado = 0;
  const orden = ["secreto", "mitico", "legendario", "epico", "raro", "poco_comun", "comun"];
  for (const id of orden) {
    const rareza = RAREZAS.find(r => r.id === id);
    acumulado += rareza.prob;
    if (rng <= acumulado) return rareza;
  }

  return RAREZAS[0];
}

export function seleccionarSticker(rareza, catalogoStickers) {
  const disponibles = catalogoStickers.filter(s => s.rareza === rareza.id);
  if (disponibles.length === 0) {
    return catalogoStickers[Math.floor(Math.random() * catalogoStickers.length)];
  }
  return disponibles[Math.floor(Math.random() * disponibles.length)];
}