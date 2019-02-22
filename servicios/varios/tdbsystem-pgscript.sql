-- TDBSystem (Base de datos para el Sistema "Tienda de Barrio"), versión 0.1
-- Un simple modelo de bases de datos para fines académicos

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
	id_categoria_producto SERIAL NOT NULL,
	nombre varchar NOT NULL,
	PRIMARY KEY(id_categoria_producto)
);

CREATE TABLE presentaciones_productos (
	id_presentacion_producto SERIAL NOT NULL,
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
	id_baja_producto int4 NOT NULL,
	tipo_baja varchar NOT NULL,
	cantidad int2 NOT NULL DEFAULT 0,
	precio_producto numeric NOT NULL DEFAULT 0,
	id_presentacion_producto int4 NOT NULL,
	PRIMARY KEY(id_baja_producto),
	CONSTRAINT tipos_bajas CHECK (tipo_baja IN ('Donación', 'Daño', 'Pérdida', 'Descomposición', 'Destrucción', 'Exclusion')),
	CONSTRAINT ref_baja_productos__producto FOREIGN KEY (id_presentacion_producto)
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
	cantidad_producto int2 NOT NULL DEFAULT 0,
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
	cantidad_producto int2 NOT NULL DEFAULT 0,
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
	cantidad_producto int2 NOT NULL DEFAULT 0,
	PRIMARY KEY(id_detalle_devolucion_compra),
	CONSTRAINT ref_detalle_devolucion_pedido__devolucion_pedido FOREIGN KEY (id_devolucion_compra)
		REFERENCES devoluciones_compras(id_devolucion_compra)
	MATCH SIMPLE
	ON DELETE NO ACTION
	ON UPDATE CASCADE
	NOT DEFERRABLE
);
