// stickers.js - Catálogo oficial con exactamente 72 stickers distribuidos por rareza

const nombresAmigos = ["Juan", "Carlos", "María", "David", "Santi", "Alex", "Dani", "Lucia", "Mateo", "Sofía", "Nico", "Elena"];

function generarStickers() {
  const lista = [];
  let id = 1;

  // 1. Comunes (35)
  for (let i = 1; i <= 35; i++) {
    const amigo = nombresAmigos[i % nombresAmigos.length];
    lista.push({
      id: id++,
      nombre: `${amigo} #${i}`,
      rareza: "comun",
      imagen: `/stickers/sticker_${i}.png`
    });
  }

  // 2. Poco Común (20)
  for (let i = 1; i <= 20; i++) {
    const amigo = nombresAmigos[(i + 2) % nombresAmigos.length];
    lista.push({
      id: id++,
      nombre: `${amigo} Gamer #${i}`,
      rareza: "poco_comun",
      imagen: `/stickers/sticker_${i + 35}.png`
    });
  }

  // 3. Raros (10)
  for (let i = 1; i <= 10; i++) {
    const amigo = nombresAmigos[(i + 4) % nombresAmigos.length];
    lista.push({
      id: id++,
      nombre: `${amigo} Riendo #${i}`,
      rareza: "raro",
      imagen: `/stickers/sticker_${i + 55}.png`
    });
  }

  // 4. Épicos (4)
  const epicos = ["Santi Modo Furia", "María Tryhard", "David Sin Dormir", "Carlos AFK"];
  epicos.forEach((nom) => {
    lista.push({ id: id++, nombre: nom, rareza: "epico", imagen: `/stickers/epico_${id}.png` });
  });

  // 5. Legendarios (2)
  lista.push({ id: id++, nombre: "Alex El Elegante", rareza: "legendario", imagen: "/stickers/alex_legendario.png" });
  lista.push({ id: id++, nombre: "Juan Rey del Delay", rareza: "legendario", imagen: "/stickers/juan_legendario.png" });

  // 6. Mítico (1)
  lista.push({ id: id++, nombre: "El Grupo Completo", rareza: "mitico", imagen: "/stickers/grupo_mitico.png" });

  // 7. Secreto (1)
  lista.push({ id: id++, nombre: "🔥 El Meme Prohibido 🔥", rareza: "secreto", imagen: "/stickers/meme_secreto.png" });

  return lista;
}

export const STICKERS = generarStickers();