// src/data/pases.ts
// Única función que arma los textos que dependen de la cantidad de pases.
// La usa Pases.astro; cualquier otra frase con el número tiene que salir
// de acá y no repetirse en otro archivo.

export function textoPases(pases: number) {
    return pases === 1
        ? { rotulo: "Pase", frase: ["Hemos reservado", "un lugar especial para ti"] }
        : { rotulo: "Pases", frase: ["Hemos reservado", `${pases} lugares especiales para ustedes`] };
}
