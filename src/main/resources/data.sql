insert into CLIENTE (ID, NOMBRE, APELLIDO, CORREO , Registro )
values (1001115027 ,'Pepito','Perez','pp@gmail.com','2000-01-01');
insert into CLIENTE (ID, NOMBRE, APELLIDO, CORREO , Registro ) 
values(1023643030,'Juan', 'Gonzalez', 'jg@gmail.com','2003-10-25');


insert into PRODUCTO (ID, NOMBRE, DESCRIPCION, VLR_UNIT, STOCK) 
values (1,'Arroz', 'Para consumo diario',3000.0,44);
insert into PRODUCTO (ID, NOMBRE, DESCRIPCION, VLR_UNIT, STOCK) 
values (2,'Frijol', 'Para consumo diario',4000.0,25);

-- Reiniciar el contador de la secuencia para la columna ID de la tabla PRODUCTO
ALTER TABLE producto ALTER COLUMN id RESTART WITH 3;