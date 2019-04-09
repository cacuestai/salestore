<?php

class CategoriaProducto implements Persistible {

    /**
     * Devuelve una cadena JSON que contiene el resultado de seleccionar todas las categorías de productos guardadas
     * Se usa PDO. Ver https://diego.com.es/tutorial-de-pdo
     */
    public function seleccionar($param) {
        extract($param);
        $sql = "SELECT * FROM categorias_productos ORDER BY id_categoria_producto";
        // prepara la instrucción SQL para ejecutarla, luego recibir los parámetros de filtrado
        $instruccion = $conexion->pdo->prepare($sql);
        $instruccion->execute();
        $filas = $instruccion->fetchAll(PDO::FETCH_ASSOC); // devuelve un array que contiene todas las filas del conjunto de resultados
        echo json_encode($filas); // las filas resultantes son enviadas en formato JSON al frontend
    }

    /**
     * Inserta un registro de categorías de productos en la base de datos
     */
    public function insertar($param) {
        extract($param);
        error_log(print_r($param, TRUE)); // quitar comentario para ver lo que se recibe del front-end

        $sql = "SELECT * FROM insertar_categoria(:nombre)";

        // Prepara la instrucción SQL para ejecutarla luego de recibir los parámetros de inserción
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            //Vincular variables a parametros de la consulta
            $instruccion->bindParam(':nombre', $categoria);

            if ($instruccion->execute()) {
                $fila = $instruccion->fetch(PDO::FETCH_ASSOC); // si la inserción fue exitosa, recuperar el ID retornado
                $info = $conexion->errorInfo($instruccion, FALSE);
                $info['id_categoria'] = $fila['insertar_categoria']; // agregar el nuevo ID a la info que se envía al front-end
                $info['ok'] = $fila['insertar_categoria'] > 0;
                echo json_encode($info);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en la instrucción de inserción de categorias de productos']);
        }
    }

    /**
     * Inserta un registro de categorías de productos en la base de datos
     */
    public function actualizar($param) {
        extract($param);
        // error_log(print_r($param, TRUE)); // quitar comentario para ver lo que se recibe del front-end

        $sql = "UPDATE categorias_productos SET nombre=:nombre WHERE id_categoria_producto = :id_actual";

        // Prepara la instrucción SQL para ejecutarla luego de recibir los parámetros de inserción
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            $instruccion->bindParam(':id_actual', $data['id_actual']);
            $instruccion->bindParam(':nombre', $data['nombre']);

            if ($instruccion->execute()) {
                echo $conexion->errorInfo($instruccion);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en la instrucción de actualización para categorias_productos']);
        }
    }

    /**
     * Elimina un registro con base en su PK  //////////////// id_categoria
     */
    public function eliminar($param) {
        extract($param);
        error_log(print_r($param, TRUE)); // quitar comentario para ver lo que se recibe del front-end
        $sql = "DELETE FROM categorias_productos WHERE id_categoria_producto = :id_categoria";
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            if ($instruccion->execute([":id_categoria" => $id_categoria])) {
                $estado = $conexion->errorInfo($instruccion);
                echo $conexion->errorInfo($instruccion);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en la eliminación de categorias']);
        }
    }

    public function listar($param) {
        extract($param);

        $sql = "SELECT * FROM categorias_productos ORDER BY nombre";

        // se ejecuta la instrucción SQL, para obtener el conjunto de resultados (si los hay) como un objeto PDOStatement
        if ($stmt = $conexion->pdo->query($sql, PDO::FETCH_OBJ)) {
            // se obtiene el array de objetos con las posibles filas obtenidas
            $lista = $stmt->fetchAll();
            echo json_encode(['ok' => TRUE, 'lista' => $lista]);
        } else {
            // si falla la ejecución se comunica del error al frontend
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Imposible consultar las categorías de productos']);
        }
    }

}