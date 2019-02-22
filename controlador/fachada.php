<?php

new Controlador();

class Controlador {

    public function __construct() {

        $contenido = '';
        $this->leerConfiguracion();

        try {
            // por seguridad sólo recibir solicitudes por POST, evitar GET
            if ($_SERVER["REQUEST_METHOD"] !== 'POST') {
                throw new Exception("Método de solicitud no permitida");
            }

            $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';

            if ($contentType === "application/json") {
                // recibir el string postdata como venga
                $contenido = trim(file_get_contents("php://input"));
                // decodificarlo a JSON
                $post = json_decode($contenido, true);
            } else {
                $post = $_POST['data'];
            }

            if (is_array($post)) {
                $this->ejecutar($post);
            } else {
                throw new Exception("Error al decodificar los datos:\n" . print_r($post, TRUE));
            }
        } catch (Exception $e) {
            error_log($e->getMessage() . "\n" . print_r($contenido, TRUE));
            echo json_encode(["ok" => FALSE, "mensaje" => $e->getMessage()]);
        }
    }

    private function ejecutar($param) {

        error_log(print_r($param, 1));

        extract($param);
        $static = FALSE;

        // se crea la conexión a la base de datos
        $param['conexion'] = new Conexion();

        // se verifica si se proporcionó un nombre de clase y de método (operación) válidos
        if (!array_key_exists('clase', $param)) {
            throw new Exception("Falta el nombre de la clase");
        }

        if (!array_key_exists('accion', $param)) { //////////////////// actualizar esta parte en el documento
            throw new Exception("Falta el nombre del método");
        }

        // se cargan el archivo que contiene la clase
        spl_autoload_register(function ($clase) {
            if (file_exists("../modelo/$clase.php")) {
                include_once "../modelo/$clase.php";
            } elseif (file_exists("../servicios/util/$clase.php")) {
                $static = TRUE;
                include_once "../servicios/util/$clase.php";
            } else {
                throw new Exception("No existe el archivo $clase.php");
            }
        });

        if (class_exists($clase)) {
            if ($static) {
                $clase::$accion($args);
            } else {
                $obj = new $clase();
                if (method_exists($obj, $accion)) {
                    $obj->{$accion}($param);
                } else {
                    throw new Exception("No existe el método");
                }
            }
        } else {
            throw new Exception("No existe la clase");
        }
    }

    private function leerConfiguracion() {
        define("PATH_APP", $_SERVER['DOCUMENT_ROOT'] . '/demotdb/');

        // iniciar la sesión, solo si no existe. Esto debe ir antes de enviar cualquier cosa al navegador
        date_default_timezone_set('America/Bogota');
        ini_set('display_errors', 'Off');
        ini_set('log_errors', 'On');

        ini_set('error_log', PATH_APP . 'demotdb.log');
        session_start();

        $conexionDB = json_decode(file_get_contents("../servicios/varios/conexion.json"), TRUE);

        define('BASE_DATOS', $conexionDB['BASE_DATOS']);
        define('SERVIDOR', $conexionDB['SERVIDOR']);
        define('PUERTO', $conexionDB['PUERTO']);
        define('USUARIO', $conexionDB['USUARIO']);
        define('CONTRASENA', $conexionDB['CONTRASENA']);

        include_once "../servicios/util/Conexion.php";
        //  require '../vendor/autoload.php'; // si se usa composer
    }

}
