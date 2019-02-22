'use strict';

var verLog = true;

/**
 * Muestra un mensaje de error por consola y al usuario
 * @param {String} mensajeLog el mensaje que aparece por consola
 * @param {String} mensajeUsuario el mensaje que se da al usuario. Si se omite se utiliza mensajeLog
 * @param {boolean} depurar activa o desactiva la visualización por consolas
 */
export const mensaje = (mensajeLog, mensajeUsuario = mensajeLog, depurar = verLog) => {
    if (depurar) {
        console.error(mensajeLog);
    }
    M.toast({
        html: mensajeUsuario,
        classes: 'red darken-4'
    })
}

/**
 * Ejecuta una acción de la aplicación con base a una opción indicada como argumento
 * Normalmente la opción corresponderá al nombre de una página que debe cargarse
 * @param {string} opcion un ID de las opciones del menú 
 */
export let gestionarOpciones = (opciones, opcion) => {

    if (opcion === 'opc-salir') {
        window.location.href = 'index.html'
    } else {
        if (opcion in opciones) {
            if (typeof opciones[opcion] === 'function') {
                opciones[opcion]();
            } else {
                $('#index-contenedor').cargar(opciones[opcion], function(contenedor) {
                    if (status === "error") {
                        let log = `Error '${xhr.status}': '${xhr.statusText}'. Sucedió en main.gestionar(), opción '${opcion}' al cargar '${opciones[opcion]}'`;
                        mensaje(log, 'No se pudo acceder a la opción');
                    }
                });
            }
        } else {
            let log = `La opción con ID '${opcion}' no está referenciada en el objeto opciones de la función 'gestionar(opcion)'`;
            mensaje(log, 'La opción no está disponible');
        }
    }
}

/**
 * permite obtener una promesa con recursos de forma asíncrona por el canal HTTP
 * @param {String} url La dirección a la que se envía la petición.
 * @param {Object} data Opcional. Un objeto para enviar argumentos.
 */
export async function fetchData(url, data = {}) {
    if (!('method' in data)) {
        data.method = 'POST';
    }

    if (!('headers' in data)) {
        data.headers = {
            'Content-Type': 'application/json'
        };
    }

    if ('body' in data) {
        data.body = JSON.stringify(data.body);
    }

    const respuesta = await fetch(url, data);

    console.log(respuesta);


    if (!respuesta.ok) {
        throw new Error(`Error al cargar ${url}: ${respuesta.status} - ${respuesta.statusText}`); // <<<<<<<<<<<<<<<<<<<<<<<<
    }

    return await respuesta.json();
}