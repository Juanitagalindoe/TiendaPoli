insert into CLIENTE (ID, NOMBRE, APELLIDO, CORREO , Registro )
values (1001115027 ,'Pepito','Perez','pp@gmail.com', PARSEDATETIME('2000-01-01', 'yyyy-MM-dd'));
insert into CLIENTE (ID, NOMBRE, APELLIDO, CORREO , Registro ) 
values(1023643030,'Juan', 'Gonzalez', 'jg@gmail.com', PARSEDATETIME('2003-10-25', 'yyyy-MM-dd'));


insert into PRODUCTO (ID, NOMBRE, DESCRIPCION, VLR_UNIT, STOCK) 
values (1,'Arroz', 'Para consumo diario',3000.0,44);
insert into PRODUCTO (ID, NOMBRE, DESCRIPCION, VLR_UNIT, STOCK) 
values (2,'Frijol', 'Para consumo diario',4000.0,25);

-- Reiniciar el contador de la secuencia para la columna ID de la tabla PRODUCTO
ALTER TABLE producto ALTER COLUMN id RESTART WITH 3;

INSERT INTO ENCABEZADO (NRO_VENTA, SUBTOTAL, FECHA, HORA, DCTO, TOTAL, ESTADO, CLIENTE_ID) 
VALUES (1, 0, PARSEDATETIME('2025-09-26', 'yyyy-MM-dd'), '21:23:05', 0, 0, 'FINALIZADA', 1001115027);

