<?php

class DevolucionVenta implements Persistible {

    /**
     * Devuelve una cadena JSON que contiene el resultado de seleccionar la información básica de devoluciones de ventas
     * Se usa PDO. Ver https://diego.com.es/tutorial-de-pdo
     */
    public function seleccionar($param) {
        throw new Exception("Sin implementar 'seleccionar'");
    }

    public function actualizar($param) {
        throw new Exception("Sin implementar 'actualizar'");
    }

    public function eliminar($param) {
        throw new Exception("Sin implementar 'eliminar'");
    }

    public function insertar($param) {
        extract($param);
        // error_log(print_r($devolucion, 1));

        $sql = "SELECT * FROM insertar_devolucion_venta(:datos_devolucion)";
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            $datosDevolucion = json_encode($devolucion);
            // error_log($sql);

            if ($instruccion->execute([':datos_devolucion' => $datosDevolucion])) {
                $fila = $instruccion->fetch(PDO::FETCH_ASSOC); // si la inserción fue exitosa, recuperar el ID retornado
                $info = $conexion->errorInfo($instruccion, FALSE);
                $info['ok'] = $fila['insertar_devolucion_venta'] > 0;
                $info['id_devolucion'] = $fila['insertar_devolucion_venta'] + 1; // agregar el nuevo ID a la info que se envía al front-end
                echo json_encode($info);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en el registro de la nueva devolución de venta']);
        }
    }

    public function listar($param) {
        throw new Exception("Sin implementar 'listar'");

    }

}
