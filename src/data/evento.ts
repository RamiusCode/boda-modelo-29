// src/data/evento.ts
// Datos de la pareja, en un solo lugar. La portada los lee de acá: para
// armar la muestra de otra pareja alcanza con cambiar este archivo (y el
// monograma en /public/imagenes).
//
// Invitación de MUESTRA para clientes: pareja y datos ficticios.

export const evento = {
    // Se muestran en este orden: "Alejandro & Valentina"
    nombre1: "Alejandro",
    nombre2: "Valentina",
    // Monograma blanco sobre transparente: se usa en el sello de cera y
    // en la tarjeta, y se tiñe por CSS donde hace falta otro color.
    monograma: "/imagenes/av.png",
    iniciales: "AV",
    anuncio: "¡ Nos Casamos !",
    fechaCorta: "16 · 10 · 2027",
    fechaLarga: "Sábado 16 de octubre de 2027",
};

export const tituloPagina = `${evento.nombre1} & ${evento.nombre2} | 16 de Octubre 2027`;
