<?php

class Producto implements Persistible {

    /**
     * Devuelve una cadena JSON que contiene el resultado de seleccionar todos los productos guardados
     * Se usa PDO. Ver https://diego.com.es/tutorial-de-pdo
     */
    public function seleccionar($param) {
        extract($param);
        $sql = "SELECT * FROM lista_productos ORDER BY nombre";
        // prepara la instrucción SQL para ejecutarla, luego recibir los parámetros de filtrado
        $instruccion = $conexion->pdo->prepare($sql);
        $instruccion->execute();
        $filas = $instruccion->fetchAll(PDO::FETCH_ASSOC); // devuelve un array que contiene todas las filas del conjunto de resultados
        echo json_encode($filas); // las filas resultantes son enviadas en formato JSON al frontend
    }

    /**
     * Inserta un registro de productos en la base de datos
     */
    public function insertar($param) {
        extract($param);
        // error_log(print_r($param, TRUE)); // quitar comentario para ver lo que se recibe del front-end

        $sql = "SELECT * FROM insertar_producto(:nombre, :precio, :iva, :cantidad_disponible, :cantidad_minima, :cantidad_maxima, :id_presentacion_producto, :id_categoria_producto)";
        // Prepara la instrucción SQL para ejecutarla luego de recibir los parámetros de inserción
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            $instruccion->bindParam(':nombre', $data['nombre']);
            $instruccion->bindParam(':precio', $data['precio']);
            $instruccion->bindParam(':iva', $data['iva']);
            $instruccion->bindParam(':cantidad_disponible', $data['cantidad_disponible']);
            $instruccion->bindParam(':cantidad_minima', $data['cantidad_minima']);
            $instruccion->bindParam(':cantidad_maxima', $data['cantidad_maxima']);
            $instruccion->bindParam(':id_presentacion_producto', $data['id_presentacion_producto']);
            $instruccion->bindParam(':id_categoria_producto', $data['id_categoria_producto']);

            if ($instruccion->execute()) {
                $fila = $instruccion->fetch(PDO::FETCH_ASSOC); // si la inserción fue exitosa, recuperar el ID retornado
                $info = $conexion->errorInfo($instruccion, FALSE);
                $info['id_producto'] = $fila['insertar_producto']; // agregar el nuevo ID a la info que se envía al front-end
                $info['ok'] = $fila['insertar_producto'] > 0;
                echo json_encode($info);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en la instrucción de inserción para productos']);
        }
    }

    /**
     * Inserta un registro de productos en la base de datos
     */
    public function actualizar($param) {
        extract($param);
        // error_log(print_r($param, TRUE)); // quitar comentario para ver lo que se recibe del front-end

        $sql = "UPDATE productos
                   SET nombre=:nombre, precio=:precio, iva=:iva, cantidad_disponible=:cantidad_disponible, cantidad_minima=:cantidad_minima, cantidad_maxima=:cantidad_maxima, id_presentacion_producto=:id_presentacion_producto, id_categoria_producto=:id_categoria_producto
                   WHERE id_producto = :id_actual";

        // Prepara la instrucción SQL para ejecutarla luego de recibir los parámetros de inserción
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            $instruccion->bindParam(':id_actual', $data['id_actual']);
            $instruccion->bindParam(':nombre', $data['nombre']);
            $instruccion->bindParam(':precio', $data['precio']);
            $instruccion->bindParam(':iva', $data['iva']);
            $instruccion->bindParam(':cantidad_disponible', $data['cantidad_disponible']);
            $instruccion->bindParam(':cantidad_minima', $data['cantidad_minima']);
            $instruccion->bindParam(':cantidad_maxima', $data['cantidad_maxima']);
            $instruccion->bindParam(':id_presentacion_producto', $data['id_presentacion_producto']);
            $instruccion->bindParam(':id_categoria_producto', $data['id_categoria_producto']);

            if ($instruccion->execute()) {
                echo $conexion->errorInfo($instruccion);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en la instrucción de actualización para productos']);
        }
    }

    /**
     * Elimina un registro con base en su PK
     */
    public function eliminar($param) {
        extract($param);
        // error_log(print_r($param, TRUE)); // quitar comentario para ver lo que se recibe del front-end
        $sql = "DELETE FROM productos WHERE id_producto = :id_producto";
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            if ($instruccion->execute([":id_producto" => $id_producto])) {
                $estado = $conexion->errorInfo($instruccion);
                echo $conexion->errorInfo($instruccion);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en la eliminación de productos']);
        }
    }

    /**
     * Devuelve una lista de productos para ser usada en listas seleccionables
     */
    public function listar($param) {
        extract($param);

        $sql = "SELECT * FROM lista_productos ORDER BY descripcion_producto";

        // se ejecuta la instrucción SQL, para obtener el conjunto de resultados (si los hay) como un objeto PDOStatement
        if ($stmt = $conexion->pdo->query($sql, PDO::FETCH_OBJ)) {
            // se obtiene el array de objetos, cada uno con todos los datos de productos
            $listaCompleta = $stmt->fetchAll();
            // se crea otra lista con sólo el ID y los datos esenciales de productos
            $listaMinima = [];
            foreach ($listaCompleta as $fila) {
                $listaMinima[] = $fila->id_producto . '-' . $fila->descripcion_producto;
            }
            // se envían las dos listas al front-end
            echo json_encode(['ok' => TRUE, 'lista_completa' => $listaCompleta, 'lista_minima' => $listaMinima]);
        } else {
            // si falla la ejecución se comunica del error al frontend
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Imposible consultar el listado de productos']);
        }
    }

}