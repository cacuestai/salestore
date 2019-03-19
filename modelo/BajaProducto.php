<?php

class BajaProducto implements Persistible {

    public function insertar($param) {
        extract($param);
        error_log(print_r($param, TRUE)); // quitar comentario para ver lo que se recibe del front-end
        
        // >> agregue a la siguiente instruccion los parámetros requeridos
        $sql = "SELECT * FROM insertar_baja_producto(................................)";

        // Prepara la instrucción SQL para ejecutarla luego de recibir los parámetros de inserción
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            // >> utilice bindParam para asignar a $instruccion los parámetros y sus respectivos valores
            // >> sabiendo que se requiere registar: tipo de baja, fecha, ID del producto, cantidad a dar
            // >> de baja y precio del producto al momento a dar de baja

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

    // >> Complete lo que pueda hacer falta para que este clase no genere errores

}