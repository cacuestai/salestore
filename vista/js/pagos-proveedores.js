'use strict';

// se crea un nuevo objeto anónimo a partir de una clase anónima
// dicho objeto define la gestión de pagos a proveedores, utilizando el componente 'Tabulator' (http://tabulator.info/)

new class PagoProveedor {

    constructor() {

        M.Datepicker.init($('#pago_proveedor-fecha'), {
            format: 'yyyy-mm-dd',
            i18n: util.datePickerES,
            defaultDate: new Date()
        });

        $('#pago_proveedor-fecha').value = moment(new Date()).format('YYYY-MM-DD'); // <-- uno de los usos de moment.js

        this.tablaCreditos;
        this.tablaPagos;
        this.inicializar();
    }

    /**
     * Solicita al back-end el listado de proveedores. Si éstos se reciben, entonces se consulta qué número de pago
     * sigue y se crean las tablas que muestran los créditos y los pagos de un proveedor.
     * También se asignan los eventos a los elementos del formulario.
     */
    inicializar() {
        util.cargarLista({ // solicitar al back-end los elementos de la lista desplegable de proveedores
            clase: 'Proveedor',
            accion: 'listar',
            listaSeleccionable: '#pago_proveedor-proveedor',
            clave: 'id_proveedor',
            valor: 'nombre',
            primerItem: 'Seleccione el proveedor al que va a pagar'
        }).then(() => {
            $('#pago_proveedor-proveedor').value = '';
            M.FormSelect.init($('#pago_proveedor-proveedor'));
            util.siguiente('pagos_proveedores', 'id_pago_proveedor').then(data => {
                if (data.ok) {
                    $('#pago_proveedor-id').value = data.siguiente;
                    M.updateTextFields();
                    this.crearTablaCreditos();
                    this.crearTablaPagos();
                    this.gestionarEventos();
                } else {
                    throw new Error(data.mensaje, 'No se pudo determinar el siguiente ID de pagos de proveedores');
                }
            }).catch(error => {
                util.mensaje(error, 'ID de pagos de proveedores indeterminado');
            });
        }).catch(error => {
            util.mensaje(error);
        });
    }

    /**
     * Consulta al back-end el número de pago siguiente y lo muestra.
     */
    siguientePago() {
        return util.fetchData(util.URL, { // determinar el ID del siguiente pago
            'method': 'POST',
            'body': {
                clase: 'Conexion',
                accion: 'idSiguiente'
            }
        }).then(data => {
            if (data.ok) {
                $('#pago_proveedor-id').value = data.id;
                M.updateTextFields();
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'No se pudo determinar el ID del siguiente pago');
        });
    }

    /**
     * Crea una tabla en la que se muestran las posibles fechas y valores
     * de los créditos a un proveedor.
     */
    crearTablaCreditos() {
        console.log('cargando créditos');

        this.tablaCreditos = new Tabulator('#tabla-creditos', {
            height: "200px",
            ajaxURL: util.URL,
            ajaxParams: { // parámetros que se envían al servidor para mostrar la tabla
                clase: 'Compra',
                accion: 'seleccionar',
                proveedor: $('#pago_proveedor-proveedor').value
            },
            ajaxConfig: 'POST', // tipo de solicitud HTTP ajax
            ajaxContentType: 'json', // enviar parámetros al servidor como una cadena JSON
            layout: 'fitColumns', // ajustar columnas al ancho de la tabla
            responsiveLayout: 'hide', // ocultar columnas que no caben en el espacio de la trabajo tabla
            tooltips: true, // mostrar mensajes sobre las celdas.
            addRowPos: 'top', // al agregar una nueva fila, agréguela en la parte superior de la tabla
            history: true, // permite deshacer y rehacer acciones sobre la tabla.
            pagination: 'local', // cómo paginar los datos
            paginationSize: 10,
            movableColumns: true, // permitir cambiar el orden de las columnas
            resizableRows: true, // permitir cambiar el orden de las filas
            columns: [
                { title: "Fecha", field: "fecha_compra", align: "center" },
                { title: "Valor", field: "total_credito", align: "right", bottomCalc: "sum" }
            ],
            // addRowPos: 'top', // no se usa aquí. Aquí se usa un formulario de edición personalizado
            // locale: true, // se supone que debería utilizar el idioma local
            locale: "es", // idioma. Ver script de utilidades
            langs: util.tabulatorES // ver script de utilidades
        });
    }

    /**
     * Crea una tabla en la que se muestran las posibles fechas y valores
     * de los abonos o pagos realizados por un proveedor.
     */
    crearTablaPagos() {
        console.log('cargando pagos');
        this.tablaPagos = new Tabulator('#tabla-pagos', {
            height: "200px",
            ajaxURL: util.URL,
            ajaxParams: { // parámetros que se envían al servidor para mostrar la tabla
                clase: 'PagoProveedor',
                accion: 'seleccionar',
                proveedor: $('#pago_proveedor-proveedor').value
            },
            ajaxConfig: 'POST', // tipo de solicitud HTTP ajax
            ajaxContentType: 'json', // enviar parámetros al servidor como una cadena JSON
            layout: 'fitColumns', // ajustar columnas al ancho de la tabla
            responsiveLayout: 'hide', // ocultar columnas que no caben en el espacio de la trabajo tabla
            tooltips: true, // mostrar mensajes sobre las celdas.
            addRowPos: 'top', // al agregar una nueva fila, agréguela en la parte superior de la tabla
            history: true, // permite deshacer y rehacer acciones sobre la tabla.
            pagination: 'local', // cómo paginar los datos
            paginationSize: 10,
            movableColumns: true, // permitir cambiar el orden de las columnas
            resizableRows: true, // permitir cambiar el orden de las filas
            columns: [
                { title: "Fecha", field: "fecha_pago", align: "center" },
                { title: "Valor", field: "valor_pago", align: "right", bottomCalc: "sum" }
            ],
            // addRowPos: 'top', // no se usa aquí. Aquí se usa un formulario de edición personalizado
            // locale: true, // se supone que debería utilizar el idioma local
            locale: "es", // idioma. Ver script de utilidades
            langs: util.tabulatorES, // ver script de utilidades
        });
    }

    /**
     * Asigna acciones a los elementos del formulario de la siguiente manera:
     * - lista de proveedores: actualiza las listas de créditos y pagos y del saldo adeudado.
     * - Entrada de abonos: actualiza el saldo adeudado.
     * - Botón registrar abono:  intenta registrar en la base de datos el abono actual y si la 
     *   transacción tiene éxito, agrega una línea con el abono actual a la tabla de abonos.
     */
    gestionarEventos() {
        let tablaPagos = this.tablaPagos;
        let tablaCreditos = this.tablaCreditos;
        let abonoActual = 0;

        $('#pago_proveedor-proveedor').addEventListener('change', event => {
            // mostrar la lista de créditos del proveedor actual
            tablaCreditos.setData(util.URL, {
                clase: 'Compra',
                accion: 'seleccionar',
                proveedor: $('#pago_proveedor-proveedor').value
            }).then(() => {
                // mostrar la lista de pagos del proveedor actual
                tablaPagos.setData(util.URL, {
                    clase: 'PagoProveedor',
                    accion: 'seleccionar',
                    proveedor: $('#pago_proveedor-proveedor').value
                }).then(() => {
                    calcularSaldo();
                }).catch((error) => {
                    util.mensaje(error, 'No se pudo actualizar la tabla de pagos');
                });
            }).catch((error) => {
                util.mensaje(error, 'No se pudo actualizar la tabla de créditos');
            });
        });

        $('#pago_proveedor-abono').addEventListener('input', event => {
            calcularSaldo();
        });

        $('#pago_proveedor-registrar').addEventListener('click', event => {
            // si se ingresó un abono, intentar registrarlo en la base de datos
            if (abonoActual > 0) {
                let pago = {
                    proveedor: $('#pago_proveedor-proveedor').value,
                    valor: abonoActual,
                    fecha: $('#pago_proveedor-fecha').value
                }
                util.fetchData(util.URL, {
                    'method': 'POST',
                    'body': {
                        clase: 'PagoProveedor',
                        accion: 'insertar',
                        pago: pago
                    }
                }).then(data => {
                    // si todo sale bien se retorna el ID del pago registrado
                    if (data.ok) {
                        // mostrar en la tabla de abonos, el nuevo abono
                        tablaPagos.addRow({
                            fecha_pago: $('#pago_proveedor-fecha').value,
                            valor_pago: abonoActual
                        }, false);
                        // se dispone el formulario para un nuevo abono
                        $('#pago_proveedor-id').value = data.id_pago;
                        M.toast({ html: `Pago éxitoso. Seguimos con el N° ${data.id_pago}` });
                        $('#pago_proveedor-abono').value = '';
                        $('#pago_proveedor-proveedor').selectedIndex = 0;
                        M.FormSelect.init($('#pago_proveedor-proveedor'));
                    } else {
                        throw new Error(data.mensaje);
                    }
                }).catch(error => {
                    util.mensaje(error, 'Fallo al intentar registrar el pago del proveedor');
                });
            } else {
                M.toast({ html: 'Falta el valor para el abono actual' });
            }
        });

        let calcularSaldo = () => {
            let totalCredito = tablaCreditos.getCalcResults().bottom.total_credito;
            let totalAbonos = tablaPagos.getCalcResults().bottom.valor_pago;
            abonoActual = util.esNumero($('#pago_proveedor-abono').value) ? Number($('#pago_proveedor-abono').value) : 0;
            $('#pago_proveedor-saldo').value = totalCredito - totalAbonos - abonoActual;
            M.updateTextFields();
        }

    }

}