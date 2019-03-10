'use strict';

import * as util from './utilidades.js';

window.util = util;

((doc, win) => {

    let menuPrincipal;

    // --- la siguiente asignación de usuario se hará más adelante por autenticación----
    // --- por ahora, debe asignarse uno arbitrariamente, pero existente en la bd.
    util.usuario.id = '001';
    util.usuario.nombre = 'Jorge Pérez';
    util.usuario.perfil = 'Administrador';
    // ---------------------------------------------------------------------------------

    let opciones = {
        'menu-ir-a-inicio': () => window.location.href = 'index.html',
        'menu-clientes': './vista/html/clientes.html',
        'menu-productos': './vista/html/productos.html',
        'menu-ventas': './vista/html/ventas.html',
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