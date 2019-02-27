'use strict';

// se crea un nuevo objeto anónimo a partir de una clase anónima
// dicho objeto define la gestión de clientes, utilizando el componente "Tabulator" (http://tabulator.info/)

new class {

    constructor() {

        this.contenedor = "#tabla-clientes"; // el div que contendrá la tabla de datos de clientes
        this.url = "./controlador/fachada.php"; // la url del controlador de fachada
        this.filasPorPagina = 7;

        this.parametros = { // parámetros que se envían al servidor
            clase: 'Cliente',
            accion: 'seleccionar'
        };

        this.columnas = [ // define las columnas de la tabla
            { title: "ID Cliente", field: "id_cliente", editor: "input", width: 100, align: "center" },
            { title: "Nombre", field: "nombre", editor: "input", width: 270 },
            { title: "Dirección", field: "direccion", editor: "input" },
            { title: "Teléfonos", field: "telefonos", editor: "input", align: "center" },
            { title: "Crédito", field: "con_credito", align: "center", width: 90, formatter: "tickCross", cellClick: this.conmutar }
        ];

        this.ordenInicial = [ // establece el orden inicial de los datos
            { column: "nombre", dir: "asc" }
        ]

        this.generarTabla();
        this.gestionarEventos();
    }

    generarTabla() {
        let table = new Tabulator(this.contenedor, {
            ajaxURL: this.url,
            ajaxParams: this.parametros,
            ajaxConfig: "POST", // tipo de solicitud HTTP ajax
            ajaxContentType: "json", // enviar parámetros al servidor como una cadena JSON
            layout: "fitColumns", // ajustar columnas al ancho de la tabla
            responsiveLayout: "hide", // ocultar columnas que no caben en el espacio de trabajola tabla
            tooltips: true, // mostrar mensajes sobre las celdas.
            addRowPos: "top", // al agregar una nueva fila, agréguela en la parte superior de la tabla
            history: true, // permite deshacer y rehacer acciones sobre la tabla.
            pagination: "local", // cómo paginar los datos
            paginationSize: this.filasPorPagina,
            movableColumns: true, // permitir cambiar el orden de las columnas
            resizableRows: true, // permitir cambiar el orden de las filas
            initialSort: this.ordenInicial,
            columns: this.columnas,
        });
    }

    /**
     * Conmuta de verdadero a falso o viceversa, cuando se pulsa clic en una celda que almacena un boolean.
     * Ver columna "crédito"
     * @param {*} evento 
     * @param {*} celda 
     */
    conmutar(evento, celda) {
        let valor = !celda.getValue();
        celda.setValue(valor, true);
    }

    gestionarEventos() {
        $("#clientes-agregar").addEventListener('click', event => {
            $("#clientes-guardar").style.display = 'block';
            $("#clientes-cancelar").style.display = 'block';
            $("#clientes-agregar").style.display = 'none';
            console.log('agregar una fila en blanco');
        });

        $("#clientes-guardar").addEventListener('click', event => {
            // sólo si ok, conmutar estado de visibilidad
            $("#clientes-guardar").style.display = 'none';
            $("#clientes-cancelar").style.display = 'none';
            $("#clientes-agregar").style.display = 'block';
            console.log('enviar los datos para el INSERT');
            // Si falla dejar el estado de visible/invisible como está
        });

        $("#clientes-cancelar").addEventListener('click', event => {
            $("#clientes-guardar").style.display = 'none';
            $("#clientes-cancelar").style.display = 'none';
            $("#clientes-agregar").style.display = 'block';
            console.log('deshacer inserción de nueva fila en la tabla');
        });
    }
}