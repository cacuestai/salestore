
-- TDBSystem (Base de datos para el Sistema "Tienda de Barrio"), versión 0.5
-- Un simple modelo de bases de datos para fines académicos
-- Cree una base de datos Postgres en blanco y corra este script sobre ella.

-- Enseguida, se usa DDL (Data Definition Language) para crear la base de datos

DROP TABLE IF EXISTS categorias_productos CASCADE;
DROP TABLE IF EXISTS presentaciones_productos CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS bajas_productos;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS pagos_clientes;
DROP TABLE IF EXISTS personal CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS pagos_proveedores;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS detalles_ventas;
DROP TABLE IF EXISTS devoluciones_ventas CASCADE;
DROP TABLE IF EXISTS detalles_devoluciones_ventas;
DROP TABLE IF EXISTS compras CASCADE;
DROP TABLE IF EXISTS detalles_compras;
DROP TABLE IF EXISTS devoluciones_compras CASCADE;
DROP TABLE IF EXISTS detalles_devoluciones_compras;

CREATE TABLE categorias_productos (
	id_categoria_producto SMALLSERIAL NOT NULL,
	nombre varchar NOT NULL,
	PRIMARY KEY(id_categoria_producto)
);

CREATE TABLE presentaciones_productos (
	id_presentacion_producto SMALLSERIAL NOT NULL,
	descripcion varchar NOT NULL,
	PRIMARY KEY(id_presentacion_producto)
);

CREATE TABLE productos (
	id_producto SERIAL NOT NULL,
	nombre varchar NOT NULL,
	precio numeric NOT NULL DEFAULT 0,
	cantidad_disponible int2 NOT NULL DEFAULT 0,
	cantidad_minima int2 NOT NULL DEFAULT 1,
	cantidad_maxima int2 NOT NULL DEFAULT 1,
	id_presentacion_producto int2 NOT NULL,
	id_categoria_producto int2 NOT NULL,
	PRIMARY KEY(id_producto),
	CONSTRAINT ref_producto__categoria_producto FOREIGN KEY (id_categoria_producto)
		REFERENCES categorias_productos(id_categoria_producto)
	MATCH SIMPLE
	ON DELETE NO ACTION
	ON UPDATE CASCADE
	NOT DEFERRABLE,
	CONSTRAINT ref_producto__presentacion_producto FOREIGN KEY (id_presentacion_producto)
		REFERENCES presentaciones_productos(id_presentacion_producto)
	MATCH SIMPLE
	ON DELETE NO ACTION
	ON UPDATE CASCADE
	NOT DEFERRABLE
);

CREATE TABLE bajas_productos (
	id_baja_producto SERIAL NOT NULL,
	tipo_baja varchar NOT NULL,
	cantidad int2 NOT NULL DEFAULT 0,
	precio numeric NOT NULL DEFAULT 0,
	id_producto int4 NOT NULL,
	PRIMARY KEY(id_baja_producto),
	CONSTRAINT tipos_bajas CHECK (tipo_baja IN ('Donación', 'Daño', 'Pérdida', 'Descomposición', 'Destrucción', 'Exclusion')),
	CONSTRAINT ref_baja_productos__producto FOREIGN KEY (id_producto)
		REFERENCES productos(id_producto)
	MATCH SIMPLE
	ON DELETE NO ACTION
	ON UPDATE CASCADE
	NOT DEFERRABLE
);

CREATE TABLE clientes (
	id_cliente varchar NOT NULL,
	nombre varchar NOT NULL,
	telefonos varchar,
	direccion varchar,
	con_credito bool NOT NULL,
	PRIMARY KEY(id_cliente)
);

CREATE TABLE pagos_clientes (
	id_pago_cliente SERIAL NOT NULL,
	id_cliente varchar NOT NULL,
	valor_pago numeric NOT NULL DEFAULT 0,
	fecha_pago date NOT NULL,
	PRIMARY KEY(id_pago_cliente),
	CONSTRAINT ref_pago_cliente__cliente FOREIGN KEY (id_cliente)
		REFERENCES clientes(id_cliente)
	MATCH SIMPLE
	ON DELETE NO ACTION
	ON UPDATE CASCADE
	NOT DEFERRABLE
);

CREATE TABLE personal (
	id_persona varchar NOT NULL,
	nombre varchar NOT NULL,
	telefono varchar NOT NULL,
	direccion varchar NOT NULL,
	perfil varchar NOT NULL,
	contrasena varchar NOT NULL,
	PRIMARY KEY(id_persona),
	CONSTRAINT tipo_perfil CHECK (perfil IN('Administrador', 'Vendedor'))
);

CREATE TABLE proveedores (
	id_proveedor varchar NOT NULL,
	nombre varchar NOT NULL,
	telefono varchar NOT NULL,
	correo varchar,
	PRIMARY KEY(id_proveedor)
);

CREATE TABLE pagos_proveedores (
	id_pago_proveedor SERIAL NOT NULL,
	id_proveedor varchar NOT NULL,
	valor_pago numeric NOT NULL DEFAULT 0,
	fecha_pago date NOT NULL,
	PRIMARY KEY(id_pago_proveedor),
	CONSTRAINT ref_pago_proveedor__proveedor FOREIGN KEY (id_proveedor)
		REFERENCES proveedores(id_proveedor)
	MATCH SIMPLE
	ON DELETE NO ACTION
	ON UPDATE CASCADE
	NOT DEFERRABLE
);

CREATE TABLE ventas (
	id_venta SERIAL NOT NULL,
	fecha_venta date NOT NULL,
	total_credito numeric NOT NULL DEFAULT 0,
	total_contado numeric NOT NULL DEFAULT 0,
	id_cliente varchar NOT NULL,
	id_vendedor varchar NOT NULL,
	PRIMARY KEY(id_venta),
	CONSTRAINT ref_venta__cliente FOREIGN KEY (id_cliente)
		REFERENCES clientes(id_cliente)
	MATCH SIMPLE
	ON DELETE NO ACTION
	ON UPDATE CASCADE
	NOT DEFERRABLE,
	CONSTRAINT ref_venta__personal FOREIGN KEY (id_vendedor)
		REFERENCES personal(id_persona)
	MATCH SIMPLE
	ON DELETE NO ACTION
	ON UPDATE CASCADE
	NOT DEFERRABLE
);

CREATE TABLE detalles_ventas (
	id_detalle_venta SERIAL NOT NULL,
	cantidad_disponible int2 NOT NULL DEFAULT 0,
	valor_producto numeric NOT NULL DEFAULT 0,
	descuento numeric NOT NULL DEFAULT 0,
	iva numeric NOT NULL DEFAULT 0,
	id_venta int4 NOT NULL,
	id_producto int4 NOT NULL,
	PRIMARY KEY(id_detalle_venta),
	CONSTRAINT ref_detalle_venta_a_venta FOREIGN KEY (id_venta)
		REFERENCES ventas(id_venta)
	MATCH SIMPLE
	ON DELETE CASCADE
	ON UPDATE CASCADE
	NOT DEFERRABLE,
	CONSTRAINT ref_detalle_venta__producto FOREIGN KEY (id_producto)
		REFERENCES productos(id_producto)
	MATCH SIMPLE
	ON DELETE CASCADE
	ON UPDATE CASCADE
	NOT DEFERRABLE
);

-- COMMENT ON COLUMN detalles_ventas.valor_producto IS 'debe permitir cálculo y entrada directa';

CREATE TABLE devoluciones_ventas (
	id_devolucion_venta SERIAL NOT NULL,
	id_venta int4 NOT NULL,
	fecha date NOT NULL,
	PRIMARY KEY(id_devolucion_venta),
	CONSTRAINT ref_devolucion_venta__venta FOREIGN KEY (id_venta)
		REFERENCES ventas(id_venta)
	MATCH SIMPLE
	ON DELETE NO ACTION
	ON UPDATE CASCADE
	NOT DEFERRABLE
);

CREATE TABLE detalles_devoluciones_ventas (
	id_detalle_devolucion_venta SERIAL NOT NULL,
	id_devolucion_venta int4 NOT NULL,
	id_producto int4 NOT NULL,
	cantidad_disponible int2 NOT NULL DEFAULT 0,
	PRIMARY KEY(id_detalle_devolucion_venta),
	CONSTRAINT ref_detalle_devolucion__devolucion_venta FOREIGN KEY (id_devolucion_venta)
		REFERENCES devoluciones_ventas(id_devolucion_venta)
	MATCH SIMPLE
	ON DELETE NO ACTION
	ON UPDATE CASCADE
	NOT DEFERRABLE
);

CREATE TABLE compras (
	id_compra SERIAL NOT NULL,
	fecha_compra date NOT NULL,
	fecha_recibido date NOT NULL,
	total_credito numeric NOT NULL DEFAULT 0,
	total_contado numeric NOT NULL DEFAULT 0,
	id_proveedor varchar NOT NULL,
	PRIMARY KEY(id_compra),
	CONSTRAINT ref_compra__proveedor FOREIGN KEY (id_proveedor)
		REFERENCES proveedores(id_proveedor)
	MATCH SIMPLE
	ON DELETE NO ACTION
	ON UPDATE CASCADE
	NOT DEFERRABLE
);

CREATE TABLE detalles_compras (
	id_detalle_compra SERIAL NOT NULL,
	cantidad_pedida int2 NOT NULL DEFAULT 0,
	cantidad_recibida int2 NOT NULL DEFAULT 0,
	valor_producto numeric NOT NULL DEFAULT 0,
	iva numeric DEFAULT 0,
	id_pedido int4 NOT NULL,
	id_producto int4 NOT NULL,
	PRIMARY KEY(id_detalle_compra),
	CONSTRAINT ref_detalle_compra__compra FOREIGN KEY (id_pedido)
		REFERENCES compras(id_compra)
	MATCH SIMPLE
	ON DELETE NO ACTION
	ON UPDATE CASCADE
	NOT DEFERRABLE,
	CONSTRAINT ref_detalle_compra__presentacion_producto FOREIGN KEY (id_producto)
		REFERENCES productos(id_producto)
	MATCH SIMPLE
	ON DELETE NO ACTION
	ON UPDATE CASCADE
	NOT DEFERRABLE
);

CREATE TABLE devoluciones_compras (
	id_devolucion_compra SERIAL NOT NULL,
	id_compra int4 NOT NULL,
	fecha_devolucion date NOT NULL,
	PRIMARY KEY(id_devolucion_compra),
	CONSTRAINT ref_devolucion_pedido_a_pedido FOREIGN KEY (id_compra)
		REFERENCES compras(id_compra)
	MATCH SIMPLE
	ON DELETE NO ACTION
	ON UPDATE CASCADE
	NOT DEFERRABLE
);

CREATE TABLE detalles_devoluciones_compras (
	id_detalle_devolucion_compra SERIAL NOT NULL,
	id_devolucion_compra int4 NOT NULL,
	id_producto int4 NOT NULL,
	cantidad_disponible int2 NOT NULL DEFAULT 0,
	PRIMARY KEY(id_detalle_devolucion_compra),
	CONSTRAINT ref_detalle_devolucion_pedido__devolucion_pedido FOREIGN KEY (id_devolucion_compra)
		REFERENCES devoluciones_compras(id_devolucion_compra)
	MATCH SIMPLE
	ON DELETE NO ACTION
	ON UPDATE CASCADE
	NOT DEFERRABLE
);

-- A continuación un poco de Data Manipulation Language (DML) para disponer de algunas pruebas

INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES ('CL001', 'Juan José Hernández Hernández', '8760001', 'Calle 10 # 11-11', true)
	ON CONFLICT DO NOTHING;	
	
INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES ('CL002', 'Miguel Angel García García', '8760002', 'Calle 11 # 11-12', true)
	ON CONFLICT DO NOTHING;		

INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES ('CL003', 'Juan Sebastián García García', '8760003', 'Calle 12 # 11-13', true)
	ON CONFLICT DO NOTHING;		

INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES ('CL004', 'Juan David García Hernández', '8760004', 'Calle 13 # 11-14', false)
	ON CONFLICT DO NOTHING;		

INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES ('CL005', 'Samuel David García García', '8760005', 'Calle 13 # 12-14', false)
	ON CONFLICT DO NOTHING;		

INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES ('CL006', 'Juan Pablo García García', '8760006', 'Calle 13 # 12-15', false)
	ON CONFLICT DO NOTHING;		

INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES ('CL007', 'Andrés Felipe García Martínez', '8760007', 'Calle 10 # 12-15', true)
	ON CONFLICT DO NOTHING;		

INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES ('CL008', 'Juan Esteban Hernández Hernández', '8760008', 'Calle 12 # 11-15', false)
	ON CONFLICT DO NOTHING;		

INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES ('CL009', 'Juan Diego Flores García', '8760009', 'Calle 10 # 11-15', false)
	ON CONFLICT DO NOTHING;		

INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES ('CL010', 'Angel David García Hernández', '8760010', 'Calle 9 # 11-15', false)
	ON CONFLICT DO NOTHING;

INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES('CL011','Francisco Diaz Diaz','8530000','Cra. 4 #18-32',true)
	ON CONFLICT DO NOTHING;

INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES('CL012','Luciana Garcia Jimenez','8534523','Cra. 1#13-18',true)
	ON CONFLICT DO NOTHING;

INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES('CL013','Sofia Lopez Trejos','8532310','Cra. 5 #16-52',true)
	ON CONFLICT DO NOTHING;
	
INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES('CL014','Melissa Mesa Marin','8538975','Cra. 7 #20-25',true)
	ON CONFLICT DO NOTHING;
	
INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES('CL015','Nicole Torres Marin','8539632','Cra. 6 #18-41',true)
	ON CONFLICT DO NOTHING;
	
INSERT INTO clientes(
	id_cliente, nombre, telefonos, direccion, con_credito)
	VALUES('CL016','Sol Carvajal Mejia','8530000','Cra.1 #13-20',true)
	ON CONFLICT DO NOTHING;

INSERT INTO categorias_productos(nombre) VALUES ('Lacteos') ON CONFLICT DO NOTHING;
INSERT INTO categorias_productos(nombre) VALUES ('Cárnicos') ON CONFLICT DO NOTHING;
INSERT INTO categorias_productos(nombre) VALUES ('Frutas') ON CONFLICT DO NOTHING;
INSERT INTO categorias_productos(nombre) VALUES ('Verduras') ON CONFLICT DO NOTHING;
INSERT INTO categorias_productos(nombre) VALUES ('Cereales') ON CONFLICT DO NOTHING;
INSERT INTO categorias_productos(nombre) VALUES ('Aseo personal') ON CONFLICT DO NOTHING;
INSERT INTO categorias_productos(nombre) VALUES ('Aseo del hogar') ON CONFLICT DO NOTHING;
INSERT INTO categorias_productos(nombre) VALUES ('Condimentos') ON CONFLICT DO NOTHING;
INSERT INTO categorias_productos(nombre) VALUES ('Bebidas') ON CONFLICT DO NOTHING;
INSERT INTO categorias_productos(nombre) VALUES ('Licores') ON CONFLICT DO NOTHING;

INSERT INTO presentaciones_productos(descripcion) VALUES ('Bolsa x 1000 cc') ON CONFLICT DO NOTHING;
INSERT INTO presentaciones_productos(descripcion) VALUES ('Bolsa x 12 unidades') ON CONFLICT DO NOTHING;
INSERT INTO presentaciones_productos(descripcion) VALUES ('Bolsa x 500 gramos') ON CONFLICT DO NOTHING;
INSERT INTO presentaciones_productos(descripcion) VALUES ('Bolsa x 1 kg') ON CONFLICT DO NOTHING;
INSERT INTO presentaciones_productos(descripcion) VALUES ('Botella no retornable x 2.5 lt.') ON CONFLICT DO NOTHING;
INSERT INTO presentaciones_productos(descripcion) VALUES ('Botella no retornable x 1 lt.') ON CONFLICT DO NOTHING;
INSERT INTO presentaciones_productos(descripcion) VALUES ('Botella no retornable x 600 ml.') ON CONFLICT DO NOTHING;
INSERT INTO presentaciones_productos(descripcion) VALUES ('Bolsa x 5 kg. aprox.') ON CONFLICT DO NOTHING;
INSERT INTO presentaciones_productos(descripcion) VALUES ('Unidad') ON CONFLICT DO NOTHING;
INSERT INTO presentaciones_productos(descripcion) VALUES ('Caja x 250 gramos') ON CONFLICT DO NOTHING;
INSERT INTO presentaciones_productos(descripcion) VALUES ('Caja x 500 gramos') ON CONFLICT DO NOTHING;
INSERT INTO presentaciones_productos(descripcion) VALUES ('Paquete x 3 Unidades') ON CONFLICT DO NOTHING;
INSERT INTO presentaciones_productos(descripcion) VALUES ('Caja') ON CONFLICT DO NOTHING;

INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Leche Colanta', 2000, 1, 3, 20, 1, 1) 
	ON CONFLICT DO NOTHING;

INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Lecha entera Celema', 1900, 4, 2, 15, 1, 1)
	 ON CONFLICT DO NOTHING;

INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Mandarinas', 3000, 5, 3, 10, 2, 3)
	 ON CONFLICT DO NOTHING;

INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Lentejas', 1000, 10, 5, 30, 3, 5)
	ON CONFLICT DO NOTHING;
	
INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Arroz Doña Pepa', 1200, 3, 5, 25, 3, 5)
	ON CONFLICT DO NOTHING;

INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Maíz trillado', 900, 6, 3, 10, 4, 5)
	ON CONFLICT DO NOTHING;
	
INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Lechuga', 1500, 7, 3, 10, 3, 4)
	ON CONFLICT DO NOTHING;
	
INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Kiwi', 2000, 3, 2, 9, 12, 3)
	ON CONFLICT DO NOTHING;

INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Maracuya', 3000, 3, 3, 10, 12, 3)
	ON CONFLICT DO NOTHING;
								  
INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Cereal Madagascar', 3000, 1, 3, 10, 3, 5)
	ON CONFLICT DO NOTHING;

INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Cafe Monumental', 4500, 2, 5, 10, 3, 4)
	ON CONFLICT DO NOTHING;

INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Mantequilla Colanta', 3800, 2, 3, 10, 9, 4)
	ON CONFLICT DO NOTHING;
	
INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Jabon Ariel', 7800, 1, 3, 15, 4, 7)
	ON CONFLICT DO NOTHING;

INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Manzanas', 4500, 3, 3, 15, 12, 3)
	ON CONFLICT DO NOTHING;

INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Arroz Buen Dia', 1500, 1, 10, 30, 3, 5)
	ON CONFLICT DO NOTHING;
	
INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Frijol del Costal', 1500, 2, 5, 20, 3, 5)
	ON CONFLICT DO NOTHING;
	
INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Mantequilla Don Oleo', 3500, 1, 10, 20, 9, 4)
	ON CONFLICT DO NOTHING;
	
INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Crema de leche Colanta', 2200, 1, 10, 40, 3, 1)
	ON CONFLICT DO NOTHING;
	
INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Jabon en polvo Josefina', 4000, 1, 5, 20, 4, 7)
	ON CONFLICT DO NOTHING;

INSERT INTO productos(nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
	VALUES('Crema dental Colgate', 1800, 1, 10, 20, 9, 6)
	ON CONFLICT DO NOTHING;
								  
-- A continuación algunas instrucciones DML disponibles mediante vistas o procedimientos almacenados
								  
CREATE OR REPLACE VIEW lista_productos AS										  
	SELECT productos.id_producto,
		productos.id_categoria_producto,
		categorias_productos.nombre categoria,
		productos.nombre,			
		productos.id_presentacion_producto,
		presentaciones_productos.descripcion presentacion,									  
		productos.precio,									  
		productos.cantidad_disponible,									  
		productos.cantidad_minima,									  
		productos.cantidad_maxima									  
	FROM productos									  
		INNER JOIN categorias_productos ON productos.id_categoria_producto = categorias_productos.id_categoria_producto
		INNER JOIN presentaciones_productos ON productos.id_presentacion_producto = presentaciones_productos.id_presentacion_producto;

CREATE OR REPLACE FUNCTION insertar_producto(
	nombre_producto character varying,
	precio_producto numeric,
	disponible integer,
	minimo integer,
	maximo integer,
	id_presentacion integer,
	id_categoria integer)
    RETURNS integer
    LANGUAGE 'plpgsql'
AS $BODY$
   DECLARE
      idproducto integer;
BEGIN
	idproducto = 0;
	
	INSERT INTO productos(
		nombre, precio, cantidad_disponible, cantidad_minima, cantidad_maxima, id_presentacion_producto, id_categoria_producto)
		VALUES (nombre_producto, precio_producto, disponible, minimo, maximo, id_presentacion, id_categoria)
		RETURNING id_producto into idproducto;
	RETURN idproducto;
END;
$BODY$;