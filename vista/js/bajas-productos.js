'use strict';

// se crea un nuevo objeto anónimo a partir de una clase anónima
// dicho objeto define la gestión de bajas de productos, utilizando el componente 'Tabulator' (http://tabulator.info/)

new class BajaProducto {

    constructor() {
        this.producto;
        this.inicializar();
    }

    /**
     * Configura el formulario de entrada de datos de bajas de productos
     */
    inicializar() {

        M.Datepicker.init($('#pago_cliente-fecha'), {
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
                }).then(data => {
                    this.crearListaProductos(data);
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
        if (productos.ok) {
            M.Autocomplete.init($('#baja-producto'), {
                // convierte el array lista_minima en un objeto para utilizarlo con Materialize.autocomplete
                data: productos.lista_minima.reduce((resultado, item) => {
                    resultado[item] = ''
                    return resultado;
                }, {}),
                onAutocomplete: (item) => {
                    // extraer el ID del producto (éste precede a cada nombre de la lista)
                    let idProducto = item.split('-')[0];
                    // utilizar dicho ID para buscar un objeto con los datos del producto
                    // y guardar su referencia a nivel de clase
                    this.producto = productos.lista_completa.find(obj => obj.id_producto == idProducto);
                    console.log(this.producto);
                    // mostrar en los elementos HTML datos relevantes del producto del que se va a realizar la baja
                    // >> mostrar la cantidad disponible del objeto this.producto
                    // >> mostrar la cantidad mínima del producto tomando el dato de this.producto
                    // >> mostrar la cantidad máxima del producto tomando el dato de this.producto
                    M.updateTextFields();
                },
            });
        } else {
            throw new Error(productos.mensaje);
        }
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
            // >> para este objeto se deben definir las propiedades tipo, fecha, producto, precio y cantidad
            // >> para cada propiedad de este objeto se deben asignar los valores que haya ingresado el usuario
            // >> en los elementos HTML respectivos 
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
                // >> aquí deben agregarse instrucciones para limpiar los siguientes campos (elementos HTML):
                // >> cantidad, producto, dispinible, mínimo, máximo y motivo de la baja
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

        // >> agregar un mensaje de error a errores si la fecha es inválida

        // >> agregar un mensaje de error a errores si luego de eliminar los espacios iniciales y finales
        // >> de los datos de un producto, se encuentra que es una cadena de cero longitud
        // >> o la cantidad disponible del producto está en cero o la cantidad a dar de baja es 
        // >> superior a la cantidad disponible

        // >> agregar un mensaje de error a errores si en el formulario de entrada está apareciendo 
        // >> el aviso "seleccione el motivo de la baja"
        if ($('#baja-motivo').selectedIndex == 0) {
            errores += '<br> - Falta seleccionar el motivo de la baja.';
        }

        return errores;
    }

}