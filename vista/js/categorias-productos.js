'use strict';

// se crea un nuevo objeto anónimo a partir de una clase anónima
// dicho objeto define la gestión de categorías, utilizando el componente 'Tabulator' (http://tabulator.info/)

new class CategoriaProducto {

    constructor() {

        this.contenedor = '#tabla-categorias'; // el div que contendrá la tabla de datos de categorias
        this.filasPorPagina = 7;

        this.parametros = { // parámetros que se envían al servidor para mostrar la tabla
            clase: 'CategoriaProducto',
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
            { title: 'ID', field: 'id_categoria_producto', align: 'center', visible: false },
            { title: 'Nombre de la categoria', field: 'nombre' }
        ];

        this.ordenInicial = [ // establece el orden inicial de los datos
            { column: 'nombre', dir: 'asc' }
        ]

        this.indice = 'id_categoria_producto'; // estable la PK como índice único para cada fila de la tabla visualizada
        this.tabla = this.generarTabla();
        this.filaActual; // guarda el objeto "fila actual" cuando se elige actualizar o eliminar sobre una fila
        this.operacion; // insertar | actualizar | eliminar

        this.frmEdicionCategoria = M.Modal.init($('#categoria-frmedicion'), {
            dismissible: false, // impedir el acceso a la aplicación durante la edición
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
        $('#categoria-btnagregar').addEventListener('click', event => {
            this.operacion = 'insertar';
        });

        $('#categoria-btnaceptar').addEventListener('click', event => {
            // dependiendo de la operación elegida cuando se abre el formulario de
            // edición y luego se pulsa en 'Aceptar', se inserta o actualiza un registro.
            if (this.operacion == 'insertar') {
                this.insertarRegistro();
            } else if (this.operacion == 'actualizar') {
                this.actualizarRegistro();
            }
        });

        $('#categoria-btncancelar').addEventListener('click', event => {
            this.frmEdicionCategoria.close();
        });

        $('#categoria-chkid').addEventListener("click", event => {
            this.tabla.toggleColumn("id_categoria_producto");
        });
    }

    /**
     * Envía un nuevo registro al back-end para ser insertado en la tabla productos
     */
    insertarRegistro() {
        let categoria = $('#categoria-txtnombre').value.trim();
        if (!categoria) {
            M.toast({ html: 'Falta la descripción de la categoría' });
            return;
        }
        // se envían los datos del nuevo producto al back-end y se nuestra la nueva fila en la tabla
        util.fetchData(util.URL, {
            'method': 'POST',
            'body': {
                clase: this.parametros.clase,
                accion: 'insertar',
                categoria: categoria
            }
        }).then(data => {
            if (data.ok) {
                util.mensaje('', '<i class="material-icons">done</i>', 'teal darken');
                this.tabla.addData([{
                    id_categoria_producto: data.id_categoria,
                    nombre: categoria
                }]);
                $('#categoria-txtnombre').value = '';
                this.frmEdicionCategoria.close();
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
        this.frmEdicionCategoria.open();
        $('#categoria-txtnombre').value = this.filaActual.getData().nombre;
        M.updateTextFields();
    }

    /**
     * Envía los datos que se han actualizado de una fila actual, al back-end para ser
     * también actualizados en la base de datos.
     */
    actualizarRegistro() {
        let categoria = $('#categoria-txtnombre').value.trim();
        if (!categoria) {
            M.toast({ html: 'Falta la descripción de la categoría' });
            return;
        }
        let idCategoriaActual = this.filaActual.getData().id_categoria_producto;

        // se crea un objeto con los nuevos datos de la fila modificada
        let nuevosDatosCategoria = {
            id_actual: idCategoriaActual,
            nombre: categoria,
        };

        // se envían los datos del nuevo producto al back-end y se nuestra la nueva fila en la tabla
        util.fetchData(util.URL, {
            'method': 'POST',
            'body': {
                clase: this.parametros.clase,
                accion: 'actualizar',
                data: nuevosDatosCategoria
            }
        }).then(data => {
            if (data.ok) {
                util.mensaje('', '<i class="material-icons">done</i>', 'teal darken');
                delete nuevosDatosCategoria.id_actual; // elimina esta propiedad del objeto, ya no se requiere
                this.tabla.updateRow(idCategoriaActual, nuevosDatosCategoria);
                this.frmEdicionCategoria.close();
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'No se pudo actualizar la categoría del producto');
        });
    }

    /**
     * Elimina el registro sobre el cual se pulsa el botón respectivo
     * @param {Row} filaActual Una fila Tabulator con los datos de la fila actual
     */
    eliminarRegistro() {
        let filaActual = this.filaActual;
        let idFila = filaActual.getData().id_categoria_producto;

        MaterialDialog.dialog( // ver https://github.com/rudmanmrrod/material-dialog
            "Va a eliminar una categoría de producto. Por favor confirme la acción:", {
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
                                    clase: 'CategoriaProducto',
                                    accion: 'eliminar',
                                    id_categoria: idFila
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