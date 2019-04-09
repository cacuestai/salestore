'use strict';

// se crea un nuevo objeto anónimo a partir de una clase anónima
// dicho objeto define la gestión de categorías, utilizando el componente 'Tabulator' (http://tabulator.info/)

new class PresentacionProducto {

    constructor() {

        this.contenedor = '#tabla-presentaciones'; // el div que contendrá la tabla de datos de presentaciones
        this.filasPorPagina = 7;

        this.parametros = { // parámetros que se envían al servidor para mostrar la tabla
            clase: 'PresentacionProducto',
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
            { title: 'ID', field: 'id_presentacion_producto', align: 'center', visible: false },
            { title: 'Presentaciones de productos', field: 'descripcion' }
        ];

        this.ordenInicial = [ // establece el orden inicial de los datos
            { column: 'descripcion', dir: 'asc' }
        ]

        this.indice = 'id_presentacion_producto'; // estable la PK como índice único para cada fila de la tabla visualizada
        this.tabla = this.generarTabla();
        this.filaActual; // guarda el objeto "fila actual" cuando se elige actualizar o eliminar sobre una fila
        this.operacion; // insertar | actualizar | eliminar

        this.frmEdicionPresentacion = M.Modal.init($('#presentacion-frmedicion'), {
            dismissible: false // impedir el acceso a la aplicación durante la edición
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
        $('#presentacion-btnagregar').addEventListener('click', event => {
            this.operacion = 'insertar';
        });

        $('#presentacion-btnaceptar').addEventListener('click', event => {
            // dependiendo de la operación elegida cuando se abre el formulario de
            // edición y luego se pulsa en 'Aceptar', se inserta o actualiza un registro.
            if (this.operacion == 'insertar') {
                this.insertarRegistro();
            } else if (this.operacion == 'actualizar') {
                this.actualizarRegistro();
            }
        });

        $('#presentacion-btncancelar').addEventListener('click', event => {
            this.frmEdicionPresentacion.close();
        });

        $('#presentacion-chkid').addEventListener("click", event => {
            this.tabla.toggleColumn("id_presentacion_producto");
        });
    }

    /**
     * Envía un nuevo registro al back-end para ser insertado en la tabla productos
     */
    insertarRegistro() {
        // se envían los datos del nuevo producto al back-end y se nuestra la nueva fila en la tabla
        util.fetchData(util.URL, {
            'method': 'POST',
            'body': {
                clase: this.parametros.clase,
                accion: 'insertar',
                presentacion: $('#presentacion-txtdescripcion').value
            }
        }).then(data => {
            if (data.ok) {
                util.mensaje('', '<i class="material-icons">done</i>', 'teal darken');

                this.tabla.addData([{
                    id_presentacion_producto: data.id_presentacion,
                    descripcion: $('#presentacion-txtdescripcion').value
                }]);
                $('#presentacion-txtdescripcion').value = '';
                this.frmEdicionPresentacion.close();
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'No se pudo insertar la categoría del producto');
        });
    }

    /**
     * despliega el formulario de edición para actualizar el registro de la fila sobre la 
     * que se pulsó el botón actualizar.
     * @param {Row} filaActual Una fila Tabulator con los datos de la fila actual
     */
    editarRegistro() {
        this.frmEdicionPresentacion.open();
        $('#presentacion-txtdescripcion').value = this.filaActual.getData().descripcion;
        M.updateTextFields();
    }

    /**
     * Envía los datos que se han actualizado de una fila actual, al back-end para ser
     * también actualizados en la base de datos.
     */
    actualizarRegistro() {
        let idPresentacionActual = this.filaActual.getData().id_presentacion_producto;

        // se crea un objeto con los nuevos datos de la fila modificada
        let nuevosDatosPresentacion = {
            id_actual: idPresentacionActual,
            descripcion: $('#presentacion-txtdescripcion').value
        };

        // se envían los datos del nuevo producto al back-end y se nuestra la nueva fila en la tabla
        util.fetchData(util.URL, {
            'method': 'POST',
            'body': {
                clase: this.parametros.clase,
                accion: 'actualizar',
                data: nuevosDatosPresentacion
            }
        }).then(data => {
            if (data.ok) {
                util.mensaje('', '<i class="material-icons">done</i>', 'teal darken');
                delete nuevosDatosPresentacion.id_actual; // elimina esta propiedad del objeto, ya no se requiere
                this.tabla.updateRow(idPresentacionActual, nuevosDatosPresentacion);
                this.frmEdicionPresentacion.close();
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'No se pudo actualizar la presentación del producto');
        });
    }

    /**
     * Elimina el registro sobre el cual se pulsa el botón respectivo
     * @param {Row} filaActual Una fila Tabulator con los datos de la fila actual
     */
    eliminarRegistro() {
        let filaActual = this.filaActual;
        let idFila = filaActual.getData().id_presentacion_producto;

        MaterialDialog.dialog( // ver https://github.com/rudmanmrrod/material-dialog
            "Va a eliminar una presentación de producto. Por favor confirme la acción:", {
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
                            // se envía el ID del producto al back-end para el eliminado y se actualiza la tabla
                            util.fetchData(util.URL, {
                                'method': 'POST',
                                'body': {
                                    clase: 'PresentacionProducto',
                                    accion: 'eliminar',
                                    id_presentacion: idFila
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