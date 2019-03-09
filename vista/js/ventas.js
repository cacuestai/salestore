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

        this.contenedor = '#tabla-ventas'; // el div que contendrá la tabla de datos de clientes
        this.url = './controlador/fachada.php'; // la url del controlador de fachada
        this.filasPorPagina = 7;

        this.parametros = { // parámetros que se envían al servidor para mostrar la tabla
            clase: 'Venta',
            accion: 'seleccionar'
        };

        util.cargarLista({ // llenar los elementos de la lista desplegable de clientes
            clase: 'Cliente',
            accion: 'listar',
            listaSeleccionable: '#venta-cliente',
            clave: 'id_cliente',
            valor: 'nombre',
            primerItem: 'Seleccione un cliente'
        }).then(data => {
            $('#venta-cliente').value = ''; // ES POSIBLE QUE DEBA MODIFICARSE PARA QUE REFERENCIE A UN CLIENTE ******
            M.FormSelect.init($('#venta-cliente'));

            util.fetchData('./controlador/fachada.php', { // determinar el ID de la siguiente venta
                'method': 'POST',
                'body': {
                    clase: this.parametros.clase,
                    accion: 'idSiguienteVenta'
                }
            }).then(data => {
                if (data.ok) {
                    $('#venta-numero').value = data.id_venta;
                    M.updateTextFields(); // ojo con la asincronicidad

                    util.fetchData('./controlador/fachada.php', {
                        'body': {
                            'clase': 'Producto',
                            'accion': 'listar'
                        }
                    }).then(data => {
                        if (data.ok) {
                            console.log(data.lista_completa);

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
                                        align: "right"
                                    },
                                    {
                                        title: "Descripción de productos",
                                        field: "producto",
                                        editor: "autocomplete",
                                        editorParams: {
                                            values: data.lista_minima,
                                        },
                                        cellEdited: function(cell) {
                                            this.filaActual = cell.getRow().getData();
                                            let idProducto = this.filaActual.producto.split('-')[0];
                                            let producto = data.lista_completa.find(obj => obj.id_producto == idProducto);
                                            this.filaActual.valor = producto.precio;
                                            this.filaActual.iva_porcentaje = producto.porcentaje_iva;
                                            this.filaActual.iva_valor = producto.porcentaje_iva * producto.porcentaje_iva * this.filaActual.cantidad;
                                            this.filaActual.subtotal = this.filaActual.cantidad * producto.precio + this.filaActual.iva_valor;
                                            console.log(this.filaActual);
                                            cell.getRow().update(this.filaActual);
                                        },
                                    },
                                    { title: "Vr. Unitario", field: "valor", width: 100, align: "right" },
                                    { title: "% IVA", field: "iva_porcentaje", width: 100, align: "right" },
                                    { title: "Vr. IVA", field: "iva_valor", width: 100, align: "right" },
                                    { title: "Subtotale", field: "subtotal", width: 100, align: "right" }
                                ],
                            });

                            let btnAgregar = $('#venta-btnagregar');
                            btnAgregar.addEventListener('click', event => {
                                this.operacion = 'insertar';
                                this.tablaVentas.addRow({ cantidad: 1, producto: '' }, false); // agregar una fila en blanco al final
                            });
                            btnAgregar.click();
                        } else {
                            throw new Error(data.mensaje);
                        }
                    });
                } else {
                    throw new Error(data.mensaje);
                }
            }).catch(error => {
                util.mensaje(error, 'No se pudo determinar el ID de la siguiente venta');
            });

        }).catch(error => {
            util.mensaje(error);
        });

        $('#venta-vendedor').value = 'El vendedor autenticado';
    }

}