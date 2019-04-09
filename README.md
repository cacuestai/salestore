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

### Características de la versión 0.9.0
  - Se verifica mediante [reCaptcha] que sea un humano quien accede al sistema.
  - Se agrega el método "autenticar" a la clase Personal.php para verificar contraseñas mediante [password_verify].
  - Se agrega la clase Usuario.js encargada de la gestión de usuarios desde la capa de presentación.
  - El sistema ahora carga diferentes menús según se autentique un vendedor o un administrador.
  - En main.js se hacer pequeños ajustes para incorporar la utilización de reCaptcha y la autenticación de usuarios.
  - **Importante**: si PHP reporta el error: failed loading cafile stream: `C:\xampp\apache\bin\curl-ca-bundle.crt', descargue curl-7.64.0_3-win64-mingw.zip (o una versión más actualizada si existe) de https://curl.haxx.se/windows/, descomprima y copie de ./curl-7.64.0-win64-mingw/bin el archivo curl-ca-bundle.crt a C:/xampp/apache/bin.
  - Tenga en cuenta además que la contraseña de ingreso para todos los usuarios es "123".
  - ESta versión incluye [Tabulator] versión 4.2.5.
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

### Características de la versión 0.06
  - ¡Registro de ventas _completo_!
  - Se incluye una nueva versión de la base de datos en donde cambiaron nombres relacionados con la cantidad de productos.
  - La inserción de productos se cambia por una función almacenada en la base de datos.
  - Con la nueva función de inserción es posible conocer el ID  del nuevo producto.
  - Se agrega a Utilidades.js objetos para traducir a español a Tabulator y a Materialize.datePicker.
  - En main.css se modifica la clase .modal para intentar mejorar el comportamiento de los formularios.
  - Se actualizó el diagrama de la base de datos para incluir el IVA a los productos.
  - Se actualizó tdbsystem-pgscript.sql para incluir el IVA a los productos.
  - Se actualizó la vista lista_productos para incluir el iva y la columna calculada descripcion_producto.
  - Se modifica la función insertar_producto en tdbsystem-pgscript.sql.
  - Se actualiza la gestión de la tabla productos para incorporar el olvidado IVA.
  - Se agrega [Moment], una librería de fechas JavaScript para analizar, validar, manipular y formatear fechas.
  - Se crea el objeto 'Usuario' en Utilidades.js para mantener la referencia del usuario que se autentique.
  - Por ahora, en main.js se asignan los datos de un usuario supuestamente autenticado.
  - Se agrega el tipo 'tipo_detalle' a la base de datos. Se usará para insertar detalles de ventas/compras/devoluciones.
  - Se agrega al script de la base de datos la función 'insertar_venta' para insertar las ventas y sus líneas de venta.
  - Se agrega la función util.esNumero(n) para validar de forma segura si algo es un valor o no.

### Características de la versión 0.05
  - Actualizado Tabulator a la versión 4.2.2
  - Se incluye en ./vista/images la representación gráfica de la base de datos utilizada
  - Se agrega a utilidades.js las funciones crearLista() y cargarLista() para agregar elementos a listas seleccionables.
  - Se corrigen inconsistencias y se agregan registros de pruebas a ./servicios/varios/tdbsystem-pgscript.sql 
  - Se incluye el CRUD de productos para mostrar la carga y edición de tablas con llaves foráneas
  - **Importante**: se agrega la vista "lista_productos" a tdbsystem-pgscript.sql. Esta vista se requiere para editar productos.
  - Otros cambios menores.

### Características de la versión 0.04
  - Se modifica la función cargarScripts() de carga-scripts.js para hacerla compatible con Mozilla Firefox.
  - Las funciones control() y acciones() de la clase Clientes.js cambian de funciones flecha a normalitas por culpa de M. Firefox.
  - La clase para el manejo de clientes deja de ser anónima y pasa a llamarse Cliente el objeto sigue siendo anónimo.
  - Se corrige ./servicios/varios/tdbsystem-pgscript.sql la relación bajas_productos <--> productos
  - se elimina el método Clientes.js::acciones() y se reemplaza por uno anónimo en la primera columna de la tabla

### Características de la versión 0.03
  - Se elimina de main.js el método gestionarClientes(), creado para pruebas en la versión 0.02
  - Se actualiza el objeto "opciones" de main.js para cargar la página que gestiona "clientes"
  - El método generarTabla() de main.js cambió para retornar el objeto Tabulator creado.
  - Ligeros cambios en main.css para mejorar la visualización de formularios
  - se agrega el parámetro clasesCSS a Util.mensaje para flexibilizar el estilo de los mensajes
  - Se reemplaza Util.getEstado() por Util.errorInfo. 
  - Util.errorInfo informa sobre errores lanzados por objetos de tipo PDO o PDOStatement
  - Se implementa la inserción de clientes desde la aplicación
  - Se implementa la eliminación de clientes desde la aplicación

### Características de la versión 0.02

  - Se agrega clientes.html y clientes.js para demostrar la carga de datos desde el back-end.
  - cliente.js incluye la creación de un objeto anónimo mediante una clase anónima.
  - Se agrega la librería [Tabulator] para mostrar la información obtenida de la base de datos.
  - Se hacen pequeños ajustes a main.js para permitir la gestión de clientes.
  - carga-scripts.js permite ahora cargar además de scripts JS, módulos JS.

### Características de la versión 0.01

  - Uso de la API Fetch para acceder a datos del servidor sin necesidad de AJAX.
  - Se usa un método alternativo propio para la carga de páginas web con lo funcionalidad de jQuery load.
  - Implementación de la característica SPA (Single-Page Application) y de URL limpias o amigables.

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
