'use strict';

new class Venta {

    constructor() {

        this.tablaVentas = null;
        this.filaActual;

        let elems = document.querySelectorAll('.datepicker');
        var instances = M.Datepicker.init(elems, {
            format: 'yyyy-mm-dd',
            i18n: util.datePickerES
        });

        this.url = './controlador/fachada.php'; // la url del controlador de fachada
        this.filasPorPagina = 7;

        $('#venta-vendedor').value = 'El vendedor autenticado';
        this.inicializarClientes();
    }

    /**
     * Intenta recuperar la lista de clientes y si es posible, inicia la configuración de la venta
     * Si sucede algún error, el formulario de venta no se continúa configurando, por razones obvias.
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
            $('#venta-cliente').value = ''; // ES POSIBLE QUE DEBA MODIFICARSE PARA QUE REFERENCIE A UN CLIENTE ******
            M.FormSelect.init($('#venta-cliente'));
            this.configurarVenta();
        }).catch(error => {
            util.mensaje(error);
        });
    }

    /**
     * Intenta determinar el ID de la siguiente venta y si lo logra inicia la carga del listado de productos vendibles.
     * Si no se puede determinar el número de la siguiente venta, se suspende la configuración del formulario de ventas.
     */
    configurarVenta() {
        util.fetchData(this.url, { // determinar el ID de la siguiente venta
            'method': 'POST',
            'body': {
                clase: 'Venta',
                accion: 'idSiguienteVenta'
            }
        }).then(data => {
            if (data.ok) {
                $('#venta-numero').value = data.id_venta;
                M.updateTextFields(); // ojo con la asincronicidad
                this.crearListaProductos();
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'No se pudo determinar el ID de la siguiente venta');
        });
    }


    /**
     * Intenta cargar la lista de productos que es posible seleccionar para la venta, si sucede 
     * algún error en esta parte, no se continúa configurando el formulario de ventas, si hay
     * éxito, se inicia la creación de una tabla para ingresar las líneas de venta (detalles de venta).
     */
    crearListaProductos() {
        util.fetchData(this.url, {
            'body': {
                'clase': 'Producto',
                'accion': 'listar'
            }
        }).then(productos => {
            if (productos.ok) {
                this.crearLineasDeVenta(productos, this.calcularLineaVenta, this.calcularTotal);
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
                            _calcularLineaVenta(celda, productos);
                            _calcularTotal(celda.getRow().getTable().getData());
                        }
                    }
                }
            ]
        });

        let btnAgregar = $('#venta-btnagregar');
        btnAgregar.addEventListener('click', event => {
            // OJO si, l fila anterior no ha sido completada, NO permitir agregar  **************
            this.operacion = 'insertar';
            this.tablaVentas.addRow({ cantidad: 1, producto: '' }, false); // agregar una fila en blanco al final
        });
        btnAgregar.click();
    }

    calcularTotal(data) {
        let total = 0;
        data.forEach(function(elemento) {
            total += elemento.subtotal;
        });
        $('#venta-total').value = total;
        M.updateTextFields();
    }

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






}