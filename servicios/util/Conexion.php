<?php

/**
 * Manejo de conexiones a bases de datos Postgres mediante PDO
 * Importante:
 *   La instrucción $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
 *   le permite incluir en un try - catch instrucciones que contengan SQL,
 *   y en caso de error lograr observarlo en el log
 *
 * @author Carlos Cuesta Iglesias
 */
class Conexion {

    public $pdo;

    public function __construct() {
        try {
            $this->pdo = new PDO("pgsql:host=" . SERVIDOR . " port=" . PUERTO . " dbname=" . BASE_DATOS, USUARIO, CONTRASENA);
        } catch (PDOException $e) {
            error_log(utf8_encode($e));
            throw new Exception('No se pudo establecer la conexión con la base de datos', $e->getCode());
        }
    }

    /**
     * Devuelve la cantidad de registros producto de una consulta de la forma:
     * $count = UtilConexion::totalFilas($sql);
     * @param string $sql Una consulta de la forma: "SELECT count(*) FROM [tabla|vista] [WHERE condicion]"
     * @return int El número de filas obtenido a partir del SELECT
     */
    public function totalFilas($sql) {
        return $this->pdo->query($sql)->fetchColumn();
    }

    /**
     * Devuelve el estado que reporta el motor de base de datos luego de una transacción
     * Ver http://php.net/manual/es/pdo.errorinfo.php
     * @param object Un objeto de tipo PDO o de tipo PDOStatement según el tipo de instrucción que se esté ejecutando
     * @param boolean $json TRUE por defecto, para indicar que se devuelve una cadena JSON con el estado, FALSE, devuelve un array asociativo con el estado.
     * @return String Un array asociativo o una cadena JSON con el estado de la ejecución.
     */
    public function errorInfo($origen, $json = TRUE) {
        // error_log('¡Pilas! ' . print_r($origen->errorInfo(), TRUE));  // dejar por si se requiere
        if (!($ok = !($origen->errorInfo()[1]))) {
            error_log('¡Pilas! ' . print_r($origen->errorInfo(), TRUE)); // dejar por si se requiere
        }
        $mensaje = '';
        if (strlen($origen->errorInfo()[2]) > 5) {
            $mensaje = substr($origen->errorInfo()[2], 8);
        }
        return $json ? json_encode(['ok' => $ok, 'mensaje' => $mensaje]) : ['ok' => $ok, 'mensaje' => $mensaje];
    }

    /**
     * Busca algo de alguna vista o tabla y devuelve el resultado
     * Ejemplo: $fila = $conexion->getFila("SELECT * FROM mitabla WHERE columna=$id");
     * @param String $param La consulta de selección SQL
     * @return False si no encontró o un array asociativo con los datos de la fila
     */
    public function getFila($sql) {
        if (($resultado = $this->pdo->query($sql))) {
            $fila = $resultado->fetch(PDO::FETCH_ASSOC);
            return $fila ? $fila : FALSE;
        } else {
            return FALSE;
        }
    }

    public function siguiente($param) {
        extract($param);

        $sql = "SELECT * FROM maximo(:tabla, :campo)";
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            if ($instruccion->execute(['tabla' => "$tabla", 'campo' => "$campo"])) {
                $fila = $instruccion->fetch(PDO::FETCH_ASSOC);
                $info = $conexion->errorInfo($instruccion, FALSE);
                $info['siguiente'] = $fila['maximo'] + 1;
                $info['ok'] = $info['siguiente'] > 0;
                echo json_encode($info);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Fallo al determinar el consecutivo']);
        }
    }

}
