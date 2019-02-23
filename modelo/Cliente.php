<?php

class Cliente {

    public function seleccionar($param) {
        extract($param);

        // se le da formato a los argumentos recibidos para utilizarlos como filtro de la consulta
        $id_cliente = "%$id_cliente%";
        $nombre = "%$nombre%";
        $telefonos = "%$telefonos%";
        $direccion = "%$direccion%";

        $sql = "SELECT id_cliente, nombre, telefonos, direccion, con_credito
                    FROM clientes
                    WHERE id_cliente ILIKE :id_cliente AND nombre ILIKE :nombre
                    AND telefonos ILIKE :telefonos AND direccion ILIKE :direccion
                ORDER BY nombre";

        // prepara la instrucción SQL para ejecutarla, luego recibir los parámetros de filtrado
        $q = $conexion->pdo->prepare($sql);

        $q->execute([
            ":id_cliente" => $id_cliente,
            ":nombre" => $nombre,
            ":telefonos" => $telefonos,
            ":direccion" => $direccion,
        ]);

        $filas = $q->fetchAll(PDO::FETCH_ASSOC); // devuelve un array que contiene todas las filas del conjunto de resultados
        echo json_encode($filas); // las filas resultantes son enviadas en formato JSON al frontend
    }

}