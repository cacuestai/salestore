<?php

/**
 * Establece la estructura que están obligadas a implementar las clases del modelo de dominio
 * @author Carlos Cuesta Iglesias
 */
interface Persistible {

    public function insertar($param);

    public function actualizar($param);

    public function eliminar($param);

    public function seleccionar($param);

    public function listar($param);

}
