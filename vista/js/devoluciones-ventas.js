'use strict';

new class DevolucionVenta {

    constructor() {
        this.tablaDetalleVenta;
        this.totalVentas; // cantidad de ventas de un cliente
        this.inicializar();
    }

    /**
     * Asigna valores iniciales a algunas variables del formulario y
     * configura la tabla donde se podrán registrar las devoluciones,
     * Llama al método que obtiene la información de clientes y ventas y
     * Registra los oyentes de eventos para los botones de cancelar o registrar devoluciones
     */
    inicializar() {
        let instances = M.Datepicker.init($('#devolucion_venta-fecha'), {
            format: 'yyyy-mm-dd',
            i18n: util.datePickerES,
            defaultDate: new Date()
        });
        $('#devolucion_venta-fecha').value = moment(new Date()).format('YYYY-MM-DD'); // <-- dando formato con moment.js

        M.FormSelect.init($('#devolucion_venta-cliente'));
        M.FormSelect.init($('#devolucion_venta-datos_venta'));

        this.crearLineasDeVenta();

        util.siguiente('devoluciones_ventas', 'id_devolucion_venta').then(data => {
            if (data.ok) {
                $('#devolucion_venta-numero').value = data.siguiente;
                M.updateTextFields();
                this.inicializarClientes();

                $('#devolucion_venta-cancelar').addEventListener('click', event => {
                    this.inicializarFormulario();
                });

                $('#devolucion_venta-registrar').addEventListener('click', event => {
                    this.registrarDevolucion();
                });
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'ID de devoluciones de ventas indeterminado');
        });
    }

    /**
     * Configura una tabla en donde se mostrarán las líneas o detalles de venta de una venta seleccionada.
     * Inicialmente, dicha tabla no nuestra datos, puesto que no hay venta alguna seleccionada.
     */
    crearLineasDeVenta() {
        this.tablaDetalleVenta = new Tabulator("#devolucion_venta-tabla", {
            ajaxURL: util.URL,
            ajaxParams: { // parámetros que se envían al servidor para mostrar la tabla
                clase: 'Venta',
                accion: 'listarDetalleVenta',
                idVenta: 0 // inicialmente se envía un ID inexistente para asegurar que la tabla quede vacía
            },
            ajaxConfig: 'POST', // tipo de solicitud HTTP ajax
            ajaxContentType: 'json', // enviar parámetros al servidor como una cadena JSON
            height: "200px",
            movableColumns: true,
            resizableRows: true,
            layout: 'fitColumns',
            columns: [
                { field: "producto", visible: false },
                { title: "Vendido", field: "vendido-devuelto", width: 100, editor: "number", align: "right" },
                { title: "Devuelto", field: "cantidad", width: 100, editor: "number", align: "right", validator: ["min:0", { type: enRango }] },
                { title: "Descripción de productos", field: "descripcion_producto" },
                { title: "Vr. Unitario", field: "valor_producto", width: 110, align: "right" }
            ]
        });

        /**
         * Permite verificar que la cantidad devuelta no supere la cantidad vendida
         * @param {Object} celda Una celda donde se ingresa la cantidad a devolver
         * @param {*} cantidad El valor que contiene la celda de devolución actual
         * @param {Object} parametros Ver http://tabulator.info/docs/4.2/validate (no se usan aquí)
         */
        function enRango(celda, cantidad, parametros) {
            // recupera el dato de lo vendido para comparar con el valor cantidad a devolver
            let vendido = celda.getRow().getCell('vendido-devuelto').getValue();
            let devolucionEnRango = cantidad <= vendido;
            if (!devolucionEnRango) {
                console.warn(`Lo cantidad (${cantidad}) no está entre 0 y ${vendido} que es lo vendido.`);
            }
            return devolucionEnRango;
        }
    }

    /**
     * Intenta crear la lista de clientes y llama a los métodos que preparan
     * las ventas del cliente con sus respectivos detalles de ventas
     */
    inicializarClientes() {
        util.cargarLista({ // llenar los elementos de la lista desplegable de clientes
            clase: 'Cliente',
            accion: 'listar',
            opcion: 1, // sólo clientes con ventas
            listaSeleccionable: '#devolucion_venta-cliente',
            clave: 'id_cliente',
            valor: 'nombre',
            primerItem: 'Seleccione un cliente'
        }).then(() => {
            $('#devolucion_venta-cliente').value = '';
            this.inicializarVentasCliente();
            this.inicializarDetallesVenta();
        }).catch(error => {
            util.mensaje(error, 'Sin acceso a la lista de clientes');
        });
    }

    /**
     * Registra un oyente de eventos para que cuando se elija un cliente, se 
     * cargue la lista de ventas del cliente seleccionado y se limpie la 
     * tabla de detalles de ventas. Dicha tabla se llenará nuevamente con datos,
     * cuando se seleccione una venta del cliente seleccionado actualmente.
     */
    inicializarVentasCliente() {
        $('#devolucion_venta-cliente').addEventListener('change', event => {
            let idCliente = $('#devolucion_venta-cliente').value;

            util.cargarLista({ // llenar los elementos de la lista desplegable de las ventas del cliente
                clase: 'Venta',
                accion: 'listar',
                cliente: idCliente, // si este valor no corresponde a un ID de un cliente, la lista de ventas carecerá de elementos
                opcion: 1,
                listaSeleccionable: '#devolucion_venta-datos_venta',
                clave: 'id_venta',
                valor: 'datos_venta',
                primerItem: 'Seleccione una venta'
            }).then((totalVentas) => {
                this.totalVentas = totalVentas;
                // OJO >>> http://joseramos.info/javascript-document-addeventlistener-tercer-parametro/
            }).catch(error => {
                util.mensaje(error, 'Sin acceso a la lista de ventas');
            });

            $('#devolucion_venta-info').innerHTML = `<div id="devolucion_venta-info" class="grid-example col s12"><b>Detalle de la venta</b></div>`;
            this.tablaDetalleVenta.clearData();
        });
    }

    /**
     * Registra un oyente de eventos para que cuando se elija una venta de la lista disponible, 
     * se actualice la tabla que muestra los detalles de venta para la venta actual.
     */
    inicializarDetallesVenta() {
        $('#devolucion_venta-datos_venta').addEventListener('change', event => {
            this.tablaDetalleVenta.setData(util.URL, {
                clase: 'Venta',
                accion: 'listarDetalleVenta',
                idVenta: event.target.value
            }).then(() => {
                if (this.totalVentas > 0) { // el cliente tiene ventas registradas
                    let datosVenta = event.target.options[event.target.selectedIndex].text;
                    $('#devolucion_venta-info').innerHTML = `<div id="devolucion_venta-info" class="grid-example col s12"><b>Detalle de la venta ${datosVenta}</span></div>`;
                } else { // el cliente no tiene ventas registradas
                    $('#devolucion_venta-info').innerHTML = `<div id="devolucion_venta-info" class="grid-example col s12"><b>Detalle de la venta</b></div>`;
                }
            }).catch((error) => {
                util.mensaje(error, 'Problemas al actualizar la tabla de detalles de venta');
            });
        });
    }

    /**
     * Al cancelar se debe dejar todo como al inicio, entonces la forma más fácil de hacerlo
     * es forzar el evento change sobre la lista de clientes, estando seleccionado el primer
     * elemento (value = "") de dicha lista. Esto hará que se desencadenen las instrucciones
     * para el evento change definidas en el método inicializarVentasCliente()
     */
    inicializarFormulario() {
        $('#devolucion_venta-cliente').selectedIndex = 0;
        $('#devolucion_venta-cliente').dispatchEvent(new Event('change'));
    }

    /**
     * 
     */
    registrarDevolucion() {
        // ojo, es absolutamente necesario enviar la referencia como argumento a la función de validación
        // para que devuelva la tabla de detalles modificada
        let detalleVentas = this.tablaDetalleVenta.getData();
        let errores = this.validarDatos(detalleVentas);
        if (errores) { // la devolución no se registra si los datos están incompletos
            M.toast({ html: `No se puede registrar la venta:${errores}` });
            return;
        }

        util.fetchData(util.URL, {
            'method': 'POST',
            'body': {
                clase: 'DevolucionVenta',
                accion: 'insertar',
                devolucion: {
                    fecha: $('#devolucion_venta-fecha').value,
                    cliente: $('#devolucion_venta-cliente').value,
                    venta: $('#devolucion_venta-datos_venta').value,
                    detalle: detalleVentas
                }
            }
        }).then(data => {
            console.log(data);

            // si todo sale bien se retorna el ID de la venta registrada
            if (data.ok) {
                $('#devolucion_venta-numero').value = data.id_devolucion;
                M.toast({ html: `Devolución insertada con éxito. Seguimos con la ${data.id_devolucion}` });
                this.inicializarFormulario();
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'Fallo al intentar registrar una devolución de venta');
        });
    }

    /**
     * Si faltan datos en las entradas de la venta, devuelve un string informando de las inconsistencias
     */
    validarDatos(detalleVentas) {
        let errores = '';

        if (!moment($('#devolucion_venta-fecha').value).isValid()) {
            errores += '<br>Fecha inválida';
        }

        if (!$('#devolucion_venta-cliente').value) {
            errores += '<br>Falta seleccionar el cliente';
        }

        if (!$('#devolucion_venta-datos_venta').value) {
            errores += '<br>Falta seleccionar una venta';
        }

        if (detalleVentas.length == 0) {
            errores += '<br>La venta no tiene detalles de venta.';
        } else {
            let hayDevoluciones = false;

            for (let i = detalleVentas.length - 1; i >= 0; --i) {
                if (util.esNumero(detalleVentas[i].cantidad) && detalleVentas[i].cantidad > 0) {
                    hayDevoluciones = true;
                } else {
                    detalleVentas.splice(i, 1);
                }
            }

            if (!hayDevoluciones) {
                errores += '<br>Ninguna de las líneas de venta tiene cantidades de devolución válidas.';
            }
        }
        return errores;
    }

}