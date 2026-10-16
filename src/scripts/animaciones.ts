// src/scripts/animaciones.ts
// Animaciones de entrada compartidas por toda la invitación.
//
// La idea: un solo gesto corto y suave por sección, con todo entrando a la
// vez. El invitado sigue bajando mientras mira, no espera a que termine nada,
// así que nada puede tardar más de un segundo ni depender de varias etapas
// encadenadas.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
   toggleActions = onEnter | onLeave | onEnterBack | onLeaveBack.
   "restart" al entrar bajando la reproduce desde cero cada vez (con "play",
   una vez completada, volver a entrar no hacía nada). "reset" al salir por
   arriba la deja escondida, lista para la próxima bajada. Al volver desde
   abajo se deja como está, para no interrumpir la lectura de quien sube.
*/
const ACCIONES = "restart none none reset";

// sine.out frena parejo hasta detenerse: es el más calmo de la familia,
// sin el tirón inicial de los power.
const SUAVE = "sine.out";

// Para lo que se acerca: arranca con algo de impulso y se posa despacio.
const POSAR = "power3.out";

// Arranca apenas la sección asoma por abajo, así el gesto se completa
// mientras todavía está entrando en pantalla y no después.
const ARRANQUE = "top 92%";

const DURACION = 0.95;

const menosMovimiento = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Entrada genérica: los elementos aparecen subiendo apenas y saliendo de un
 * desenfoque leve. El escalonado por defecto es corto a propósito: alcanza
 * para que no entren como un bloque plano, sin obligar a esperar.
 *
 * `x` desplaza la entrada en horizontal (positivo = entra desde la derecha).
 * Sirve para listas en zigzag, donde cada lado tiene que venir del suyo.
 */
export function animarEntrada(
    elementos: ArrayLike<Element> | Element,
    trigger: Element,
    {
        start = ARRANQUE,
        stagger = 0.12,
        delay = 0,
        x = 0,
        y = 20,
        duration = DURACION,
    } = {},
) {
    const lista = elementos instanceof Element ? [elementos] : Array.from(elementos);
    if (lista.length === 0) return;

    const scrollTrigger = { trigger, start, toggleActions: ACCIONES };

    if (menosMovimiento()) {
        gsap.fromTo(
            lista,
            { opacity: 0 },
            { opacity: 1, duration: 0.5, delay, ease: "power1.out", scrollTrigger },
        );
        return;
    }

    gsap.fromTo(
        lista,
        { opacity: 0, x, y, scale: 0.97, filter: "blur(6px)" },
        {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration,
            stagger,
            delay,
            ease: POSAR,
            scrollTrigger,
            clearProps: "filter",
        },
    );
}

/**
 * Entrada de las franjas vino: la banda se abre apenas a lo alto desde su
 * centro mientras el texto asoma, todo en el mismo instante.
 *
 * La franja tiene que estar armada así:
 *   <section class="franja relative overflow-hidden ...">   ← sin bg-vino
 *       <div class="franja-fondo absolute inset-0 bg-vino"></div>
 *       <... class="franja-texto relative ...">
 *   </section>
 */
export function animarFranja(seccion: HTMLElement) {
    const fondo = seccion.querySelector<HTMLElement>(".franja-fondo");
    if (!fondo) return;

    const lineas = lineasDe(seccion);
    const scrollTrigger = { trigger: seccion, start: ARRANQUE, toggleActions: ACCIONES };

    if (menosMovimiento()) {
        gsap.fromTo(
            [fondo, ...lineas],
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: "power1.out", scrollTrigger },
        );
        return;
    }

    const filetes = Array.from(fondo.querySelectorAll<HTMLElement>(".franja-filete"));
    const brillo = brilloDe(fondo);

    const entrada = gsap.timeline({ scrollTrigger });

    // La banda aparece con un fundido lento, sin crecer ni moverse
    entrada.fromTo(
        fondo,
        { opacity: 0 },
        { opacity: 1, duration: 1.1, ease: "sine.inOut" },
        0,
    );

    // Las ondas se deslizan apenas desde los costados mientras aparecen:
    // la de arriba desde la izquierda y la de abajo desde la derecha
    filetes.forEach((filete, i) => {
        entrada.fromTo(
            filete,
            { opacity: 0, x: i % 2 ? 18 : -18 },
            { opacity: 1, x: 0, duration: 1.4, ease: "sine.out" },
            0.3,
        );
    });

    // El texto sube un poco y sale del desenfoque
    entrada.fromTo(
        lineas,
        { opacity: 0, y: 10, filter: "blur(6px)" },
        {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.1,
            stagger: 0.1,
            ease: SUAVE,
            clearProps: "filter",
        },
        0.35,
    );

    // Un brillo muy tenue cruza la banda una sola vez
    entrada.fromTo(
        brillo,
        // De -40% a +104% del ancho de la banda: entra y sale entero
        { xPercent: 0 },
        { xPercent: 480, duration: 1.8, ease: "sine.inOut" },
        0.6,
    );
}

/*
   El brillo se crea acá y no en cada franja: es un adorno de la animación,
   no del diseño. Va dentro del fondo, así queda recortado por la banda.
*/
function brilloDe(fondo: HTMLElement): HTMLElement {
    let brillo = fondo.querySelector<HTMLElement>(".franja-brillo");
    if (!brillo) {
        brillo = document.createElement("span");
        brillo.className = "franja-brillo";
        brillo.setAttribute("aria-hidden", "true");
        fondo.appendChild(brillo);
    }
    return brillo;
}

/*
   Cada renglón entra por su cuenta. Cuando el .franja-texto ya viene partido
   en <span> (las frases largas lo están, para poder cortarlas a mano) se
   animan esos; si no, el elemento entero cuenta como un renglón.
*/
function lineasDe(seccion: HTMLElement): HTMLElement[] {
    const lineas: HTMLElement[] = [];

    seccion.querySelectorAll<HTMLElement>(".franja-texto").forEach((contenedor) => {
        const spans = contenedor.querySelectorAll<HTMLElement>(":scope > span");
        if (spans.length > 0) lineas.push(...spans);
        else lineas.push(contenedor);
    });

    return lineas;
}
