'use strict';

var verLog = true;
let captcha = false; // si se coloca en true hace validación de captcha

export let usuario = {}; // se llena con los datos del usuario autenticado
export const URL = './controlador/fachada.php';

export let setUsuario = usuario => {
    util.usuario.id_persona = usuario.id_persona;
    util.usuario.nombre = usuario.nombre;
    util.usuario.perfil = usuario.perfil;
}

/**
 * Muestra un mensaje de error por consola y al usuario
 * @param {String} mensajeLog el mensaje que aparece por consola
 * @param {String} mensajeUsuario el mensaje que se da al usuario. Si se omite se utiliza mensajeLog
 * @param {String} clasesCSS las clases que se aplicarán al aviso
 * @param {boolean} depurar activa o desactiva la visualización por consolas
 */
export const mensaje = (mensajeLog, mensajeUsuario = mensajeLog, clasesCSS = 'red darken-4', depurar = verLog) => {
    mensajeLog = String(mensajeLog); // hacer un cast del log, por si las moscas...
    if (depurar && mensajeLog) {
        console.error(mensajeLog);
    }

    M.toast({
        html: mensajeUsuario,
        classes: clasesCSS
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

    if (!respuesta.ok) {
        throw new Error(`Error al cargar ${url}: ${respuesta.status} - ${respuesta.statusText}`); // <<<<<<<<<<<<<<<<<<<<<<<<
    }

    return await respuesta.json();
}

/**
 * Crea los elementos de una lista seleccionable a partir de un array de objetos
 * @param {String} listaSeleccionable el '#nombre' de la lista seleccionable
 * @param {Array} elementos Un array de objetos con cualquier número de propiedades
 * @param {String} clave Nombre de la propiedad de los objetos que se usará como 'value' en la lista
 * @param {String} valor Nombre de la propiedad de los objetos que se mostrará en la lista
 */
export let crearLista = (listaSeleccionable, elementos, clave, valor, primerItem = false) => {
    let select = $(listaSeleccionable);
    select.innerHTML = '';
    let opciones;

    if (primerItem) {
        if (elementos.length === 0) {
            opciones = `<option value="" disabled selected>Sin elementos</option>`;
        } else {
            opciones = `<option value="" disabled selected>${primerItem}</option>`;
        }
    }

    elementos.forEach((item) => {
        opciones += `<option value="${item[clave]}">${item[valor]}</option>`;
    });

    select.innerHTML = opciones;
    M.FormSelect.init($(listaSeleccionable));
}

/**
 * Crea los elementos de una lista seleccionable a partir de un array de objetos solicitado al back-end
 * @param {Object} opciones Un array de objetos cuyas propiedades deben incluir:
 *  clase: el nombre de la clase PHP de donde se recupera el array de objetos
 *  accion: el nombre del método que devuelve el array de objetos
 *  listaSeleccionable: el nombre de la lista donde se insertarán los datos
 *  clave: nombre de la propiedad de los objetos que se utilizará como 'value' en la lista
 *  valor: nombre de la propiedad de los objetos que se mostrará en la lista
 *  primerItem: opcionalmente un elemento que se agrega al inicio de la lista
 */
export let cargarLista = opciones => {
    return util.fetchData(util.URL, {
        'body': opciones
    }).then(data => {
        if (data.ok) {
            crearLista(opciones.listaSeleccionable, data.lista, opciones.clave, opciones.valor, opciones.primerItem);
            return data.lista.length;
        } else {
            throw new Error(data.mensaje);
        }
    });
}

/**
 * Si la solicitud al back-end tiene éxito, devuelve una promesa con el siguiente ID de una tabla determinada
 */
export let siguiente = (tabla, campo) => {
    return util.fetchData(util.URL, { // determinar el ID de la siguiente venta
        'method': 'POST',
        'body': {
            clase: 'Conexion',
            accion: 'siguiente',
            tabla: tabla,
            campo: campo
        }
    });
}

export let datePickerES = {
    months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    monthsShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"],
    weekdays: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    weekdaysShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
    weekdaysAbbrev: ["D", "L", "M", "M", "J", "V", "S"]
}

export let tabulatorES = {
    "es": {
        "columns": {
            "name": "Name", //replace the title of column name with the value "Name"
        },
        "ajax": {
            "loading": "Cargando...", //ajax loader text
            "error": "Error", //ajax error text
        },
        "groups": { //copy for the auto generated item count in group header
            "item": "item", //the singular  for item
            "items": "items", //the plural for items
        },
        "pagination": {
            "page_size": "Page Size", //label for the page size select element
            "first": "Primero", //text for the first page button
            "first_title": "Página inicial", //tooltip text for the first page button
            "last": "Último",
            "last_title": "Última página",
            "prev": "Anterior",
            "prev_title": "Página anterior",
            "next": "Siguiente",
            "next_title": "Página siguiente",
        },
        "headerFilters": {
            "default": "filter column...", //default header filter placeholder text
            "columns": {
                "name": "filter name...", //replace default header filter text for column name
            }
        }
    }
}

/**
 * Devuelve verdadero si el argumento dado es un valor
 * @param {String} n Un dato que puede corresponder a un valor o no. 
 */
export let esNumero = n => !isNaN(parseFloat(n)) && isFinite(n);

export let validarCaptcha = () => {
    if (captcha) {
        grecaptcha.ready(() => {
            grecaptcha.execute('6LezR3oUAAAAAAathx5ZMnKqfbmtXH0uUk5H5sOg', {
                action: 'login'
            }).then((token) => {
                fetchData(util.URL, {
                    'method': 'POST',
                    'body': {
                        'clase': 'Conexion',
                        'accion': 'validarCaptcha',
                        'token': token
                    }
                }).then(data => {
                    if (data.respuesta.success) {
                        console.log('captcha correcto');
                        document.querySelector('#login_btnautenticar').className = 'col s12 btn btn-large waves-effect teal';
                    } else {
                        console.log(data);
                    }
                }).catch(error => {
                    mensaje(error, 'No se pudo iniciar sesión');
                });
            });
        });
    } else {
        document.querySelector('#login_btnautenticar').className = 'col s12 btn btn-large waves-effect teal';
    }
}

/**
 * Busca en una lista de productos uno a partir de su ID y si lo encuentra lo retorna, si no, retorna undefined.
 * @param {String} descripcionProducto Un dato string con la forma ID-Descripción
 * @param {Array} listaProductos Un array que contiene objetos de productos
 */
export let buscarProducto = (descripcionProducto, listaProductos) => {
    const idProducto = descripcionProducto.split('-')[0];
    return listaProductos.lista_completa.find(obj => obj.id_producto == idProducto);
}