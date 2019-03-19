'use strict';

new class Venta {

    constructor() {
        this.tablaVentas;

        let instances = M.Datepicker.init($('#venta-fecha'), {
            format: 'yyyy-mm-dd',
            i18n: util.datePickerES,
            defaultDate: new Date()
        });

        this.filasPorPagina = 7;

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
        this.tablaVentas = new Tabulator("#tabla-ventas", {
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
                { title: "Subtotale", field: "subtotal", width: 100, align: "right" },
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
            let lineasDeVenta = this.tablaVentas.getData();

            lineasDeVenta.forEach((lineaVenta) => {
                if (!util.esNumero(lineaVenta.subtotal)) {
                    adicionar = false;
                }
            });

            if (adicionar) {
                this.tablaVentas.addRow({ cantidad: 1, producto: '' }, false); // agregar una fila en blanco al final
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
        let idProducto = filaActual.producto.split('-')[0];
        let producto = productos.lista_completa.find(obj => obj.id_producto == idProducto);

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
            vendedor: util.usuario.id,
            total: $('#venta-total').value,
            iva: $('#venta-iva').value,
            paga: $('#venta-paga').value,
            adeuda: $('#venta-adeuda').value,
            detalle: this.tablaVentas.getData()
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
     * Al pulsar este botón los datos que se estén editando actualmente, se perderán.
     */
    cancelarVenta() {
        this.tablaVentas.clearData();
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

        let lineasDeVenta = this.tablaVentas.getData();
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

}