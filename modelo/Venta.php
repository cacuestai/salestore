<?php

class Venta {

    public function idSiguienteVenta($param) {
        extract($param);

        $sql = "SELECT * FROM id_siguiente_venta()";
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            if ($instruccion->execute()) {
                $fila = $instruccion->fetch(PDO::FETCH_ASSOC);
                $info = $conexion->errorInfo($instruccion, FALSE);
                $info['id_venta'] = $fila['id_siguiente_venta']; // agregar el nuevo ID a la info que se envía al front-end
                $info['ok'] = $fila['id_siguiente_venta'];
                echo json_encode($info);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Fallo al determinar el ID de la factura siguiente']);
        }
    }

    public function registrarVenta($param) {
        extract($param);
        error_log(print_r($venta, 1));
        
        $sql = "SELECT * FROM insertar_venta(:datos_venta)";
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            $datosVenta = json_encode($venta);
            $instruccion->bindParam(':datos_venta', $datosVenta);

            if ($instruccion->execute()) {
                $fila = $instruccion->fetch(PDO::FETCH_ASSOC); // si la inserción fue exitosa, recuperar el ID retornado
                $info = $conexion->errorInfo($instruccion, FALSE);
                $info['id_venta'] = $fila['insertar_venta']; // agregar el nuevo ID a la info que se envía al front-end
                $info['ok'] = $fila['insertar_venta'] > 0;
                echo json_encode($info);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en el registro de la nueva venta']);
        }
    }
}