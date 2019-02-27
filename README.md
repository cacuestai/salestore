# SaleStore

Un simple ejemplo de ventas y adquisición de mercancía con fines académicos para mostrar:

  - Conexión a bases de datos Postgres mediante PDO.
  - Arquitectura por capas.
  - API Fetch de ECMAScript 2015 (ES6)

### Características de la versión 0.02

  - Se agrega clientes.html y clientes.js para demostrar la carga de datos desde el back-end.
  - cliente.js incluye la creación de un objeto anónimo mediante una clase anónima.
  - Se agrega la librería [tabulator] para mostrar la información obtenida de la base de datos.
  - Se hacen pequeños ajustes a main.js para permitir la gestión de clientes.
  - carga-scripts.js permite ahora cargar además de scripts JS, módulos JS.

### Características de la versión 0.01

  - Uso de la API Fetch para acceder a datos del servidor sin necesidad de AJAX.
  - Se usa un método alternativo propio para la carga de páginas web con lo funcionalidad de jQuery load.
  - Implementación de la característica SPA (Single-Page Application) y de URL limpias o amigables.


### Dependencias

La aplicación de demostración tiene dos dependencia: *Materialize* e *IconFont*, que se incluyen en la carpeta *libs* con el fin de facilitar las cosas.

### Instalación

Simplemente descargue, descomprima en la carpeta pública de un servidor de internet (XAMPP, Wamp, Lamp o cualquier otro que se le ocurra). Tenga en cuenta que esta demostración no funcionará correctamente sobre Live Server de Visual Studio Code, por razones obvias.

Se proporciona el archivo .servicios/varios/**tdbsystem-pgscript.sql** para que con base en él cree la base de datos que se usa para el ejemplo, que por defecto se ha llamado **tdbsystem**.

También se incluye el archivo ./servicios/varios/conexion.json.**back** que deberá renombrar o guardar  como ./servicios/varios/**conexion.json**. El contenido de este archivo es:

```sh
{
    "BASE_DATOS": "tdbsystem",
    "SERVIDOR": "localhost",
    "PUERTO": "5432",
    "USUARIO": "postgres",
    "CONTRASENA": "XXXXXXXX"
}
```

Y en él deberá asignar el nombre correcto de la base de datos y demás parámetros de conexión.

Por favor tenga en cuenta que esto es una simple demostración para quienes apenas se inician en el mundo de la programación web. Siendo así son muy bienvenidas las sugerencias para mejorar este producto de demostración.

[Tabulator]: <http://tabulator.info/>