# SaleStore

Un simple ejemplo de ventas y adquisición de mercancía, **escrito en Javascript puro** y PHP, con fines académicos para mostrar:

  - Conexión a bases de datos Postgres mediante PDO.
  - Arquitectura por capas.
  - ECMAScript 2015 (ES6), ECMAScript2016 (ES2016) y ECMAScript2018 (ES8).
  - Uso de la librería [Tabulator] para crear tablas interactivas sin usar jQuery.
  - Uso de [Materialize], un moderno front-end framework basado en Material Design y orientado al diseño adaptativo.
  - Uso de la librería [Moment] para analizar, validar, manipular y formatear fechas.

![Screenshot](screenshot.png)

**Importante**: debe ejecutar nuevamente el script de la base de datos, luego de incorporarle sus aportes.

### Instalación

Simplemente descargue, descomprima en la carpeta pública de un servidor de internet (XAMPP, Wamp, Lamp o cualquier otro que se le ocurra). Tenga en cuenta que esta demostración no funcionará correctamente sobre Live Server de Visual Studio Code, por razones obvias.

Se proporciona el archivo .servicios/varios/**tdbsystem-pgscript.sql** para que con base en él, cree la base de datos que se usa para el ejemplo, que por defecto se ha llamado **tdbsystem**.

También se incluye el archivo ./servicios/varios/conexion.json.**back** que deberá renombrar o guardar  como ./servicios/varios/**conexion.json**. El contenido de este archivo tiene la siguiente estructura:

```sh
{
    "BASE_DATOS": "tdbsystem",
    "SERVIDOR": "localhost",
    "PUERTO": "5432",
    "USUARIO": "postgres",
    "CONTRASENA": "XXXXXXXX",
    "CLAVE_RECAPTCHA": "6LXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXFEHonV"
}
```

Asegúrese de asignar aquí los parámetros de conexión a su base de datos y de establecer el codigo captcha para su sitio.

Luego de haber cargado la base de datos, para ingresar a la aplicación use un usuario con **ID** entre **001** y **013**. la contraseña para cualquiera de estos usuarios es **123**

### Características de la versión 0.9.1
  - Se cambia en Utilidades.js el nombre de la constante URL por URL_APP, para evitar conflictos con el objeto URL de Javascript.
  - Se agrega a Utilidades.js la función urlScript(strURL) que devuelve un objeto URL si la cadena dada como argumento está contenida en la propiedad "src" de alguno de los scripts cargados por la aplicación.
  - Se simplifica la verificación en la función Utilidades.validarCaptcha(), ahora sólo se requiere ingresar la clave del front-end una sola vez en la cabecera de index.html.

### Características de la versión 0.9.0
  - Se verifica mediante [reCaptcha] que sea un humano quien accede al sistema.
  - Se agrega el método "autenticar" a la clase Personal.php para verificar contraseñas mediante [password_verify].
  - Se agrega la clase Usuario.js encargada de la gestión de usuarios desde la capa de presentación.
  - El sistema ahora carga diferentes menús según se autentique un vendedor o un administrador.
  - En main.js se hacer pequeños ajustes para incorporar la utilización de reCaptcha y la autenticación de usuarios.
  - **Importante**: si PHP reporta el error: failed loading cafile stream: `C:\xampp\apache\bin\curl-ca-bundle.crt', descargue curl-7.64.0_3-win64-mingw.zip (o una versión más actualizada si existe) de https://curl.haxx.se/windows/, descomprima y copie de ./curl-7.64.0-win64-mingw/bin el archivo curl-ca-bundle.crt a C:/xampp/apache/bin.
  - Tenga en cuenta además que la contraseña de ingreso para todos los usuarios es "123".
  - Esta versión incluye [Tabulator] versión 4.2.5.
  - Puede que su base de datos requiera incorporar cambios a partir de tdbsystem-pgscript.sql en lo que respecta a vistas y procedimientos almacenados.

### Características de la versión 0.1.0
  - Las clases del modelo de dominio, implementan la _interface Persistible_.
  - Actualizado a [Tabulator] versión 4.2.3
  - Se escribe una **versión ES6** de **[Materialize Dialog]**, una librería diseñada para crear diálogos modales.
    Se invita a comparar la versión original con la proporcionada aquí.
  - Ahora el sistema pide confirmación cada que se va a eliminar un registro.
  - Se agrega la columna fecha a la tabla bajas_productos.
  - Se eliminan de la base de datos las funciones id_siguiente_xxxx() para usar en su defecto maximo(tabla, columna)
  - Se eliminan del back-end las funciones idSiguienteXxxx() para usar Conexion.siguiente()
  - Define en utilidades.js una constante para referenciar la URL del controlador de dominio
  - Se cambia en detalles_compras, id_pedido por id_compra y se actualiza ./vista/images/db-modelo-tdb.jpg
  - Se agregan columnas a tipo 'tipo_detalle' de la base de datos para usarlo con ventas y compras
  - Se agrega al script de la BD la función 'insertar_compra' para insertar las compras y sus líneas de compra.
  - Se agrega al script de la BD la función 'insertar_devolucion_venta' para insertar las devoluciones de ventas y sus líneas.
  - Se incluye una demostración completa de baja de productos.
  - Se incluye una demostración completa de pagos de clientes.
  - Se incluye una demostración completa de devoluciones por ventas.
  - El archivo **conexion.json.back** incluye una nueva propiedad que le permite asignar una clave [reCAPTCHA] v3.
    Puede obtener información adicional sobre la [sigla captcha] aquí.
  - Se agrega la autenticación de usuarios administradores y vendedores.
  - A partir de ahora, el usuario autenticado se registra como el responsable de las ventas.
  - Se incluye en ventas un ejemplo de semaforización (verde: debe poco o nada, naranja: deuda un pco alta. rojo: deuda muy alta)
  - Uso de la API Fetch para acceder a datos del servidor sin necesidad de AJAX.
  - Se usa un método alternativo propio para la carga de páginas web con lo funcionalidad de jQuery load.
  - Implementación de la característica SPA (Single-Page Application) y de URL limpias o amigables.
  - Se agrega a Utilidades.js objetos para traducir a español a Tabulator y a Materialize.datePicker.

### Dependencias

La aplicación de demostración tiene algunas dependencias: *[Materialize]*, *IconFont*, *[Moment]* y *[Tabulator]* que se incluyen en la carpeta *libs* con el fin de facilitar la instalación.

Por favor tenga en cuenta que esto es una simple demostración para quienes apenas se inician en el mundo de la programación web. Siendo así son muy bienvenidas las sugerencias para mejorar este producto de demostración.

[Tabulator]: <http://tabulator.info/>
[Materialize]: <https://materializecss.com/>
[Moment]: <https://momentjs.com/>
[Materialize Dialog]: <https://rudmanmrrod.github.io/material-dialog/>
[reCAPTCHA]: https://developers.google.com/recaptcha/intro
[sigla captcha]: https://www.xataka.com/basics/captcha-recaptcha-que-cuales-sus-diferencias-que-cambia-recaptcha-v3
[password_verify]: https://www.php.net/manual/es/function.password-verify.php
