'use strict';

new class Venta {

    constructor() {
        this.tablaVentas;
        this.tablaLineasVentas;
        this.productos;

        let instances = M.Datepicker.init($('#venta-fecha'), {
            format: 'yyyy-mm-dd',
            i18n: util.datePickerES,
            defaultDate: new Date()
        });

        this.filasPorPagina = 10;

        M.Collapsible.init($('#ventas-opciones'), {
            onOpenEnd: (elemento) => {
                this.actualizarListaVentas(elemento);
            }
        });

        $('#venta-vendedor').value = util.usuario.nombre;
        $('#venta-fecha').value = moment(new Date()).format('YYYY-MM-DD'); // <-- observe uno de los usos que se le puede dar a moment.js

        this.inicializarClientes();

        $('#venta-cancelar').addEventListener('click', event => {
            this.cancelarVenta();
        });

        $('#venta-registrar').addEventListener('click', event => {
            this.registrarVenta();
        });

        $('#venta-paga').addEventListener('input', event => {
            this.calcularDeuda();
        });

        this.inicializarGridVentas();

    }

    /**
     * Intenta recuperar la lista de clientes y si es posible, continúa intentando recuperar el siguiente
     * número de factura. Si también lo logra ejecuta crearListaProductos, para que continúe el proceso
     * de inicialización de la facturación
     */
    inicializarClientes() {
        util.cargarLista({ // llenar los elementos de la lista desplegable de clientes
            clase: 'Cliente',
            accion: 'listar',
            listaSeleccionable: '#venta-cliente',
            clave: 'id_cliente',
            valor: 'nombre',
            primerItem: 'Seleccione un cliente'
        }).then(() => {
            $('#venta-cliente').value = '';
            M.FormSelect.init($('#venta-cliente'));

            util.siguiente('ventas', 'id_venta').then(data => {
                if (data.ok) {
                    $('#venta-numero').value = data.siguiente;
                    M.updateTextFields();
                    this.crearListaProductos();
                } else {
                    throw new Error(data.mensaje);
                }
            }).catch(error => {
                util.mensaje(error, 'ID de pagos de ventas indeterminado');
            });
        }).catch(error => {
            util.mensaje(error, 'Sin acceso a la lista de clientes');
        });
    }

    /**
     * Intenta cargar la lista de productos que es posible seleccionar para la venta, si sucede 
     * algún error en esta parte, no se continúa configurando el formulario de ventas, si hay
     * éxito, se inicia la creación de una tabla para ingresar las líneas de venta (detalles de venta).
     */
    crearListaProductos() {
        util.fetchData(util.URL, {
            'body': {
                'clase': 'Producto',
                'accion': 'listar'
            }
        }).then(productos => {
            this.productos = productos;

            if (productos.ok) {
                this.crearLineasDeVenta(productos, this.calcularLineaVenta, this.calcularTotales, this.calcularTodo);
            } else {
                throw new Error(productos.mensaje);
            }
        });
    }

    /**
     * Configura una tabla en donde es posible agregar o eliminar líneas o detalles de venta.
     * @param {Object} productos Un objeto que contiene dos listas de productos, una con todos los 
     * datos de cada producto y otra con los datos básicos para visualizar en un campo de autocompletar.
     */
    crearLineasDeVenta(productos, _calcularLineaVenta, _calcularTotal) {
        this.tablaLineasVentas = new Tabulator("#tabla-lineas_venta", {
            height: "200px",
            movableColumns: true,
            resizableRows: true,
            layout: 'fitColumns',
            columns: [{
                    title: "Cant.",
                    field: "cantidad",
                    width: 80,
                    editor: "number",
                    editorParams: {
                        min: 1,
                        max: 1000
                    },
                    align: "right",
                    cellEdited: function(celda) {
                        _calcularLineaVenta(celda, productos);
                        _calcularTotal(celda.getRow().getTable().getData());
                    }
                },
                {
                    title: "Descripción de productos",
                    field: "producto",
                    editor: "autocomplete",
                    editorParams: {
                        values: productos.lista_minima,
                    },
                    cellEdited: function(celda) {
                        _calcularLineaVenta(celda, productos);
                        _calcularTotal(celda.getRow().getTable().getData());
                    }
                },
                { title: "Vr. Unitario", field: "valor", width: 100, align: "right" },
                { title: "% IVA", field: "iva_porcentaje", width: 100, align: "right" },
                { title: "Vr. IVA", field: "iva_valor", width: 100, align: "right" },
                { title: "Subtotal", field: "subtotal", width: 100, align: "right" },
                { // la última columna incluye un botón para eliminar líneas de ventas
                    title: 'Control',
                    headerSort: false,
                    width: 65,
                    align: "center",
                    formatter: (cell, formatterParams) => {
                        // en cada fila, en la última columna, se asignan botones para eliminar las líneas de venta
                        return '<i id="tabulator-btneliminar" class="material-icons deep-orange-text">delete</i>';
                    },
                    cellClick: (e, celda) => {
                        if (celda) {
                            celda.getRow().delete();
                            _calcularTotal(celda.getRow().getTable().getData());
                        }
                    }
                }
            ]
        });

        this.agregarLineaDeVenta();
    }

    /**
     * Configura el oyente de eventos para el botón que permite agregar líneas de venta y
     * lanza el evento tan pronto se carga el formulario, para disponer de una fila inicial.
     */
    agregarLineaDeVenta() {
        let btnAgregar = $('#venta-btnagregar');
        btnAgregar.addEventListener('click', event => {

            let adicionar = true; // pasará a false si encuentra una línea de venta incompleta
            let lineasDeVenta = this.tablaLineasVentas.getData();

            lineasDeVenta.forEach((lineaVenta) => {
                if (!util.esNumero(lineaVenta.subtotal)) {
                    adicionar = false;
                }
            });

            if (adicionar) {
                this.tablaLineasVentas.addRow({ cantidad: 1, producto: '' }, false); // agregar una fila en blanco al final
            } else {
                M.toast({ html: 'Las líneas de venta deben estar completas para poder agregar nuevas líneas' });
            }
        });
        btnAgregar.click();
    }

    /**
     * Calcula y muestra el valor total de la factura y el total de IVA
     * @param {Array} lineasDeVenta Los detalles de la venta
     */
    calcularTotales(lineasDeVenta) {
        let totalFacturado = 0;
        let totalIVA = 0;

        lineasDeVenta.forEach((lineaVenta) => {
            if (util.esNumero(lineaVenta.subtotal)) {
                totalFacturado += lineaVenta.subtotal;
                totalIVA += lineaVenta.iva_valor;
            }
        });

        $('#venta-total').value = totalFacturado;
        $('#venta-iva').value = totalIVA;
        M.updateTextFields();
    }

    /**
     * Actualiza cada detalle de venta con el valor del IVA y del total de la línea de venta
     */
    calcularLineaVenta(celda, productos) {
        let filaActual = celda.getRow().getData();
        let producto = util.buscarProducto(filaActual.producto, productos);

        if (producto) {
            filaActual.valor = producto.precio;
            filaActual.iva_porcentaje = producto.porcentaje_iva;
            filaActual.iva_valor = producto.porcentaje_iva * producto.porcentaje_iva * filaActual.cantidad;
            filaActual.subtotal = filaActual.cantidad * producto.precio + filaActual.iva_valor;
            celda.getRow().update(filaActual);
        }
    }

    /**
     * Se envían los datos del front-end al back-end para ser guardados en la base de datos
     */
    registrarVenta() {

        // ensayar los tiempos de espera en servidores lentos para ver si esto es necesario:
        //      $('#venta-registrar').disabled = true;
        //      $('#venta-cancelar').disabled = true;

        let errores = this.validarDatos();
        if (errores) { // la venta no se registra si los datos están incompletos
            M.toast({ html: `No se puede registrar la venta:${errores}` });
            return;
        }

        let venta = {
            fecha: $('#venta-fecha').value,
            cliente: $('#venta-cliente').value,
            vendedor: util.usuario.id_persona,
            total: $('#venta-total').value,
            iva: $('#venta-iva').value,
            paga: $('#venta-paga').value,
            adeuda: $('#venta-adeuda').value,
            detalle: this.tablaLineasVentas.getData()
        };

        util.fetchData(util.URL, {
            'method': 'POST',
            'body': {
                clase: 'Venta',
                accion: 'insertar',
                venta: venta
            }
        }).then(data => {
            // si todo sale bien se retorna el ID de la venta registrada
            if (data.ok) {
                this.actualizarStock(venta.detalle);
                $('#venta-numero').value = data.id_venta;
                M.toast({ html: `Venta insertada con éxito. Seguimos con la ${data.id_venta}` });
                $('#venta-paga').value = '';
                $('#venta-cliente').selectedIndex = 0;
                M.FormSelect.init($('#venta-cliente'));
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'Fallo al intentar registrar una nueva venta');
        });
    }

    /**
     * Actualiza las cantidades disponibles de los productos afectados con la venta
     * @param {Array} lineasDeVenta 
     */
    actualizarStock(lineasDeVenta) {
        lineasDeVenta.forEach((lineaVenta) => {
            if (util.esNumero(lineaVenta.subtotal)) {
                let producto = util.buscarProducto(lineaVenta.producto, this.productos);
                producto.cantidad_disponible = producto.cantidad_disponible - lineaVenta.cantidad;
            }
        });
    }

    /**
     * Al pulsar este botón los datos que se estén editando actualmente, se perderán.
     */
    cancelarVenta() {
        this.tablaLineasVentas.clearData();
        $('#venta-cliente').value = '';
        $('#venta-paga').value = '';
        $('#venta-adeuda').value = '';
        $('#venta-total').value = '';
        $('#venta-iva').value = '';
    }

    /**
     * Registra la diferencia entre el total de la venta y lo que paga el cliente.
     * Si lo que paga excede lo adeudado se informa al usuario.
     */
    calcularDeuda() {
        let totalVenta = util.esNumero($('#venta-total').value) ? Number($('#venta-total').value) : 0;
        let paga = util.esNumero($('#venta-paga').value) ? Number($('#venta-paga').value) : 0;
        $('#venta-adeuda').value = totalVenta - paga;
        M.updateTextFields();
        if (paga > totalVenta) {
            M.toast({ html: `El pago ($${paga}) excede el valor de la venta ($${totalVenta})` });
        }
    }

    /**
     * Si faltan datos en las entradas de la venta, devuelve un string informando de las inconsistencias
     */
    validarDatos() {
        let errores = '';

        if (!moment($('#venta-fecha').value).isValid()) {
            errores += '<br>Fecha inválida';
        }

        if (!$('#venta-cliente').value) {
            errores += '<br>Falta seleccionar el cliente';
        }

        let lineasDeVenta = this.tablaLineasVentas.getData();
        if (lineasDeVenta.length == 0) {
            errores += '<br>La venta aún no tiene detalles de venta.';
        } else {
            let lineaIncompleta = false;
            lineasDeVenta.forEach((lineaVenta) => {
                if (!util.esNumero(lineaVenta.subtotal)) {
                    lineaIncompleta = true;
                }
            });

            if (lineaIncompleta) {
                errores += '<br>Se encontró al menos un detalle de venta incompleto.';
            }
        }

        if (!util.esNumero($('#venta-paga').value)) {
            errores += '<br>Falta ingresar cuánto paga el cliente o cero si es preciso.';
        }

        return errores;
    }

    inicializarGridVentas() {
        this.tablaVentas = new Tabulator("#tabla-ventas", {
            columns: [{
                    title: "Estado",
                    field: "estado",
                    align: "center",
                    formatter: (cell, formatterParams, onRendered) => { // semaforización
                        return `<i class="material-icons ${cell.getValue()}-text">flare</i>`;
                    },
                    width: 80
                },
                { title: "Fecha", field: "fecha_venta", width: 100, align: "center" },
                { title: "Cliente", field: "cliente", width: 240 },
                { title: "De contado", field: "total_contado", width: 100, align: "right", formatter: "money", formatterParams: { precision: 0 }, bottomCalc: "sum", bottomCalcFormatter: "money", bottomCalcFormatterParams: { precision: 0 } },
                { title: "A crédito", field: "total_credito", width: 100, align: "right", formatter: "money", formatterParams: { precision: 0 }, bottomCalc: "sum", bottomCalcFormatter: "money", bottomCalcFormatterParams: { precision: 0 } },
                { title: "Total", field: "total", width: 100, align: "right", formatter: "money", formatterParams: { precision: 0 }, bottomCalc: "sum", bottomCalcFormatter: "money", bottomCalcFormatterParams: { precision: 0 } },
                { title: "Vendedor", field: "vendedor" }
            ],
            ajaxURL: util.URL,
            ajaxParams: { // parámetros que se envían al servidor para mostrar la tabla
                clase: 'Venta',
                accion: 'listar',
                opcion: 2
            },
            ajaxConfig: 'POST', // tipo de solicitud HTTP ajax
            ajaxContentType: 'json', // enviar parámetros al servidor como una cadena JSON
            layout: 'fitColumns', // ajustar columnas al ancho de la tabla
            responsiveLayout: 'hide', // ocultar columnas que no caben en el espacio de trabajola tabla
            tooltips: true, // mostrar mensajes sobre las celdas.
            addRowPos: 'top', // al agregar una nueva fila, agréguela en la parte superior de la tabla
            history: true, // permite deshacer y rehacer acciones sobre la tabla.
            pagination: 'local', // cómo paginar los datos
            paginationSize: this.filasPorPagina,
            movableColumns: true, // permitir cambiar el orden de las columnas
            resizableRows: true, // permitir cambiar el orden de las filas
            /////////////initialSort: this.ordenInicial,
            // addRowPos: 'top', // no se usa aquí. Aquí se usa un formulario de edición personalizado
            ////////////index: this.indice, // indice único de cada fila
            // locale: true, // se supone que debería utilizar el idioma local
            ///////////rowAdded: (row) => this.filaActual = row,
            locale: "es", // idioma. Ver script de utilidades
            langs: util.tabulatorES // ver script de utilidades
        });
    }

    actualizarListaVentas(elemento) {
        if (elemento.id === 'venta-listado') {
            this.tablaVentas.setData(util.URL, {
                clase: 'Venta',
                accion: 'listar',
                opcion: 2
            });
            // lo siguiente se requiere por simultáneamente se está terminando de abrir el pliegue 
            // y se está creando la tabla y por ende ésta no "conoce" las dimensiones precisas.
            this.tablaVentas.redraw();
        }
    }


}