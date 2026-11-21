-- Equipo del nodo anfitrión (gestores, sin PIN: el admin se los asigna desde la app)
-- y contactos externos conocidos (sin teléfono: el equipo los completa).
insert into gestores (nombre, rol) values
  ('Luis Balderas', 'admin'), ('Wendy Balderas', 'gestor'), ('Alexia Cano', 'gestor'), ('Karla Uribe', 'gestor'),
  ('Marcos Espinosa', 'gestor'), ('Isaac Ramos', 'gestor'), ('Moises Cuenca', 'gestor'), ('Mahely Vidal', 'gestor'),
  ('Nadia Burgos', 'gestor'), ('Chepe Bolaños', 'gestor'), ('Dennis Rios', 'gestor')
on conflict (nombre) do nothing;

insert into contactos (nombre, organizacion, rol, tipo, sede)
select * from (values
  ('Hotel City Express Tula', 'City Express', 'Hospedaje y desayunos', 'proveedor', 'hotel'),
  ('Parque Nacional Tula', 'INAH', 'Sede de inauguración (permiso INAH)', 'anfitrion', 'tula'),
  ('Presidente de Xoxafi', 'Grutas de Xoxafi', 'Anfitrión', 'anfitrion', 'xoxafi'),
  ('Guías de Grutas Xoxafi', 'Grutas de Xoxafi', 'Recorrido (3 grupos)', 'anfitrion', 'xoxafi'),
  ('Alejandro Nahual', null, 'Muralista (Xoxafi)', 'aliado', 'xoxafi'),
  ('Diego Jasso', null, 'Muralista', 'aliado', null),
  ('CIDES', 'CIDES', 'Préstamo de herramienta, carpas y mesas', 'aliado', null),
  ('Citlaly', 'Dirección de Ecología, Villa de Tezontepec', 'Directora', 'anfitrion', 'tezontepec'),
  ('ENOMEX', 'ENOMEX', 'Recorrido 19 dic', 'anfitrion', null),
  ('Lic. Erika Ortigoza', 'COESBIOH', 'Museo y cena 19 dic', 'anfitrion', 'chico'),
  ('Parque Nacional El Chico', 'CONANP', 'Oficinas / capacitación TICS', 'anfitrion', 'chico'),
  ('Ecocombi', 'Ecocombi', 'Desayuno 19 dic', 'proveedor', 'hotel'),
  ('Sr. Vicente', 'Cascadas Dos Mundos', 'Anfitrión comunidad', 'anfitrion', 'acaxochitlan'),
  ('Dr. Iván', null, 'Taller de calidad de agua', 'aliado', 'acaxochitlan'),
  ('Gabriel', 'Ajolotequio', 'Anfitrión', 'anfitrion', 'ajolotequio'),
  ('Jimena', 'Ajolotequio', 'Anfitriona', 'anfitrion', 'ajolotequio'),
  ('SEMARNATH', 'SEMARNATH', 'Donación de maguey', 'aliado', null),
  ('Eduardo Brun', null, 'Donativo kit bombas de semillas', 'patrocinador', null),
  ('Emergencias', null, '911', 'emergencia', null)
) v(nombre, organizacion, rol, tipo, sede)
where not exists (select 1 from contactos);
update contactos set telefono = '911' where nombre = 'Emergencias' and telefono is null;
