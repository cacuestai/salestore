'use strict';

new class DevolucionCompra {

    constructor() {
        this.tablaDetalleCompra;
        this.totalCompras; // cantidad de compras a un proveedor
        this.inicializar();
    }

    /**
     * Asigna valores iniciales a algunas variables del formulario y
     * configura la tabla donde se podrán registrar las devoluciones,
     * Llama al método que obtiene la información de proveedores y compras y
     * Registra los oyentes de eventos para los botones de cancelar o registrar devoluciones
     */
    inicializar() {
        let instances = M.Datepicker.init($('#devolucion_compra-fecha'), {
            format: 'yyyy-mm-dd',
            i18n: util.datePickerES,
            defaultDate: new Date()
        });
        $('#devolucion_compra-fecha').value = moment(new Date()).format('YYYY-MM-DD'); // <-- dando formato con moment.js

        M.FormSelect.init($('#devolucion_compra-proveedor'));
        M.FormSelect.init($('#devolucion_compra-datos_compra'));

        this.crearLineasDeCompra();

        util.siguiente('devoluciones_compras', 'id_devolucion_compra').then(data => {
            if (data.ok) {
                $('#devolucion_compra-numero').value = data.siguiente;
                M.updateTextFields();
                this.inicializarProveedores();

                $('#devolucion_compra-cancelar').addEventListener('click', event => {
                    this.inicializarFormulario();
                });

                $('#devolucion_compra-registrar').addEventListener('click', event => {
                    this.registrarDevolucion();
                });
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'ID de devoluciones de compras indeterminado');
        });
    }

    /**
     * Configura una tabla en donde se mostrarán las líneas o detalles de compra de una compra seleccionada.
     * Inicialmente, dicha tabla no nuestra datos, puesto que no hay compra alguna seleccionada.
     */
    crearLineasDeCompra() {
        this.tablaDetalleCompra = new Tabulator("#devolucion_compra-tabla", {
            ajaxURL: util.URL,
            ajaxParams: { // parámetros que se envían al servidor para mostrar la tabla
                clase: 'Compra',
                accion: 'listarDetalleCompra',
                idCompra: 0 // inicialmente se envía un ID inexistente para asegurar que la tabla quede vacía
            },
            ajaxConfig: 'POST', // tipo de solicitud HTTP ajax
            ajaxContentType: 'json', // enviar parámetros al servidor como una cadena JSON
            height: "200px",
            movableColumns: true,
            resizableRows: true,
            layout: 'fitColumns',
            columns: [
                { field: "producto", visible: false },
                { title: "Comprado", field: "comprado-devuelto", width: 100, editor: "number", align: "right" },
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
            // recupera el dato de lo comprado para comparar con el valor cantidad a devolver
            let comprado = celda.getRow().getCell('comprado-devuelto').getValue();
            let devolucionEnRango = cantidad <= comprado;
            if (!devolucionEnRango) {
                console.warn(`Lo cantidad (${cantidad}) no está entre 0 y ${comprado} que es lo comprado.`);
            }
            return devolucionEnRango;
        }
    }

    /**
     * Intenta crear la lista de proveedores y llama a los métodos que preparan
     * las compras al proveedor con sus respectivos detalles de compras
     */
    inicializarProveedores() {
        util.cargarLista({ // llenar los elementos de la lista desplegable de proveedores
            clase: 'Proveedor',
            accion: 'listar',
            opcion: 1, // sólo proveedores a los que se les ha comprado
            listaSeleccionable: '#devolucion_compra-proveedor',
            clave: 'id_proveedor',
            valor: 'nombre',
            primerItem: 'Seleccione un proveedor'
        }).then(() => {
            $('#devolucion_compra-proveedor').value = '';
            this.inicializarComprasProveedor();
            this.inicializarDetallesProveedor();
        }).catch(error => {
            util.mensaje(error, 'Sin acceso a la lista de proveedores');
        });
    }

    /**
     * Registra un oyente de eventos para que cuando se elija un proveedor, se 
     * cargue la lista de compras del proveedor seleccionado y se limpie la 
     * tabla de detalles de compras. Dicha tabla se llenará nuevamente con datos,
     * cuando se seleccione una compra a un proveedor seleccionado actualmente.
     */
    inicializarComprasProveedor() {
        $('#devolucion_compra-proveedor').addEventListener('change', event => {
            let idProveedor = $('#devolucion_compra-proveedor').value;

            util.cargarLista({ // llenar los elementos de la lista desplegable de las compras a un proveedor
                clase: 'Compra',
                accion: 'listar',
                proveedor: idProveedor, // si este valor no corresponde a un ID de un proveedor, la lista de proveedores carecerá de elementos
                listaSeleccionable: '#devolucion_compra-datos_compra',
                clave: 'id_compra',
                valor: 'datos_compra',
                primerItem: 'Seleccione una compra'
            }).then((totalCompras) => {
                this.totalCompras = totalCompras;
                // OJO >>> http://joseramos.info/javascript-document-addeventlistener-tercer-parametro/
            }).catch(error => {
                util.mensaje(error, 'Sin acceso a la lista de compras');
            });

            $('#devolucion_compra-info').innerHTML = `<div id="devolucion_compra-info" class="grid-example col s12"><b>Detalle de la compra</b></div>`;
            this.tablaDetalleCompra.clearData();
        });
    }

    /**
     * Registra un oyente de eventos para que cuando se elija una compra de la lista disponible, 
     * se actualice la tabla que muestra los detalles de compra para la compra actual.
     */
    inicializarDetallesProveedor() {
        $('#devolucion_compra-datos_compra').addEventListener('change', event => {
            this.tablaDetalleCompra.setData(util.URL, {
                clase: 'Compra',
                accion: 'listarDetalleCompra',
                idCompra: event.target.value
            }).then(() => {
                if (this.totalCompras > 0) { // el proveedor tiene compras registradas
                    let datosCompra = event.target.options[event.target.selectedIndex].text;
                    $('#devolucion_compra-info').innerHTML = `<div id="devolucion_compra-info" class="grid-example col s12"><b>Detalle de la compra ${datosCompra}</span></div>`;
                } else { // el proveedor no tiene compras registradas
                    $('#devolucion_compra-info').innerHTML = `<div id="devolucion_compra-info" class="grid-example col s12"><b>Detalle de la compra</b></div>`;
                }
            }).catch((error) => {
                util.mensaje(error, 'Problemas al actualizar la tabla de detalles de compras');
            });
        });
    }

    /**
     * Al cancelar se debe dejar todo como al inicio, entonces la forma más fácil de hacerlo
     * es forzar el evento change sobre la lista de proveedores, estando seleccionado el primer
     * elemento (value = "") de dicha lista. Esto hará que se desencadenen las instrucciones
     * para el evento change definidas en el método inicializarComprasProveedor()
     */
    inicializarFormulario() {
        $('#devolucion_compra-proveedor').selectedIndex = 0;
        $('#devolucion_compra-proveedor').dispatchEvent(new Event('change'));
    }

    /**
     * 
     */
    registrarDevolucion() {
        // ojo, es absolutamente necesario enviar la referencia como argumento a la función de validación
        // para que devuelva la tabla de detalles modificada
        let detalleCompras = this.tablaDetalleCompra.getData();
        let errores = this.validarDatos(detalleCompras);
        if (errores) { // la devolución no se registra si los datos están incompletos
            M.toast({ html: `No se puede registrar la compra:${errores}` });
            return;
        }

        util.fetchData(util.URL, {
            'method': 'POST',
            'body': {
                clase: 'DevolucionCompra',
                accion: 'insertar',
                devolucion: {
                    fecha: $('#devolucion_compra-fecha').value,
                    proveedor: $('#devolucion_compra-proveedor').value,
                    compra: $('#devolucion_compra-datos_compra').value,
                    detalle: detalleCompras
                }
            }
        }).then(data => {
            console.log(data);

            // si todo sale bien se retorna el ID de la compra registrada
            if (data.ok) {
                $('#devolucion_compra-numero').value = data.id_devolucion;
                M.toast({ html: `Devolución insertada con éxito. Seguimos con la ${data.id_devolucion}` });
                this.inicializarFormulario();
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'Fallo al intentar registrar una devolución de compra');
        });
    }

    /**
     * Si faltan datos en las entradas de la compra, devuelve un string informando de las inconsistencias
     */
    validarDatos(detalleCompras) {
        let errores = '';

        if (!moment($('#devolucion_compra-fecha').value).isValid()) {
            errores += '<br>Fecha inválida';
        }

        if (!$('#devolucion_compra-proveedor').value) {
            errores += '<br>Falta seleccionar el proveedor';
        }

        if (!$('#devolucion_compra-datos_compra').value) {
            errores += '<br>Falta seleccionar una compra';
        }

        if (detalleCompras.length == 0) {
            errores += '<br>La compra no tiene detalles de compra.';
        } else {
            let hayDevoluciones = false;

            for (let i = detalleCompras.length - 1; i >= 0; --i) {
                if (util.esNumero(detalleCompras[i].cantidad) && detalleCompras[i].cantidad > 0) {
                    hayDevoluciones = true;
                } else {
                    detalleCompras.splice(i, 1);
                }
            }

            if (!hayDevoluciones) {
                errores += '<br>Ninguna de las líneas de compra tiene cantidades de devolución válidas.';
            }
        }
        return errores;
    }

}