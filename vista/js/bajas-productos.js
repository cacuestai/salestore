'use strict';

// se crea un nuevo objeto anónimo a partir de una clase anónima
// dicho objeto define la gestión de bajas de productos, utilizando el componente 'Tabulator' (http://tabulator.info/)

new class BajaProducto {

    constructor() {
        this.producto; // "referencia" al último elemento de la lista de productos, seleccionado mediante autocompletar
        this.inicializar();
    }

    /**
     * Configura el formulario de entrada de datos de bajas de productos
     */
    inicializar() {

        M.Datepicker.init($('#baja-fecha'), {
            format: 'yyyy-mm-dd', // el formato de fecha utilizado por Postgres
            i18n: util.datePickerES, // el idioma para el componente 
            defaultDate: new Date() // hoy como fecha por defecto
        });

        // se muestra la fecha de hoy formateada utilizando moment.js
        $('#baja-fecha').value = moment(new Date()).format('YYYY-MM-DD');

        M.FormSelect.init($('#baja-motivo'));

        // se solicita el siguiente ID de bajas
        util.siguiente('bajas_productos', 'id_baja_producto').then(data => {
            if (data.ok) {
                // si la solicitud es exitosa, se visualiza el siguiente ID de bajas
                $('#baja-id').value = data.siguiente;
                M.updateTextFields();
                // se solicita la lista de productos para crear un input-autocompletar
                util.fetchData(util.URL, {
                    'body': {
                        clase: 'Producto',
                        accion: 'listar'
                    }
                }).then(productos => {
                    if (productos.ok) {
                        delete productos.ok;
                        this.crearListaProductos(productos);
                    } else {
                        throw new Error(productos.mensaje);
                    }
                });

                $('#baja-registrar').addEventListener('click', event => {
                    this.registrarBaja();
                });
            } else {
                throw new Error(data.mensaje, 'No se pudo determinar el siguiente ID de bajas de productos');
            }
        }).catch(error => {
            util.mensaje(error, 'ID de bajas de productos indeterminado');
        });
    }

    /**
     * Configura un campo de entrada que permite autocompletar nombres de productos
     * @param {Object} productos Un objeto con un array de nombres y con otro array 
     * que contiene todos los datos de objetos. 
     */
    crearListaProductos(productos) {
        M.Autocomplete.init($('#baja-producto'), {
            // convierte el array lista_minima en un objeto para utilizarlo con Materialize.autocomplete
            data: productos.lista_minima.reduce((resultado, item) => {
                resultado[item] = ''
                return resultado;
            }, {}),
            onAutocomplete: (item) => {
                this.producto = util.buscarProducto(item, productos);
                // mostrar datos relevantes del producto del que se va a realizar la baja
                $('#baja-disponible').value = this.producto.cantidad_disponible;
                $('#baja-minimo').value = this.producto.cantidad_minima;
                $('#baja-maximo').value = this.producto.cantidad_maxima;
                M.updateTextFields();
            },
        });

    }

    /**
     * Registra una baja en la base de datos
     */
    registrarBaja() {

        let errores = this.validarDatos();
        if (errores) { // la baja no se registra si los datos están incompletos
            M.toast({ html: `No se puede registrar la baja:${errores}` });
            return;
        }

        // los datos que se registran en la base de datos
        let baja = {
            tipo: $('#baja-motivo').value,
            fecha: $('#baja-fecha').value,
            producto: this.producto.id_producto,
            precio: this.producto.precio,
            cantidad: $('#baja-cantidad').value
        };

        util.fetchData(util.URL, {
            'method': 'POST',
            'body': {
                clase: 'BajaProducto',
                accion: 'insertar',
                baja: baja
            }
        }).then(data => {
            // si todo sale bien se retorna el ID de la baja registrada
            if (data.ok) {
                $('#baja-id').value = data.id_baja;
                M.toast({ html: `Baja insertada con éxito. Seguimos con la ${data.id_baja}` });
                $('#baja-cantidad').value = '';
                $('#baja-producto').value = '';
                $('#baja-disponible').value = '';
                $('#baja-minimo').value = '';
                $('#baja-maximo').value = '';
                $('#baja-motivo').selectedIndex = 0;
                // dado que this.producto es una "referencia" a un elemento de la lista, dicho elemento se puede actualizar así:
                this.producto.cantidad_disponible = this.producto.cantidad_disponible - baja.cantidad;
                M.FormSelect.init($('#baja-motivo'));
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'Fallo al intentar registrar una baja de producto');
        });
    }

    /**
     * Verificación de las entradas de datos de la baja
     */
    validarDatos() {
        let errores = '';

        if (!moment($('#baja-fecha').value).isValid()) {
            errores += '<br> - Fecha inválida.';
        }

        $('#baja-producto').value = $('#baja-producto').value.trim();
        if (!$('#baja-producto').value) {
            errores += '<br> - Falta ingresar el producto.';
        } else {
            if (this.producto.cantidad_disponible < 1) {
                errores += '<br> - Este producto no está disponible.';
            } else {
                let cantidadBaja = util.esNumero($('#baja-cantidad').value) ? Number($('#baja-cantidad').value) : 0;
                if (cantidadBaja < 1 || cantidadBaja > this.producto.cantidad_disponible) {
                    errores += `<br> - Se espera una cantidad entre 1 y ${this.producto.cantidad_disponible}.`;
                }
            }
        }

        if ($('#baja-motivo').selectedIndex == 0) {
            errores += '<br> - Falta seleccionar el motivo de la baja.';
        }

        return errores;
    }

}