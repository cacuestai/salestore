'use strict';

// se crea un nuevo objeto anónimo a partir de una clase anónima
// dicho objeto define la gestión de productos, utilizando el componente 'Tabulator' (http://tabulator.info/)

new class Producto {

    constructor() {

        this.contenedor = '#tabla-productos'; // el div que contendrá la tabla de datos de productos
        this.filasPorPagina = 7;

        this.parametros = { // parámetros que se envían al servidor para mostrar la tabla
            clase: 'Producto',
            accion: 'seleccionar'
        };

        this.columnas = [ // este array de objetos define las columnas de la tabla
            { // la primera columna incluye los botones para actualizar y eliminar
                title: 'Control',
                headerSort: false,
                width: 65,
                align: "center",
                formatter: (cell, formatterParams) => {
                    // en cada fila, en la primera columna, se asignan los botones de editar y actualizar 
                    return `<i id="tabulator-btnactualizar" class="material-icons teal-text">edit</i>
                            <i id="tabulator-btneliminar" class="material-icons deep-orange-text">delete</i>`;
                },
                cellClick: (e, cell) => {
                    // define qué hacer si se pulsan los botones de actualizar o eliminar
                    this.operacion = e.target.id === 'tabulator-btnactualizar' ? 'actualizar' : 'eliminar';
                    this.filaActual = cell.getRow(); // se obtienen los datos correctamente

                    if (this.operacion === 'actualizar') {
                        this.editarRegistro();
                    } else if (this.operacion === 'eliminar') {
                        this.eliminarRegistro();
                    }
                }
            },
            { title: 'ID', field: 'id_producto', align: 'center', visible: false },
            { field: 'id_presentacion_producto', visible: false },
            { field: 'id_categoria_producto', visible: false },
            { title: 'Categoría', field: 'categoria', width: 100 },
            { title: 'Presentación', field: 'presentacion', width: 100 },
            { title: 'Nombre', field: 'nombre', width: 200 },
            { title: 'Precio', field: 'precio', align: 'right', formatter: "money" },
            { title: 'IVA', field: 'porcentaje_iva', align: 'right', formatter: "money" },
            { title: 'Disponible', field: 'cantidad_disponible', align: 'center', width: 70 },
            { title: 'Mínimo', field: 'cantidad_minima', align: 'center', width: 70 },
            { title: 'Máximo', field: 'cantidad_maxima', align: 'center', width: 70 }
        ];

        this.ordenInicial = [ // establece el orden inicial de los datos
            { column: 'nombre', dir: 'asc' }
        ]

        this.indice = 'id_producto'; // estable la PK como índice único para cada fila de la tabla visualizada
        this.tabla = this.generarTabla();
        this.filaActual; // guarda el objeto "fila actual" cuando se elige actualizar o eliminar sobre una fila
        this.operacion; // insertar | actualizar | eliminar

        this.frmEdicionProducto = M.Modal.init($('#producto-frmedicion'), {
            dismissible: false, // impedir el acceso a la aplicación durante la edición
            onOpenStart: () => {
                // ... es posible que desee limpiar los campos aquí y no en insertarRegistro() como está actualmente ...
                let idCategoria = '';
                let idPresentacion = '';
                if (this.operacion === 'actualizar') {
                    // cuando se edita, estos ID se requieren para seleccionar los elementos de las listas de categorías y de presentaciones
                    idCategoria = this.filaActual.getData().id_categoria_producto;
                    idPresentacion = this.filaActual.getData().id_presentacion_producto;
                }

                util.cargarLista({ // llenar los elementos de la lista desplegable de categorías de productos
                    clase: 'CategoriaProducto',
                    accion: 'listar',
                    listaSeleccionable: '#producto-lstcategoria',
                    clave: 'id_categoria_producto',
                    valor: 'nombre',
                    primerItem: 'Seleccione una categoría de producto'
                }).then(data => {
                    console.log('cargadas las categorías');
                    $('#producto-lstcategoria').value = idCategoria; // se asignó si la operación es actualizar
                    M.FormSelect.init($('#producto-lstcategoria'));
                }).catch(error => {
                    util.mensaje(error);
                });

                util.cargarLista({ // llenar los elementos de la lista desplegable de presentaciones de productos
                    clase: 'PresentacionProducto',
                    accion: 'listar',
                    listaSeleccionable: '#producto-lstpresentacion',
                    clave: 'id_presentacion_producto',
                    valor: 'descripcion',
                    primerItem: 'Seleccione una presentación de producto'
                }).then(data => {
                    console.log('cargadas las presentaciones');
                    $('#producto-lstpresentacion').value = idPresentacion;
                    M.FormSelect.init($('#producto-lstpresentacion'));
                }).catch(error => {
                    util.mensaje(error);
                });
            }
        });

        this.gestionarEventos();
    }

    generarTabla() {
        return new Tabulator(this.contenedor, {
            ajaxURL: util.URL,
            ajaxParams: this.parametros,
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
            initialSort: this.ordenInicial,
            columns: this.columnas,
            // addRowPos: 'top', // no se usa aquí. Aquí se usa un formulario de edición personalizado
            index: this.indice, // indice único de cada fila
            // locale: true, // se supone que debería utilizar el idioma local
            rowAdded: (row) => this.filaActual = row,
            locale: "es", // idioma. Ver script de utilidades
            langs: util.tabulatorES // ver script de utilidades
        });
    }

    /**
     * Conmuta de verdadero a falso o viceversa, cuando se pulsa clic en una celda que almacena un boolean.
     * Importante: ** no actualiza los cambios en la base de datos **
     * Ver columna 'crédito'
     * @param {*} evento 
     * @param {*} celda 
     */
    conmutar(evento, celda) {
        let valor = !celda.getValue();
        celda.setValue(valor, true);
    }

    /**
     * Se asignan los eventos a los botones principales para la gestión de productos
     */
    gestionarEventos() {
        $('#producto-btnagregar').addEventListener('click', event => {
            this.operacion = 'insertar';
        });

        $('#producto-btnaceptar').addEventListener('click', event => {
            // dependiendo de la operación elegida cuando se abre el formulario de
            // edición y luego se pulsa en 'Aceptar', se inserta o actualiza un registro.
            if (this.operacion == 'insertar') {
                this.insertarRegistro();
            } else if (this.operacion == 'actualizar') {
                this.actualizarRegistro();
            }
            this.frmEdicionProducto.close();
        });

        $('#producto-btncancelar').addEventListener('click', event => {
            this.frmEdicionProducto.close();
        });

        $('#producto-chkid').addEventListener("click", event => {
            this.tabla.toggleColumn("id_producto");
        });
    }

    /**
     * Envía un nuevo registro al back-end para ser insertado en la tabla productos
     */
    insertarRegistro() {
        // se creas un objeto con los datos del formulario
        let lstCategorias = $('#producto-lstcategoria');
        let lstPresentacion = $('#producto-lstpresentacion');

        let nuevoProducto = {
            presentacion: lstPresentacion.options[lstPresentacion.selectedIndex].text,
            categoria: lstCategorias.options[lstCategorias.selectedIndex].text,
            cantidad_disponible: $('#producto-txtcantidad').value,
            id_presentacion_producto: lstPresentacion.value,
            cantidad_minima: $('#producto-txtminimo').value,
            cantidad_maxima: $('#producto-txtmaximo').value,
            id_categoria_producto: lstCategorias.value,
            nombre: $('#producto-txtnombre').value,
            precio: $('#producto-txtprecio').value,
            iva: $('#producto-txtiva').value
        };

        // se envían los datos del nuevo producto al back-end y se nuestra la nueva fila en la tabla
        util.fetchData(util.URL, {
            'method': 'POST',
            'body': {
                clase: this.parametros.clase,
                accion: 'insertar',
                data: nuevoProducto
            }
        }).then(data => {
            if (data.ok) {
                util.mensaje('', '<i class="material-icons">done</i>', 'teal darken');
                nuevoProducto['id_producto'] = data.id_producto;
                this.tabla.addData([nuevoProducto]);
                $('#producto-lstpresentacion').value = '';
                $('#producto-lstcategoria').value = '';
                $('#producto-txtnombre').value = '';
                $('#producto-txtprecio').value = '';
                $('#producto-txtiva').value = '';
                $('#producto-txtcantidad').value = '';
                $('#producto-txtminimo').value = '';
                $('#producto-txtmaximo').value = '';
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'No se pudo insertar el producto');
        });
    }

    /**
     * despliega el formulario de edición para actualizar el registro de la fila sobre la 
     * que se pulsó el botón actualizar.
     * @param {Row} filaActual Una fila Tabulator con los datos de la fila actual
     */
    editarRegistro() {
        // un buen ejemplo de asincronicidad
        this.frmEdicionProducto.open();
        $('#producto-txtnombre').value = this.filaActual.getData().nombre;
        $('#producto-txtprecio').value = this.filaActual.getData().precio;
        $('#producto-txtiva').value = this.filaActual.getData().iva;
        $('#producto-txtcantidad').value = this.filaActual.getData().cantidad_disponible;
        $('#producto-txtminimo').value = this.filaActual.getData().cantidad_minima;
        $('#producto-txtmaximo').value = this.filaActual.getData().cantidad_maxima;
        M.updateTextFields();
        console.log('actualizado el resto de campos');
    }

    /**
     * Envía los datos que se han actualizado de una fila actual, al back-end para ser
     * también actualizados en la base de datos.
     */
    actualizarRegistro() {
        let lstCategorias = $('#producto-lstcategoria');
        let lstPresentacion = $('#producto-lstpresentacion');
        let idProductoActual = this.filaActual.getData().id_producto;

        // se crea un objeto con los nuevos datos de la fila modificada
        let nuevosDatosProducto = {
            id_actual: idProductoActual,
            presentacion: lstPresentacion.options[lstPresentacion.selectedIndex].text,
            categoria: lstCategorias.options[lstCategorias.selectedIndex].text,
            cantidad_disponible: $('#producto-txtcantidad').value,
            id_presentacion_producto: lstPresentacion.value,
            cantidad_minima: $('#producto-txtminimo').value,
            cantidad_maxima: $('#producto-txtmaximo').value,
            id_categoria_producto: lstCategorias.value,
            nombre: $('#producto-txtnombre').value,
            precio: $('#producto-txtprecio').value,
            iva: $('#producto-txtiva').value
        };

        // se envían los datos del nuevo producto al back-end y se nuestra la nueva fila en la tabla
        util.fetchData(util.URL, {
            'method': 'POST',
            'body': {
                clase: this.parametros.clase,
                accion: 'actualizar',
                data: nuevosDatosProducto
            }
        }).then(data => {
            if (data.ok) {
                util.mensaje('', '<i class="material-icons">done</i>', 'teal darken');
                delete nuevosDatosProducto.id_actual; // elimina esta propiedad del objeto, ya no se requiere
                this.tabla.updateRow(idProductoActual, nuevosDatosProducto);
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'No se pudo actualizar el producto');
        });
    }

    /**
     * Elimina el registro sobre el cual se pulsa el botón respectivo
     * @param {Row} filaActual Una fila Tabulator con los datos de la fila actual
     */
    eliminarRegistro() {
        let filaActual = this.filaActual;

        MaterialDialog.dialog( // ver https://github.com/rudmanmrrod/material-dialog
            "Va a eliminar un producto. Por favor confirme la acción:", {
                title: 'Cuidado',
                dismissible: false,
                buttons: {
                    close: {
                        className: 'red darken-4',
                        text: 'Cancelar',
                    },
                    confirm: {
                        className: 'teal',
                        text: 'Confirmar',
                        callback: () => {
                            let idFila = filaActual.getData().id_producto;

                            // se envía el ID del producto al back-end para el eliminado y se actualiza la tabla
                            util.fetchData(util.URL, {
                                'method': 'POST',
                                'body': {
                                    clase: 'Producto',
                                    accion: 'eliminar',
                                    id_producto: idFila
                                }
                            }).then(data => {
                                if (data.ok) {
                                    filaActual.delete();
                                    util.mensaje('', '<i class="material-icons">done</i>', 'teal darken');
                                } else {
                                    throw new Error(data.mensaje);
                                }
                            }).catch(error => {
                                util.mensaje(error, `No se pudo eliminar el producto con ID ${idFila}`);
                            });
                        }
                    }
                }
            }
        );
    }
}