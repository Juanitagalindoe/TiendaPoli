# 🛍️ Sistema de Gestión de Ventas - Spring Boot

Un sistema completo de gestión de ventas desarrollado con **Spring Boot 3.5.6**, **Thymeleaf**, **JPA/Hibernate** y **H2 Database**.

## 📋 Descripción

Este proyecto implementa un sistema CRUD completo para la gestión de:
- **Clientes** 👤
- **Productos** 🛍️ 
- **Facturas (Encabezados)** 🧾
- **Detalles de Factura** 📋

## 🚀 Características

### ✨ Funcionalidades Principales
- ✅ **CRUD Completo** para todas las entidades
- ✅ **Validaciones robustas** en backend y frontend
- ✅ **Interfaz responsive** con diseño moderno
- ✅ **Búsqueda en tiempo real** en todas las listas
- ✅ **Modales de confirmación** para eliminaciones
- ✅ **Alertas auto-ocultables** (5 segundos)
- ✅ **Cálculos automáticos** en detalles de factura

### 🎨 Diseño y UX
- **Paleta de colores**: Azul-verde elegante
- **Diseño responsive** para móviles y desktop
- **Animaciones suaves** en transiciones
- **Iconografía consistente** en toda la aplicación
- **Footer informativo** con tecnologías utilizadas

### 🔒 Validaciones Implementadas

#### Clientes
- **ID**: 6-12 dígitos numéricos
- **Nombre/Apellido**: Solo letras, mínimo una palabra
- **Fecha de Registro**: Entre hace 80 años y hoy
- **Email**: Formato válido

#### Productos
- **Nombre/Descripción**: Solo letras y espacios
- **Valor Unitario**: Número positivo
- **Stock**: No negativo

#### Facturas (Encabezados)
- **Cliente**: Debe existir y ser válido
- **Fecha/Hora**: No nulas, fecha no futura
- **Valores monetarios**: Positivos y coherentes

#### Detalles
- **Cantidad**: Mayor a cero
- **Cálculos automáticos**: Subtotal y total
- **Descuento**: No negativo, no mayor al subtotal

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Java** | 17+ | Lenguaje de programación |
| **Spring Boot** | 3.5.6 | Framework principal |
| **Spring Data JPA** | - | Persistencia de datos |
| **Hibernate** | - | ORM |
| **Thymeleaf** | - | Motor de plantillas |
| **H2 Database** | - | Base de datos en memoria |
| **Maven** | - | Gestión de dependencias |
| **HTML5/CSS3** | - | Frontend |
| **JavaScript** | ES6+ | Interactividad |

## 📦 Estructura del Proyecto

```
src/
├── main/
│   ├── java/ejercicio/parcial/
│   │   ├── Controllers/          # Controladores REST
│   │   ├── Models/
│   │   │   ├── Entity/          # Entidades JPA
│   │   │   └── DAO/             # Interfaces y DAO
│   │   └── Service/             # Lógica de negocio
│   └── resources/
│       ├── templates/           # Plantillas Thymeleaf
│       │   └── form/           # Formularios
│       ├── static/
│       │   ├── CSS/            # Estilos
│       │   └── JS/             # Scripts
│       └── application.properties
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Java 17 o superior
- Maven 3.6+
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/[tu-usuario]/sistema-gestion-ventas.git
   cd sistema-gestion-ventas
   ```

2. **Compilar el proyecto**
   ```bash
   ./mvnw clean compile
   ```

3. **Ejecutar la aplicación**
   ```bash
   ./mvnw spring-boot:run
   ```

4. **Acceder a la aplicación**
   - URL: `http://localhost:8010`
   - Consola H2: `http://localhost:8010/h2-console`
     - JDBC URL: `jdbc:h2:mem:dataBase`
     - Usuario: `sa`
     - Contraseña: (vacía)

## 📱 Uso de la Aplicación

### Navegación Principal
- **🏠 Menú Principal**: Acceso a todos los módulos
- **👤 Clientes**: Gestión de información de clientes
- **🛍️ Productos**: Catálogo de productos y precios
- **🧾 Facturas**: Encabezados de ventas
- **📋 Detalles**: Items específicos de cada factura

### Funcionalidades por Módulo

#### Gestión de Clientes
- Registrar nuevos clientes con validaciones
- Modificar información existente
- Eliminar con confirmación modal
- Búsqueda por cualquier campo

#### Gestión de Productos
- Agregar productos con precio y stock
- Actualizar información y precios
- Control de inventario
- Búsqueda inteligente

#### Sistema de Facturación
- Crear facturas asociadas a clientes
- Gestionar detalles con cálculos automáticos
- Aplicar descuentos por item
- Visualizar totales en tiempo real

## 🎯 Características Técnicas

### Patrones de Diseño
- **MVC (Model-View-Controller)**
- **DAO (Data Access Object)**
- **Service Layer Pattern**
- **Dependency Injection**

### Validaciones
- **Backend**: Validaciones robustas en servicios
- **Frontend**: Validaciones en tiempo real con JavaScript
- **Base de datos**: Constraints JPA/Hibernate

### Seguridad
- **Validación de entrada** en todos los formularios
- **Sanitización** de datos
- **Prevención XSS** con Thymeleaf

## 👥 Autores

- **Juanita Galindo** - Desarrollo Frontend y Backend
- **Juan E Hoyos M.** - Arquitectura y Base de Datos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:
- 📧 Email: [tu-email@ejemplo.com]
- 🐛 Issues: [GitHub Issues](https://github.com/[tu-usuario]/sistema-gestion-ventas/issues)

---

⭐ **¡Dale una estrella si te gustó el proyecto!** ⭐