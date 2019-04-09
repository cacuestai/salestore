'use strict';

import * as util from './utilidades.js';
import { Usuario } from './usuario.js';
import { MaterialDialog } from '../libs/material-dialog.js';

window.util = util;
window.MaterialDialog = MaterialDialog;

((doc, win) => {

    let menuPrincipal;
    let formAutenticacion; // objeto que referencia al formulario de autenticación
    const usuario = new Usuario();

    // cada clave de las propiedades de este objeto, está asociada a un elemento de lista en menu.html y
    // cada valor asociado a una clave corresponde a una página que debe cargarse o a una función que 
    // debe ejecutarse en las instrucciones de la función util.gestionarOpciones()
    let opciones = {
        'menu-ir-a-inicio': () => window.location.href = 'index.html',
        'menu-bajas': './vista/html/bajas-productos.html',
        'menu-btnacercade': './vista/html/acercade.html',
        'menu-categorias': './vista/html/categorias-productos.html',
        'menu-clientes': './vista/html/clientes.html',
        'menu-compras': './vista/html/compras.html',
        'menu-devolucion_compra': './vista/html/devoluciones-compras.html',
        'menu-devolucion_venta': './vista/html/devoluciones-ventas.html',
        'menu-pago-clientes': './vista/html/pagos-clientes.html',
        'menu-pago-proveedores': './vista/html/pagos-proveedores.html',
        'menu-personal': './vista/html/personal.html',
        'menu-presentaciones': './vista/html/presentaciones-productos.html',
        'menu-productos': './vista/html/productos.html',
        'menu-proveedores': './vista/html/proveedores.html',
        'menu-ventas': './vista/html/ventas.html'
    }

    doc.addEventListener('DOMContentLoaded', event => {

        // se carga la página de autenticación de usuarios
        $('#index-contenedor').cargar('./vista/html/autenticacion.html', (contenedor) => {
            // se crea un diálogo modal con la página cargada
            formAutenticacion = M.Modal.init($('#modal-autenticacion'), {
                dismissible: false, // impedir el acceso a la aplicación durante la autenticación
                onOpenStart: () => {
                    util.validarCaptcha();
                }
            });

            $('#login_btnautenticar').addEventListener('click', e => {
                usuario.validar(cargarMenu);
            });

            formAutenticacion.open();
        });

    });

    function cargarMenu() {
        // el usuario se autenticó, entonces se carga el menú de acuerdo a su perfil
        let paginaMenu = '';
        if (util.usuario.perfil === 'Administrador') {
            paginaMenu = './vista/html/menu-administrador.html';
        } else {
            paginaMenu = './vista/html/menu-vendedor.html';
        }

        $('#index-menu').cargar(paginaMenu, contenedor => {

            var elems = document.querySelectorAll('.dropdown-trigger');
            var instance = M.Dropdown.init(elems, {
                belowOrigin: true
            });

            var elems1 = document.querySelectorAll('.collapsible');
            var instances1 = M.Collapsible.init(elems1, {});

            let elementosMenu = $('#menu-principal');
            let instances = M.Sidenav.init(elementosMenu);

            elementosMenu.addEventListener('click', e => {
                // obtener el enlace y el ID del enlace
                let enlace = e.target;
                let idEnlace = enlace.getAttribute('id');

                // si efectivamente es un enlace y tiene nombre ejecutar algo...
                if (enlace.nodeName.toLowerCase() === 'a' && idEnlace) {
                    util.gestionarOpciones(opciones, idEnlace);
                }
                e.preventDefault();
            }, false);

            if (typeof formAutenticacion === 'object') {
                formAutenticacion.close();
            }
        });
    }

})(document, window);