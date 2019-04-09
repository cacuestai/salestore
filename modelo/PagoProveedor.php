<?php

class PagoProveedor implements Persistible {

    public function seleccionar($param) {
        extract($param);
        // error_log(print_r($param, TRUE));

        $sql = "SELECT pagos_proveedores.*, proveedores.nombre
                    FROM pagos_proveedores
                    JOIN proveedores ON proveedores.id_proveedor = pagos_proveedores.id_proveedor
                    WHERE proveedores.id_proveedor = :proveedor
                    ORDER BY pagos_proveedores.fecha_pago";

        // prepara la instrucción SQL para ejecutarla, luego recibir los parámetros de filtrado
        $instruccion = $conexion->pdo->prepare($sql);
        if ($instruccion) {
            if ($instruccion->execute([':proveedor' => $proveedor])) {
                $filas = $instruccion->fetchAll(PDO::FETCH_ASSOC); // devuelve un array que contiene todas las filas del conjunto de resultados
                echo json_encode($filas); // las filas resultantes son enviadas en formato JSON al frontend
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Fallo al determinar el ID del siguiente pago de proveedores']);
        }
    }

    public function actualizar($param) {
        throw new Exception("Sin implementar 'actualizar'");
    }

    public function eliminar($param) {
        throw new Exception("Sin implementar 'eliminar'");
    }

    public function insertar($param) {
        extract($param);

        $sql = 'SELECT * FROM insertar_pago_proveedor(:proveedor, :valor, :fecha)';

        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            $instruccion->bindParam(':proveedor', $pago['proveedor']);
            $instruccion->bindParam(':valor', $pago['valor']);
            $instruccion->bindParam(':fecha', $pago['fecha']);

            if ($instruccion->execute()) {
                $fila = $instruccion->fetch(PDO::FETCH_ASSOC); // si la inserción fue exitosa, recuperar el ID retornado
                $info = $conexion->errorInfo($instruccion, FALSE);
                $info['ok'] = $fila['insertar_pago_proveedor'] > 0;
                $info['id_pago'] = $fila['insertar_pago_proveedor'] + 1; // agregar el nuevo ID a la info que se envía al front-end
                echo json_encode($info);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Falló en el registro del nuevo pago']);
        }
    }

    public function listar($param) {
        throw new Exception("Sin implementar 'listar'");
    }

}
