<?php

class Compra implements Persistible {

    public function insertar($param) {
        extract($param);
        // error_log(print_r($compra, 1));

        $sql = "SELECT * FROM insertar_compra(:datos_compra)";
        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            $datosCompra = json_encode($compra);
            // error_log($datosCompra);
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

    /**
     * Devuelve una cadena JSON que contiene el resultado de seleccionar la información básica de compras
     * Se usa PDO. Ver https://diego.com.es/tutorial-de-pdo
     */
    public function seleccionar($param) {
        extract($param);
        error_log(print_r($param, TRUE)); // quitar comentario para ver lo que se recibe del front-end

        $sql = "SELECT id_compra, fecha_compra, total_credito, total_contado, id_proveedor
                   FROM compras
                   WHERE id_proveedor = :proveedor
                ORDER BY fecha_compra";
        // prepara la instrucción SQL para ejecutarla, luego recibir los parámetros de filtrado
        $instruccion = $conexion->pdo->prepare($sql);
        $instruccion->execute([':proveedor' => $proveedor]);
        $filas = $instruccion->fetchAll(PDO::FETCH_ASSOC); // devuelve un array que contiene todas las filas del conjunto de resultados
        echo json_encode($filas); // las filas resultantes son enviadas en formato JSON al frontend
    }

    public function listar($param) {
        extract($param);
        // error_log(print_r($param, TRUE)); // quitar comentario para ver lo que se recibe del front-end

        $sql = "SELECT id_compra, format('%s - %s', to_char(id_compra, '00000'), fecha_compra) datos_compra
                    FROM compras
                    WHERE id_proveedor = :proveedor";

        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            if ($instruccion->execute([':proveedor' => $proveedor])) {
                $lista = $instruccion->fetchAll(PDO::FETCH_ASSOC); // devuelve un array que contiene todas las filas del conjunto de resultados
                echo json_encode(['ok' => TRUE, 'lista' => $lista]);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            // si falla la ejecución se comunica del error al frontend
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Imposible consultar el listado de compras']);
        }

    }

    public function listarDetalleCompra($param) {
        extract($param);
        // error_log(print_r($param, TRUE)); // quitar comentario para ver lo que se recibe del front-end

        // Para los casos en que no haya devoluciones previas, el LEFT JOIN arrojará nulos a la derecha, por lo tanto
        // es necesario tratar lo devuelto con COALESCE que retorna el primero de sus argumentos que no es NULL
        $sql = 'SELECT ldca.*,
                       ldev.total_devuelto,
                       (ldca.recibido - COALESCE(ldev.total_devuelto, 0)) "comprado-devuelto"
                FROM lista_detalles_compras_agrupadas ldca
                    LEFT JOIN lista_devoluciones_compras_agrupadas ldev
                        ON ldca.id_compra = ldev.id_compra AND ldca.producto = ldev.id_producto
                WHERE ldca.id_compra = :idCompra';

        $instruccion = $conexion->pdo->prepare($sql);

        if ($instruccion) {
            if ($instruccion->execute([':idCompra' => $idCompra])) {
                $lista = $instruccion->fetchAll(PDO::FETCH_ASSOC); // devuelve un array que contiene todas las filas del conjunto de resultados
                echo json_encode($lista);
            } else {
                echo $conexion->errorInfo($instruccion);
            }
        } else {
            // si falla la ejecución se comunica del error al frontend
            $conexion->errorInfo(stmt);
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Imposible consultar el listado de detalles de la compra']);
        }
    }

}