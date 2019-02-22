<?php

class Cliente {

    public function seleccionar($param) {
        extract($param);

        // se le da formato a los argumentos recibidos para utilizarlos como filtro de la consulta
        $id_cliente = "%$id_cliente%";
        $nombre_cliente = "%$nombre_cliente%";
        $telefono_cliente = "%$telefono_cliente%";
        $direccion_cliente = "%$direccion_cliente%";

        $sql = "SELECT id_cliente, nombre_cliente, telefono_cliente, direccion_cliente, con_credito
                    FROM cliente
                    WHERE id_cliente ILIKE :id_cliente AND nombre_cliente ILIKE :nombre_cliente
                    AND telefono_cliente ILIKE :telefono_cliente AND direccion_cliente ILIKE :direccion_cliente
                ORDER BY nombre_cliente";

        // prepara la instrucción SQL para ejecutarla, luego recibir los parámetros de filtrado
        $q = $conexion->pdo->prepare($sql);

        $q->execute([
            ":id_cliente" => $id_cliente,
            ":nombre_cliente" => $nombre_cliente,
            ":telefono_cliente" => $telefono_cliente,
            ":direccion_cliente" => $direccion_cliente,
        ]);

        $filas = $q->fetchAll(PDO::FETCH_ASSOC); // devuelve un array que contiene todas las filas del conjunto de resultados
        echo json_encode($filas); // las filas resultantes son enviadas en formato JSON al frontend
    }

}