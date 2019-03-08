<?php

class Personal {

    /**
     * Devuelve una cadena JSON que contiene el resultado de seleccionar el personal de la tienda
     * Se usa PDO. Ver https://diego.com.es/tutorial-de-pdo
     */
    public function seleccionar($param) {
        extract($param);
        // implemente según ejemplo de clientes
    }

    /**
     * Inserta un registro correspondiente a personal de la tienda
     */
    public function insertar($param) {
        extract($param);
        // implemente según ejemplo de clientes
    }

    /**
     * Inserta un registro correspondiente a personal de la tienda
     */
    public function actualizar($param) {
        extract($param);
        // implemente según ejemplo de clientes
    }

    /**
     * Elimina un registro con base en su PK
     */
    public function eliminar($param) {
        extract($param);
        // implemente según ejemplo de clientes
    }

    public function listar($param) {
        extract($param);

        $sql = "SELECT * FROM personal ORDER BY nombre";

        // se ejecuta la instrucción SQL, para obtener el conjunto de resultados (si los hay) como un objeto PDOStatement
        if ($stmt = $conexion->pdo->query($sql, PDO::FETCH_OBJ)) {
            // se obtiene el array de objetos con las posibles filas obtenidas
            $lista = $stmt->fetchAll();
            // si la lista tiene elementos, se envía al frontend, si no, se envía un mensaje de error
            if (count($lista)) {
                echo json_encode(['ok' => TRUE, 'lista' => $lista]);
            } else {
                echo json_encode(['ok' => FALSE, 'mensaje' => 'No existe registro de personal']);
            }
        } else {
            // si falla la ejecución se comunica del error al frontend
            $conexion->errorInfo(stmt);
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Imposible consultar el personal']);
        }
    }

}