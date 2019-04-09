<?php

class Proveedor implements Persistible {

    /**
     * Devuelve una cadena JSON que contiene el resultado de seleccionar todos los clientes guardados
     * Se usa PDO. Ver https://diego.com.es/tutorial-de-pdo
     */
    public function seleccionar($param) {
        extract($param);
        $sql = "SELECT id_proveedor, nombre, telefono, correo
                   FROM proveedores
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

        $sql = "INSERT INTO proveedores(id_proveedor,nombre,telefono,correo)
                   VALUES (:id_proveedor, :nombre, :telefono, :correo)";

        // Prepara la instrucción SQL para ejecutarla luego de recibir los parámetros de inserción
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            $instruccion->bindParam(':id_proveedor', $data['id_proveedor']);
            $instruccion->bindParam(':nombre', $data['nombre']);
            $instruccion->bindParam(':telefono', $data['telefono']);
            $instruccion->bindParam(':correo', $data['correo']);

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

        $sql = "UPDATE proveedores
                   SET id_proveedor=:id_proveedor, nombre=:nombre, telefono=:telefono, correo=:correo
                   WHERE id_proveedor = :id_actual";

        // Prepara la instrucción SQL para ejecutarla luego de recibir los parámetros de inserción
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            $instruccion->bindParam(':id_actual', $data['id_actual']);
            $instruccion->bindParam(':id_proveedor', $data['id_proveedor']);
            $instruccion->bindParam(':nombre', $data['nombre']);
            $instruccion->bindParam(':telefono', $data['telefono']);
            $instruccion->bindParam(':correo', $data['correo']);

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
        $sql = "DELETE FROM proveedores WHERE id_proveedor= :id_proveedor";
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            if ($instruccion->execute([":id_proveedor" => $id_proveedor])) {
                $estado = $conexion->errorInfo($instruccion);
                echo $conexion->errorInfo($instruccion);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en la eliminación de clientes']);
        }
    }

    // $sql = "SELECT * FROM proveedores ORDER BY nombre";

    /**
     * Devuelve una lista de productos para ser usada en listas seleccionables
     */
    public function listar($param) {
        $opcion = 0;
        extract($param);

        if ($opcion == 1) { // filtrar sólo los proveedores con compras registradas
            $sql = "SELECT DISTINCT p.id_proveedor, nombre, telefono, correo
                        FROM proveedores p
                        INNER JOIN compras c ON p.id_proveedor = c.id_proveedor
                        ORDER BY nombre";
        } else { // listar todos proveedores
            $sql = "SELECT id_proveedor, nombre, telefono, correo
                        FROM proveedores
                        ORDER BY nombre";
        }

        // se ejecuta la instrucción SQL, para obtener el conjunto de resultados (si los hay) como un objeto PDOStatement
        if ($stmt = $conexion->pdo->query($sql, PDO::FETCH_OBJ)) {
            // se obtiene el array de objetos con las posibles filas obtenidas
            $lista = $stmt->fetchAll();
            echo json_encode(['ok' => TRUE, 'lista' => $lista]);
        } else {
            // si falla la ejecución se comunica del error al frontend
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Fallo al realizar la consulta de proveedores']);
        }
    }

}