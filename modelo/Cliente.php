<?php

class Cliente implements Persistible {

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
        $instruccion = $conexion->pdo->prepare($sql);
        $instruccion->execute();
        $filas = $instruccion->fetchAll(PDO::FETCH_ASSOC); // devuelve un array que contiene todas las filas del conjunto de resultados
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
     * Inserta un registro de clientes en la base de datos
     */
    public function actualizar($param) {
        extract($param);
        // error_log(print_r($param, TRUE)); // quitar comentario para ver lo que se recibe del front-end

        $sql = "UPDATE clientes
                   SET id_cliente=:id_cliente, nombre=:nombre, telefonos=:telefonos, direccion=:direccion, con_credito=:con_credito
                   WHERE id_cliente = :id_actual";

        // Prepara la instrucción SQL para ejecutarla luego de recibir los parámetros de inserción
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            $instruccion->bindParam(':id_actual', $data['id_actual']);
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
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en la instrucción de actualización para clientes']);
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
                $estado = $conexion->errorInfo($instruccion);
                echo $conexion->errorInfo($instruccion);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en la eliminación de clientes']);
        }
    }

    public function listar($param) {
        $opcion = 0;
        extract($param);

        if ($opcion == 1) { // filtrar sólo los clientes con ventas registradas
            $sql = "SELECT DISTINCT v.id_cliente, nombre, telefonos, direccion, con_credito
                        FROM clientes c
                        INNER JOIN ventas v ON c.id_cliente = v.id_cliente
                        ORDER BY nombre";
        } else { // listar todos clientes
            $sql = "SELECT id_cliente, nombre, telefonos, direccion, con_credito
                        FROM clientes
                        ORDER BY nombre";
        }

        // se ejecuta la instrucción SQL, para obtener el conjunto de resultados (si los hay) como un objeto PDOStatement
        if ($stmt = $conexion->pdo->query($sql, PDO::FETCH_OBJ)) {
            // se obtiene el array de objetos con las posibles filas obtenidas
            $lista = $stmt->fetchAll();
            echo json_encode(['ok' => TRUE, 'lista' => $lista]);
        } else {
            // si falla la ejecución se comunica del error al frontend
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Fallo al hacer la consulta de clientes']);
        }
    }

}