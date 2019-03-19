<?php

class Compra implements Persistible {

    public function insertar($param) {
        extract($param);
        error_log(print_r($compra, 1));

        $sql = "SELECT * FROM insertar_compra(:datos_compra)";
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            $datosCompra = json_encode($compra);
            error_log($datosCompra);
            $instruccion->bindParam(':datos_compra', $datosCompra);

            if ($instruccion->execute()) {
                $fila = $instruccion->fetch(PDO::FETCH_ASSOC); // si la inserción fue exitosa, recuperar el ID retornado
                $info = $conexion->errorInfo($instruccion, FALSE);
                $info['id_compra'] = $fila['insertar_compra']; // agregar el nuevo ID a la info que se envía al front-end
                $info['ok'] = $fila['insertar_compra'] > 0;
                echo json_encode($info);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en el registro de la nueva venta']);
        }
    }

    public function actualizar($param) {}

    public function eliminar($param) {}

    public function seleccionar($param) {}

    public function listar($param) {}

}