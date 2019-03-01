<?php

class Cliente {

    /**
     * Devuelve una cadena JSON que contiene el resultado de seleccionar todos los clientes guardados
     * Se usa PDO. Ver https://diego.com.es/tutorial-de-pdo
     */
    public function seleccionar($param) {
        extract($param);
        $sql = "SELECT id_cliente, nombre, telefonos, direccion, con_credito
                   FROM clientes
                ORDER BY nombre";
        // prepara la instrucción SQL para ejecutarla, luego recibir los parámetros de filtrado
        $q = $conexion->pdo->prepare($sql);
        $q->execute();
        $filas = $q->fetchAll(PDO::FETCH_ASSOC); // devuelve un array que contiene todas las filas del conjunto de resultados
        echo json_encode($filas); // las filas resultantes son enviadas en formato JSON al frontend
    }

    /**
     * Inserta un registro de clientes en la base de datos
     */
    public function insertar($param) {
        extract($param);
        // error_log(print_r($param, TRUE)); // quitar comentario para ver lo que se recibe del front-end

        $sql = "INSERT INTO clientes (id_cliente, nombre, direccion, telefonos, con_credito)
                   VALUES (:id_cliente, :nombre, :direccion, :telefonos, :con_credito)";

        // Prepara la instrucción SQL para ejecutarla luego de recibir los parámetros de inserción
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            $instruccion->bindParam(':id_cliente', $data['id_cliente']);
            $instruccion->bindParam(':nombre', $data['nombre']);
            $instruccion->bindParam(':direccion', $data['direccion']);
            $instruccion->bindParam(':telefonos', $data['telefonos']);
            // para datos distintos a string, especificar el tipo: http://php.net/manual/es/pdo.constants.php
            $instruccion->bindParam(':con_credito', $data['con_credito'], PDO::PARAM_BOOL);

            if ($instruccion->execute()) {
                echo $conexion->errorInfo($instruccion);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en la instrucción de inserción para clientes']);
        }
    }

    /**
     * Elimina un registro con base en su PK
     */
    public function eliminar($param) {
        extract($param);
        // error_log(print_r($param, TRUE)); // quitar comentario para ver lo que se recibe del front-end
        $sql = "DELETE FROM clientes WHERE id_cliente = :id_cliente";
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            if ($instruccion->execute([":id_cliente" => $id_cliente])) {
                echo $conexion->errorInfo($instruccion);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en la eliminación de clientes']);
        }
    }

}