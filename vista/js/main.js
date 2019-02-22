'use strict';

import * as util from './utilidades.js';

window.util = util;

((doc, win) => {

    let menuPrincipal;

    const gestionarClientes = () => {

        util.fetchData('./controlador/fachada.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                clase: 'Cliente', // Nombre de la clase PHP
                accion: 'seleccionar' // Método de la clase
            }
        }).then(data => {
            console.log(data);
            // hacer algo con la información que llega
        }).catch(error => {
            util.mensaje(error, 'No se pudo acceder a clientes');
        });

    }

    let opciones = {
        'menu-ir-a-inicio': () => window.location.href = 'index.html',
        'menu-clientes': gestionarClientes,
        // ...,
        // ...,
        'menu-btnacercade': './vista/html/acercade.html'
    }

    doc.addEventListener('DOMContentLoaded', event => {

        $('#index-menu').cargar('./vista/html/menu.html', (contenedor) => {
            let elementosMenu = $('#menu-principal');
            menuPrincipal = M.Sidenav.init(elementosMenu);

            elementosMenu.addEventListener('click', (e) => {
                // obtener el enlace y el ID del enlace
                let enlace = e.target;
                let idEnlace = enlace.getAttribute('id');

                // si efectivamente es un enlace y tiene nombre ejecutar algo...
                if (enlace.nodeName.toLowerCase() === 'a' && idEnlace) {
                    util.gestionarOpciones(opciones, idEnlace);
                }
                e.preventDefault();
            }, false);
        });

    });

})(document, window);