// src/scripts/tres-d.ts
// Lo que comparten la portada y "Nombres y flores" para dar profundidad:
// los pétalos que caen en 3D y el seguimiento del mouse / inclinación del
// celular que hace girar la escena.
import { gsap } from "gsap";

export const menosMovimiento = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const COLORES_PETALO = ["#861622", "#a8293a", "#e7bcb7", "#f3e1da", "#d49a95"];

/**
 * Llena `contenedor` con pétalos que caen girando en las tres dimensiones.
 * El contenedor tiene que tener perspectiva (ver .capa-petalos en
 * global.css); cada pétalo arranca a una profundidad distinta, así los de
 * adelante se ven grandes y rápidos y los del fondo chicos y lentos.
 */
export function crearPetalos(contenedor: HTMLElement, cantidad = 14) {
    if (menosMovimiento()) return () => {};

    const ancho = contenedor.clientWidth || 400;
    const alto = contenedor.clientHeight || 800;
    const tweens: gsap.core.Tween[] = [];

    for (let i = 0; i < cantidad; i++) {
        const tam = gsap.utils.random(10, 20);
        const color = COLORES_PETALO[i % COLORES_PETALO.length];
        const petalo = document.createElement("div");
        petalo.className = "petalo";
        petalo.style.width = `${tam}px`;
        petalo.style.height = `${tam * 1.35}px`;
        petalo.innerHTML = `<svg viewBox="0 0 20 28" width="100%" height="100%"><path d="M10 0 C17 6 20 16 10 28 C0 16 3 6 10 0Z" fill="${color}" opacity="0.88"/></svg>`;
        contenedor.appendChild(petalo);

        gsap.set(petalo, {
            x: gsap.utils.random(0, ancho),
            y: -40,
            z: gsap.utils.random(-220, 140),
            rotation: gsap.utils.random(0, 360),
        });

        tweens.push(
            gsap.to(petalo, {
                y: alto + 60,
                x: `+=${gsap.utils.random(-90, 90)}`,
                rotationX: `+=${gsap.utils.random(360, 900)}`,
                rotationY: `+=${gsap.utils.random(180, 720)}`,
                rotation: `+=${gsap.utils.random(-180, 180)}`,
                duration: gsap.utils.random(8, 14),
                delay: gsap.utils.random(0, 9),
                repeat: -1,
                ease: "none",
            }),
        );
    }

    return () => {
        tweens.forEach((t) => t.kill());
        contenedor.innerHTML = "";
    };
}

/**
 * Llama a `alMover(nx, ny)` con la posición del puntero (o la inclinación
 * del celular) normalizada entre -1 y 1. En Android el giroscopio funciona
 * sin pedir permiso; en iPhone se queda con el balanceo suave de cada
 * escena, que no necesita nada.
 */
export function seguirPuntero(alMover: (nx: number, ny: number) => void) {
    const limitar = gsap.utils.clamp(-1, 1);

    const puntero = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        alMover(
            (e.clientX / window.innerWidth) * 2 - 1,
            (e.clientY / window.innerHeight) * 2 - 1,
        );
    };

    const giroscopio = (e: DeviceOrientationEvent) => {
        if (e.gamma == null || e.beta == null) return;
        alMover(limitar(e.gamma / 25), limitar((e.beta - 45) / 25));
    };

    window.addEventListener("pointermove", puntero);
    window.addEventListener("deviceorientation", giroscopio);

    return () => {
        window.removeEventListener("pointermove", puntero);
        window.removeEventListener("deviceorientation", giroscopio);
    };
}
