'use strict';

// se crea un nuevo objeto anónimo a partir de una clase anónima
// dicho objeto define la gestión de clientes, utilizando el componente 'Tabulator' (http://tabulator.info/)

new class Cliente {

    constructor() {

        this.contenedor = '#tabla-clientes'; // el div que contendrá la tabla de datos de clientes
        this.url = './controlador/fachada.php'; // la url del controlador de fachada
        this.filasPorPagina = 7;

        this.parametros = { // parámetros que se envían al servidor
            clase: 'Cliente',
            accion: 'seleccionar'
        };

        this.columnas = [ // define las columnas de la tabla
            {
                title: 'Control',
                formatter: this.control,
                width: 85,
                align: "center",
                cellClick: (e, cell) => {
                    this.operacion = e.target.id === 'tabulator-btnactualizar' ? 'actualizar' : 'eliminar';
                    this.filaActual = cell.getRow();
                    if (this.operacion === 'actualizar') {
                        this.editarRegistro();
                    } else if (this.operacion === 'eliminar') {
                        this.eliminarRegistro();
                    }
                }
            },
            { title: 'ID Cliente', field: 'id_cliente', editor: 'input', width: 100, align: 'center' },
            { title: 'Nombre', field: 'nombre', editor: 'input', width: 270 },
            { title: 'Dirección', field: 'direccion', editor: 'input' },
            { title: 'Teléfonos', field: 'telefonos', editor: 'input', align: 'center' },
            { title: 'Crédito', field: 'con_credito', align: 'center', width: 90, formatter: 'tickCross', cellClick: this.conmutar }
        ];

        this.ordenInicial = [ // establece el orden inicial de los datos
            { column: 'nombre', dir: 'asc' }
        ]

        this.tabla = this.generarTabla();
        this.filaActual;
        this.indice = 'id_cliente';
        this.operacion; // insertar | actualizar 

        this.frmEdicionCliente = M.Modal.init($('#cliente-frmedicion'), {
            dismissible: false, // impedir el acceso a la aplicación durante la autenticación
            onOpenStart: () => {
                // luego miraremos para que sirve esta belleza
                console.log(this.operacion);
            }
        });

        this.gestionarEventos();
    }

    generarTabla() {
        return new Tabulator(this.contenedor, {
            ajaxURL: this.url,
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
            addRowPos: 'top',
            index: this.indice, // indice único de cada fila
            rowAdded: (row) => this.filaActual = row
        });
    }

    /**
     * Conmuta de verdadero a falso o viceversa, cuando se pulsa clic en una celda que almacena un boolean.
     * Ver columna 'crédito'
     * @param {*} evento 
     * @param {*} celda 
     */
    conmutar(evento, celda) {
        let valor = !celda.getValue();
        celda.setValue(valor, true);
    }

    /**
     * Se asignan los eventos a los botones principales para la gestión de clientes
     */
    gestionarEventos() {
        $('#cliente-btnagregar').addEventListener('click', event => {
            this.operacion = 'insertar';
        });

        $('#cliente-btnaceptar').addEventListener('click', event => {
            // enviar los datos de inserción/actualización al back-end y si ok...
            // actualizar la fila en la tabla SI es una actualización

            if (this.operacion == 'insertar') {
                this.insertarRegistro();
            } else if (this.operacion == 'actualizar') {
                this.actualizarRegistro();
            }

            this.frmEdicionCliente.close();
        });

        $('#cliente-btncancelar').addEventListener('click', event => {
            this.frmEdicionCliente.close();
        });
    }

    /**
     * Envía un nuevo registro al back-end para ser insertado en la tabla clientes
     */
    insertarRegistro() {
        let nuevoCliente = {
            id_cliente: $('#cliente-txtid').value,
            nombre: $('#cliente-txtnombre').value,
            direccion: $('#cliente-txtdireccion').value,
            telefonos: $('#cliente-txttelefonos').value,
            con_credito: $('#cliente-chkcredito').checked
        };

        // se envían los datos del nuevo cliente al back-end y se nuestra la nueva fila en la tabla
        util.fetchData('./controlador/fachada.php', {
            'method': 'POST',
            'body': {
                clase: 'Cliente',
                accion: 'insertar',
                data: nuevoCliente
            }
        }).then(data => {
            if (data.ok) {
                util.mensaje('', '<i class="material-icons">done</i>', 'teal darken');
                this.tabla.addData([nuevoCliente]);
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'No se pudo insertar el cliente');
        });
    }

    /**
     * Permite actualizar el registro sobre el cual se pulsa el botón respectivo
     * @param {Row} filaActual Una fila Tabulator con los datos de la fila actual
     */
    editarRegistro() {
        let filaActual = this.filaActual.getData();
        this.frmEdicionCliente.open();
        $('#cliente-txtid').value = filaActual.id_cliente;
        $('#cliente-txtnombre').value = filaActual.nombre;
        $('#cliente-txtdireccion').value = filaActual.direccion;
        $('#cliente-txttelefonos').value = filaActual.telefonos;
        $('#cliente-chkcredito').checked = filaActual.con_credito;
        M.updateTextFields();
    }

    actualizarRegistro() {
        let idClienteActual = this.filaActual.getData().id_cliente;

        let nuevosDatosCliente = {
            id_actual: idClienteActual,
            id_cliente: $('#cliente-txtid').value,
            nombre: $('#cliente-txtnombre').value,
            direccion: $('#cliente-txtdireccion').value,
            telefonos: $('#cliente-txttelefonos').value,
            con_credito: $('#cliente-chkcredito').checked
        };

        // se envían los datos del nuevo cliente al back-end y se nuestra la nueva fila en la tabla
        util.fetchData('./controlador/fachada.php', {
            'method': 'POST',
            'body': {
                clase: 'Cliente',
                accion: 'actualizar',
                data: nuevosDatosCliente
            }
        }).then(data => {
            if (data.ok) {
                util.mensaje('', '<i class="material-icons">done</i>', 'teal darken');
                delete nuevosDatosCliente.id_actual;
                this.tabla.addData([nuevosDatosCliente]);
                this.tabla.updateRow(idClienteActual, nuevosDatosCliente);
            } else {
                throw new Error(data.mensaje);
            }
        }).catch(error => {
            util.mensaje(error, 'No se pudo insertar el cliente');
        });

    }

    /**
     * Permite eliminar el registro sobre el cual se pulsa el botón respectivo
     * @param {Row} filaActual Una fila Tabulator con los datos de la fila actual
     */
    eliminarRegistro() {
        let idFila = this.filaActual.getData().id_cliente;

        // se envía el ID del cliente al back-end y se actualiza la tabla
        util.fetchData('./controlador/fachada.php', {
            'method': 'POST',
            'body': {
                clase: 'Cliente',
                accion: 'eliminar',
                id_cliente: idFila
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

    /**
     * Se usa en el array this.columnas para agregar una columna con iconos que representan
     * las acciones actualizar y eliminar
     */
    control(cell, formatterParams) {
        let controles = `<i id="tabulator-btnactualizar" class="material-icons">edit</i>
                         <i id="tabulator-btneliminar" class="material-icons">delete</i>`;
        return controles;
    }

    // /**
    //  * Se usa en el array this.columnas para establecer las acciones cuando se pulsa clic sobre 
    //  * los botones actualizar o eliminar, dispuestos en cada fila
    //  */
    // acciones(e, cell) {
    //     this.operacion = e.target.id === 'tabulator-btnactualizar' ? 'actualizar' : 'eliminar';
    //     if (this.operacion === 'actualizar') {
    //         this.editarRegistro(cell.getRow().getData());
    //     } else if (this.operacion === 'eliminar') {
    //         this.eliminarRegistro(cell.getRow());
    //     }
    // }

}