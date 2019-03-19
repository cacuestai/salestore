'use strict';

// se crea un nuevo objeto anónimo a partir de una clase anónima
// dicho objeto define la gestión de pagos de clientes, utilizando el componente 'Tabulator' (http://tabulator.info/)

new class PagoCliente {

    constructor() {

        M.Datepicker.init($('#pago_cliente-fecha'), {
            format: 'yyyy-mm-dd',
            i18n: util.datePickerES,
            defaultDate: new Date()
        });

        $('#pago_cliente-fecha').value = moment(new Date()).format('YYYY-MM-DD'); // <-- uno de los usos de moment.js

        this.tablaCreditos;
        this.tablaPagos;
        this.inicializar();
    }

    /**
     * Solicita al back-end el listado de clientes. Si éstos se reciben, entonces se consulta qué número de pago
     * sigue y se crean las tablas que muestran los créditos y los pagos de un cliente.
     * También se asignan los eventos a los elementos del formulario.
     */
    inicializar() {
        util.cargarLista({ // solicitar al back-end los elementos de la lista desplegable de clientes
            clase: 'Cliente',
            accion: 'listar',
            listaSeleccionable: '#pago_cliente-cliente',
            clave: 'id_cliente',
            valor: 'nombre',
            primerItem: 'Seleccione el cliente que va a pagar'
        }).then(() => {
            $('#pago_cliente-cliente').value = '';
            M.FormSelect.init($('#pago_cliente-cliente'));
            util.siguiente('pagos_clientes', 'id_pago_cliente').then(data => {
                if (data.ok) {
                    $('#pago_cliente-id').value = data.siguiente;
                    M.updateTextFields();
                    this.crearTablaCreditos();
                    this.crearTablaPagos();
                    this.gestionarEventos();
                } else {
                    throw new Error(data.mensaje, 'No se pudo determinar el siguiente ID de pagos de clientes');
                }
            }).catch(error => {
                util.mensaje(error, 'ID de pagos de clientes indeterminado');
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
                $('#pago_cliente-id').value = data.id;
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
     * de los créditos de un cliente.
     */
    crearTablaCreditos() {
        console.log('cargando créditos');

        this.tablaCreditos = new Tabulator('#tabla-creditos', {
            height: "200px",
            ajaxURL: util.URL,
            ajaxParams: { // parámetros que se envían al servidor para mostrar la tabla
                clase: 'Venta',
                accion: 'seleccionar',
                cliente: $('#pago_cliente-cliente').value
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
                { title: "Fecha", field: "fecha_venta", align: "center" },
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
     * de los abonos o pagos realizados por un cliente.
     */
    crearTablaPagos() {
        console.log('cargando pagos');
        this.tablaPagos = new Tabulator('#tabla-pagos', {
            height: "200px",
            ajaxURL: util.URL,
            ajaxParams: { // parámetros que se envían al servidor para mostrar la tabla
                clase: 'PagoCliente',
                accion: 'seleccionar',
                cliente: $('#pago_cliente-cliente').value
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
     * - lista de clientes: actualiza las listas de créditos y pagos y del saldo adeudado.
     * - Entrada de abonos: actualiza el saldo adeudado.
     * - Botón registrar abono:  intenta registrar en la base de datos el abono actual y si la 
     *   transacción tiene éxito, agrega una línea con el abono actual a la tabla de abonos.
     */
    gestionarEventos() {
        let tablaPagos = this.tablaPagos;
        let tablaCreditos = this.tablaCreditos;
        let abonoActual = 0;

        $('#pago_cliente-cliente').addEventListener('change', event => {
            // mostrar la lista de créditos de cliente actual
            tablaCreditos.setData(util.URL, {
                clase: 'Venta',
                accion: 'seleccionar',
                cliente: $('#pago_cliente-cliente').value
            }).then(() => {
                // mostrar la lista de pagos del cliente actual
                tablaPagos.setData(util.URL, {
                    clase: 'PagoCliente',
                    accion: 'seleccionar',
                    cliente: $('#pago_cliente-cliente').value
                }).then(() => {
                    calcularSaldo();
                }).catch((error) => {
                    util.mensaje(error, 'No se pudo actualizar la tabla de pagos');
                });
            }).catch((error) => {
                util.mensaje(error, 'No se pudo actualizar la tabla de créditos');
            });
        });

        $('#pago_cliente-abono').addEventListener('input', event => {
            calcularSaldo();
        });

        $('#pago_cliente-registrar').addEventListener('click', event => {
            // si se ingresó un abono, intentar registrarlo en la base de datos
            if (abonoActual > 0) {
                let pago = {
                    cliente: $('#pago_cliente-cliente').value,
                    valor: abonoActual,
                    fecha: $('#pago_cliente-fecha').value
                }
                util.fetchData(util.URL, {
                    'method': 'POST',
                    'body': {
                        clase: 'PagoCliente',
                        accion: 'insertar',
                        pago: pago
                    }
                }).then(data => {
                    // si todo sale bien se retorna el ID del pago registrado
                    if (data.ok) {
                        // mostrar en la tabla de abonos, el nuevo abono
                        tablaPagos.addRow({
                            fecha_pago: $('#pago_cliente-fecha').value,
                            valor_pago: abonoActual
                        }, false);
                        // se dispone el formulario para un nuevo abono
                        $('#pago_cliente-id').value = data.id_pago;
                        M.toast({ html: `Pago éxitoso. Seguimos con el N° ${data.id_pago}` });
                        $('#pago_cliente-abono').value = '';
                        $('#pago_cliente-cliente').selectedIndex = 0;
                        M.FormSelect.init($('#pago_cliente-cliente'));
                    } else {
                        throw new Error(data.mensaje);
                    }
                }).catch(error => {
                    util.mensaje(error, 'Fallo al intentar registrar el pago del cliente');
                });
            } else {
                M.toast({ html: 'Falta el valor para el abono actual' });
            }
        });

        let calcularSaldo = () => {
            let totalCredito = tablaCreditos.getCalcResults().bottom.total_credito;
            let totalAbonos = tablaPagos.getCalcResults().bottom.valor_pago;
            abonoActual = util.esNumero($('#pago_cliente-abono').value) ? Number($('#pago_cliente-abono').value) : 0;
            $('#pago_cliente-saldo').value = totalCredito - totalAbonos - abonoActual;
            M.updateTextFields();
        }

    }

}