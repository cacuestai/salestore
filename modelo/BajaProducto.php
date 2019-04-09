<?php

class BajaProducto implements Persistible {

    public function insertar($param) {
        extract($param);
        // error_log(print_r($param, TRUE)); // quitar comentario para ver lo que se recibe del front-end
        $sql = "SELECT * FROM insertar_baja_producto(:tipo_baja, :fecha_baja, :id_producto, :cantidad_baja, :precio_producto)";

        // Prepara la instrucción SQL para ejecutarla luego de recibir los parámetros de inserción
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            $instruccion->bindParam(':tipo_baja', $baja['tipo']);
            $instruccion->bindParam(':fecha_baja', $baja['fecha']);
            $instruccion->bindParam(':id_producto', $baja['producto']);
            $instruccion->bindParam(':cantidad_baja', $baja['cantidad']);
            $instruccion->bindParam(':precio_producto', $baja['precio']);

            if ($instruccion->execute()) {
                $fila = $instruccion->fetch(PDO::FETCH_ASSOC); // si la inserción fue exitosa, recuperar el ID retornado
                $info = $conexion->errorInfo($instruccion, FALSE);
                $info['id_baja'] = $fila['insertar_baja_producto'] + 1; // agregar el nuevo ID a la info que se envía al front-end
                $info['ok'] = $fila['insertar_baja_producto'] > 0;
                echo json_encode($info);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en la instrucción de inserción de bajas de productos']);
        }

    }

    public function actualizar($param) {}

    public function eliminar($param) {}

    public function seleccionar($param) {}

    public function listar($param) {}

}