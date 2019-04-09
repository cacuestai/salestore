'use strict';

new class Compra {

    constructor() {
        this.tablaCompras;

        var instances = M.Datepicker.init($('.datepicker', true), {
            format: 'yyyy-mm-dd',
            i18n: util.datePickerES,
            defaultDate: new Date()
        });

        this.filasPorPagina = 7;

        $('#compra-fecha_pedido').value = moment(new Date()).format('YYYY-MM-DD'); // <-- observe uno de los usos que se le puede dar a moment.js
        $('#compra-fecha_recibido').value = moment(new Date()).format('YYYY-MM-DD');

        this.inicializarProveedores();

        $('#compra-cancelar').addEventListener('click', event => {
            this.cancelarCompra();
        });

        $('#compra-registrar').addEventListener('click', event => {
            this.registrarCompra();
        });

        $('#compra-paga').addEventListener('input', event => {
            this.calcularDeuda();
        });
    }

    /**
     * Intenta recuperar la lista de clientes y si es posible, continúa intentando recuperar el siguiente
     * número de factura. Si también lo logra ejecuta crearListaProductos, para que continúe el proceso
     * de inicialización de la facturación
     */
    inicializarProveedores() {
        util.cargarLista({ // llenar los elementos de la lista desplegable de clientes
            clase: 'Proveedor',
            accion: 'listar',
            listaSeleccionable: '#compra-proveedor',
            clave: 'id_proveedor',
            valor: 'nombre',
            primerItem: 'Seleccione un proveedor'
        }).then(() => {
            $('#compra-proveedor').value = '';
            M.FormSelect.init($('#compra-proveedor'));

            util.siguiente('ventas', 'id_venta').then(data => {
                if (data.ok) {
                    $('#compra-numero').value = data.siguiente;
                    M.updateTextFields();
                    this.crearListaProductos();
                } else {
                    throw new Error(data.mensaje);
                }
            }).catch(error => {
                util.mensaje(error, 'ID de pagos de ventas indeterminado');
            });
        }).catch(error => {
            util.mensaje(error);
        });
    }

    /**
     * Intenta cargar la lista de productos que es posible seleccionar para la compra, si sucede 
     * algún error en esta parte, no se continúa configurando el formulario de compras, si hay
     * éxito, se inicia la creación de una tabla para ingresar las líneas de compra (detalles de compra).
     */
    crearListaProductos() {
        util.fetchData(util.URL, {
            'body': {
                'clase': 'Producto',
                'accion': 'listar'
            }
        }).then(productos => {
            if (productos.ok) {
                this.productos = productos;
                this.crearLineasDeCompra(this.productos, this.calcularLineaCompra, this.calcularTotales, this.calcularTodo);
            } else {
                throw new Error(productos.mensaje);
            }
        });
    }

    /**
     * Configura una tabla en donde es posible agregar o eliminar líneas o detalles de compra.
     * @param {Object} productos Un objeto que contiene dos listas de productos, una con todos los 
     * datos de cada producto y otra con los datos básicos para visualizar en un campo de autocompletar.
     */
    crearLineasDeCompra(productos, _calcularLineaCompra, _calcularTotal) {
        this.tablaCompras = new Tabulator("#tabla-compras", {
            height: "200px",
            movableColumns: true,
            resizableRows: true,
            layout: 'fitColumns',
            columns: [{
                    title: "Cant. pedida",
                    field: "cantidad_pedida",
                    width: 80,
                    editor: "number",
                    editorParams: {
                        min: 1,
                        max: 1000
                    },
                    align: "right",
                    cellEdited: function(celda) {
                        _calcularLineaCompra(celda, productos);
                        _calcularTotal(celda.getRow().getTable().getData());
                    }
                },
                {
                    title: "Cant. recibida",
                    field: "cantidad_recibida",
                    width: 80,
                    editor: "number",
                    editorParams: {
                        min: 1,
                        max: 1000
                    },
                    align: "right",
                    cellEdited: function(celda) {
                        _calcularLineaCompra(celda, productos);
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
                        _calcularLineaCompra(celda, productos);
                        _calcularTotal(celda.getRow().getTable().getData());
                    }
                },
                { title: "Vr. Unitario", field: "valor", width: 100, align: "right" },
                { title: "% IVA", field: "iva_porcentaje", width: 100, align: "right" },
                { title: "Vr. IVA", field: "iva_valor", width: 100, align: "right" },
                { title: "Subtotales", field: "subtotal", width: 100, align: "right" },
                { // la última columna incluye un botón para eliminar líneas de compras
                    title: 'Control',
                    headerSort: false,
                    width: 65,
                    align: "center",
                    formatter: (cell, formatterParams) => {
                        // en cada fila, en la última columna, se asignan botones para eliminar las líneas de compra
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

        this.agregarLineaDeCompra();
    }

    /**
     * Configura el oyente de eventos para el botón que permite agregar líneas de compra y
     * lanza el evento tan pronto se carga el formulario, para disponer de una fila inicial.
     */
    agregarLineaDeCompra() {
        let btnAgregar = $('#compra-btnagregar');
        btnAgregar.addEventListener('click', event => {

            let adicionar = true; // pasará a false si encuentra una línea de compra incompleta
            let lineasDecompra = this.tablaCompras.getData();

            lineasDecompra.forEach((lineacompra) => {
                if (!util.esNumero(lineacompra.subtotal)) {
                    adicionar = false;
                }
            });

            if (adicionar) {
                this.tablaCompras.addRow({ cantidad_pedida: 1, cantidad_recibida: 1, producto: '' }, false); // agregar una fila en blanco al final
            } else {
                M.toast({ html: 'Las líneas de compra deben estar completas para poder agregar nuevas líneas' });
            }
        });
        btnAgregar.click();
    }

    /**
     * Calcula y muestra el valor total de la factura y el total de IVA
     * @param {Array} lineasDeCompra Los detalles de la compra
     */
    calcularTotales(lineasDeCompra) {
        let totalFacturado = 0;
        let totalIVA = 0;

        lineasDeCompra.forEach((lineaCompra) => {
            if (util.esNumero(lineaCompra.subtotal)) {
                totalFacturado += lineaCompra.subtotal;
                totalIVA += lineaCompra.iva_valor;
            }
        });

        $('#compra-total').value = totalFacturado;
        $('#compra-iva').value = totalIVA;
        M.updateTextFields();
    }

    /**
     * Actualiza cada detalle de compra con el valor del IVA y del total de la línea de compra
     */
    calcularLineaCompra(celda, productos) {
        let filaActual = celda.getRow().getData();
        let producto = util.buscarProducto(filaActual.producto, productos);

        if (producto) {
            filaActual.valor = producto.precio;
            filaActual.iva_porcentaje = producto.porcentaje_iva;
            filaActual.iva_valor = producto.porcentaje_iva * producto.porcentaje_iva * filaActual.cantidad_recibida;
            filaActual.subtotal = filaActual.cantidad_recibida * producto.precio + filaActual.iva_valor;
            celda.getRow().update(filaActual);
        }
    }

    /**
     * Se envían los datos del front-end al back-end para ser guardados en la base de datos
     */
    registrarCompra() {
        // ensayar los tiempos de espera en servidores lentos para ver si esto es necesario:
        //      $('#compra-registrar').disabled = true;
        //      $('#compra-cancelar').disabled = true;

        let errores = this.validarDatos();
        if (errores) { // la compra no se registra si los datos están incompletos
            M.toast({ html: `No se puede registrar la compra:${errores}` });
            return;
        }

        let compra = {
            fecha_compra: $('#compra-fecha_pedido').value,
            fecha_recibido: $('#compra-fecha_recibido').value,
            proveedor: $('#compra-proveedor').value,
            total: $('#compra-total').value,
            iva: $('#compra-iva').value,
            paga: $('#compra-paga').value,
            adeuda: $('#compra-adeuda').value,
            detalle: this.tablaCompras.getData()
        };

        util.fetchData(util.URL, {
            'method': 'POST',
            'body': {
                clase: 'Compra',
                accion: 'insertar',
                compra: compra
            }
        }).then(data => {
            console.log(data);

            // si todo sale bien se retorna el ID de la compra registrada
            if (data.ok) {
                this.actualizarStock(compra.detalle);
                $('#compra-numero').value = data.id_compra;
                util.mensaje('', '<i class="material-icons">done</i> <p>  compra exitosa</p>', 'teal');
                this.tablaCompras.clearData();
                $('#compra-proveedor').value = '';
                $('#compra-paga').value = '';
                $('#compra-adeuda').value = '';
                $('#compra-total').value = '';
                $('#compra-iva').value = '';
                M.FormSelect.init($('#compra-proveedor'));
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'No se pudo determinar el ID de la siguiente compra');
        });
    }

    /**
     * Actualiza las cantidades disponibles de los productos afectados con la compra
     * @param {Array} lineasDeCompra
     */
    actualizarStock(lineasDeCompra) {
        lineasDeCompra.forEach((lineaCompra) => {
            if (util.esNumero(lineaCompra.subtotal)) {
                let producto = util.buscarProducto(lineaCompra.producto, this.productos);
                producto.cantidad_disponible = producto.cantidad_disponible + lineaCompra.cantidad;
            }
        });
    }

    /**
     * Al pulsar este botón los datos que se estén editando actualmente, se perderán.
     */
    cancelarCompra() {
        this.tablaCompras.clearData();
        $('#compra-proveedor').value = '';
        $('#compra-vendedor').value = '';
        $('#compra-paga').value = '';
        $('#compra-adeuda').value = '';
        $('#compra-total').value = '';
        $('#compra-iva').value = '';
    }

    /**
     * Registra la diferencia entre el total de la compra y lo que paga el cliente.
     * Si lo que paga excede lo adeudado se informa al usuario.
     */
    calcularDeuda() {
        let totalcompra = util.esNumero($('#compra-total').value) ? Number($('#compra-total').value) : 0;
        let paga = util.esNumero($('#compra-paga').value) ? Number($('#compra-paga').value) : 0;
        $('#compra-adeuda').value = totalcompra - paga;
        M.updateTextFields();
        if (paga > totalcompra) {
            M.toast({ html: `El pago ($${paga}) excede el valor de la compra ($${totalcompra})` });
        }
    }

    /**
     * Si faltan datos en las entradas de la compra, devuelve un string informando de las inconsistencias
     */
    validarDatos() {
        let errores = '';

        if (!moment($('#compra-fecha_pedido').value).isValid()) {
            errores += '<br>Fecha inválida';
        }
        if (!moment($('#compra-fecha_recibido').value).isValid()) {
            errores += '<br>Fecha inválida';
        }

        if (!$('#compra-proveedor').value) {
            errores += '<br>Falta seleccionar el proveedor';
        }

        let lineasDecompra = this.tablaCompras.getData();
        if (lineasDecompra.length == 0) {
            errores += '<br>La compra aún no tiene detalles de compra.';
        } else {
            let lineaIncompleta = false;
            lineasDecompra.forEach((lineacompra) => {
                if (!util.esNumero(lineacompra.subtotal)) {
                    lineaIncompleta = true;
                }
            });

            if (lineaIncompleta) {
                errores += '<br>Se encontró al menos un detalle de compra incompleto.';
            }
        }

        if (!util.esNumero($('#compra-paga').value)) {
            errores += '<br>Falta ingresar cuánto pagamos al proveedor o cero si es preciso.';
        }

        return errores;
    }

}