'use strict';

// se crea un nuevo objeto anónimo a partir de una clase anónima
// dicho objeto define la gestión de personal, utilizando el componente 'Tabulator' (http://tabulator.info/)

new class Personal {

    constructor() {

        this.contenedor = '#tabla-personal'; // el div que contendrá la tabla de datos de personal
        this.filasPorPagina = 7;

        this.parametros = { // parámetros que se envían al servidor para mostrar la tabla
            clase: 'Personal',
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
                    this.filaActual = cell.getRow();
                    if (this.operacion === 'actualizar') {
                        this.editarRegistro();
                    } else if (this.operacion === 'eliminar') {
                        this.eliminarRegistro();
                    }
                }
            },
            { title: 'ID Persona', field: 'id_persona' },
            { title: 'Nombre', field: 'nombre', width: 270 },
            { title: 'Teléfono', field: 'telefono' },
            { title: 'Dirección', field: 'direccion' },
            { title: 'Perfil', field: 'perfil' },
            { title: 'Contraseña', field: 'contrasena', visible: false }
        ];

        this.ordenInicial = [ // establece el orden inicial de los datos
            { column: 'nombre', dir: 'asc' }
        ]

        this.indice = 'id_persona'; // estable la PK como índice único para cada fila de la tabla visualizada
        this.tabla = this.generarTabla();
        this.filaActual; // guarda el objeto "fila actual" cuando se elige actualizar o eliminar sobre una fila
        this.operacion; // insertar | actualizar | eliminar

        this.frmEdicionPersonal = M.Modal.init($('#personal-frmedicion'), {
            dismissible: false // impedir el acceso a la aplicación durante la edición
        });

        let listas = document.querySelectorAll('select');
        let objListas = M.FormSelect.init(listas);

        this.gestionarEventos();
    }

    generarTabla() {
        console.log(this.indice);
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
            rowAdded: (row) => this.filaActual = row
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
     * Se asignan los eventos a los botones principales para la gestión de personal
     */
    gestionarEventos() {
        $('#personal-btnagregar').addEventListener('click', event => {
            this.operacion = 'insertar';
            // despliega el formulario para editar personal. Ir a la definición del boton 
            // 'personal-btnagregar' en personal.html para ver cómo se dispara este evento
        });

        $('#personal-btnaceptar').addEventListener('click', event => {
            // dependiendo de la operación elegida cuando se abre el formulario de
            // edición y luego se pulsa en 'Aceptar', se inserta o actualiza un registro.
            if (this.operacion == 'insertar') {
                this.insertarRegistro();
            } else if (this.operacion == 'actualizar') {
                this.actualizarRegistro();
            }
        });

        $('#personal-btncancelar').addEventListener('click', event => {
            this.frmEdicionPersonal.close();
        });
    }

    /**
     * Envía un nuevo registro al back-end para ser insertado en la tabla personal
     */
    insertarRegistro() {
        if (!this.contrasenaOk()) {
            M.toast({ html: 'las contraseñas difieren. Inténtelo de nuevo.' });
            return;
        }
        let lstPerfil = $('#personal-lstperfil');
        // se creas un objeto con los datos del formulario

        let nuevoPersonal = {
            id_persona: $('#personal-txtid_persona').value,
            nombre: $('#personal-txtnombre').value,
            direccion: $('#personal-txtdireccion').value,
            telefono: $('#personal-txttelefono').value,
            perfil: lstPerfil.value,
            contrasena: $('#personal-txtcontrasena1').value,
        };

        // se envían los datos del nuevo personal al back-end y se nuestra la nueva fila en la tabla
        util.fetchData(util.URL, {
            'method': 'POST',
            'body': {
                clase: 'Personal',
                accion: 'insertar',
                data: nuevoPersonal
            }
        }).then(data => {
            if (data.ok) {
                util.mensaje('', '<i class="material-icons">done</i>', 'teal darken');
                this.tabla.addData([nuevoPersonal]);
                $('#personal-txtid_persona').value = '';
                $('#personal-txtnombre').value = '';
                $('#personal-txtdireccion').value = '';
                $('#personal-txttelefono').value = '';
                lstPerfil.value = '';
                $('#personal-txtcontrasena1').value = '';
                this.frmEdicionPersonal.close();
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'Problemas añ insertar el cliente');
        });
    }

    /**
     * despliega el formulario de edición para actualizar el registro de la fila sobre la 
     * que se pulsó el botón actualizar.
     * @param {Row} filaActual Una fila Tabulator con los datos de la fila actual
     */
    editarRegistro() {
        this.frmEdicionPersonal.open();
        // se muestran en el formulario los datos de la fila a editar
        let filaActual = this.filaActual.getData();
        $('#personal-txtid_persona').value = filaActual.id_persona;
        $('#personal-txtnombre').value = filaActual.nombre;
        $('#personal-txtdireccion').value = filaActual.direccion;
        $('#personal-txttelefono').value = filaActual.telefono;
        $('#personal-lstperfil').value = filaActual.perfil;
        $('#personal-txtcontrasena1').value = filaActual.contrasena;
        $('#personal-txtcontrasena2').value = filaActual.contrasena;

        M.updateTextFields();
    }

    /**
     * Envía los datos que se han actualizado de una fila actual, al back-end para ser
     * también actualizados en la base de datos.
     */
    actualizarRegistro() {
        if (!this.contrasenaOk()) {
            M.toast({ html: 'las contraseñas difieren. Inténtelo de nuevo.' });
            return;
        }
        // se crea un objeto con los nuevos datos de la fila modificada
        let idPersonalActual = this.filaActual.getData().id_persona;
        let nuevosDatosPersonal = {
            id_actual: idPersonalActual,
            id_persona: $('#personal-txtid_persona').value, // el posible nuevo ID
            nombre: $('#personal-txtnombre').value,
            direccion: $('#personal-txtdireccion').value,
            telefono: $('#personal-txttelefono').value,
            perfil: $('#personal-lstperfil').value,
            contrasena: $('#personal-txtcontrasena1').value,
        };

        // se envían los datos del nuevo cliente al back-end y se nuestra la nueva fila en la tabla
        util.fetchData(util.URL, {
            'method': 'POST',
            'body': {
                clase: 'Personal',
                accion: 'actualizar',
                data: nuevosDatosPersonal
            }
        }).then(data => {
            if (data.ok) {
                util.mensaje('', '<i class="material-icons">done</i>', 'teal darken');
                delete nuevosDatosPersonal.id_actual; // elimina esta propiedad del objeto, ya no se requiere
                this.tabla.updateRow(idPersonalActual, nuevosDatosPersonal);
                this.frmEdicionPersonal.close();
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'No se pudo insertar el cliente');
        });
    }

    contrasenaOk() {
        if ($('#personal-txtcontrasena1').value.trim()) {
            return $('#personal-txtcontrasena1').value === $('#personal-txtcontrasena2').value;
        } else {
            return false;
        }
    }

    /**
     * Elimina el registro sobre el cual se pulsa el botón respectivo
     * @param {Row} filaActual Una fila Tabulator con los datos de la fila actual
     */
    eliminarRegistro() {
        let filaActual = this.filaActual;
        let idFila = filaActual.getData().id_persona;

        MaterialDialog.dialog( // ver https://github.com/rudmanmrrod/material-dialog
            "Va a eliminar personal de ventas o administrativo. Por favor confirme la acción:", {
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
                            // se envía el ID del cliente al back-end para el eliminado y se actualiza la tabla
                            util.fetchData(util.URL, {
                                'method': 'POST',
                                'body': {
                                    clase: 'Personal',
                                    accion: 'eliminar',
                                    id_persona: idFila
                                }
                            }).then(data => {
                                if (data.ok) {
                                    filaActual.delete();
                                    util.mensaje('', '<i class="material-icons">done</i>', 'teal darken');
                                } else {
                                    throw new Error(data.mensaje);
                                }
                            }).catch(error => {
                                util.mensaje(error, `No se pudo eliminar el cliente con ID ${idFila}`);
                            });
                        }
                    }
                }
            }
        );
    }
}