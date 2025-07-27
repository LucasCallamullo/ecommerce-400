

## Proyecto WebApp Ecommerce

### Description
Este proyecto es una aplicación web de comercio electrónico completamente funcional desarrollada con Django para el back-end y un front-end responsivo utilizando HTML, CSS (Bootstrap) y JavaScript. La aplicación permite a los usuarios gestionar de manera eficiente carritos, productos y cuentas a través de un sistema CRUD, con actualizaciones de contenido en tiempo real utilizando AJAX. Además, el uso de Pandas y Excel simplifica la carga inicial de datos de productos, permitiendo una configuración rápida y eficiente al importar detalles de productos directamente desde archivos de Excel, facilitando así tener una página completamente funcional con un esfuerzo mínimo.

[![Static Badge](https://img.shields.io/badge/Documentation-EN-blue)](https://github.com/LucasCallamullo/generic-ecommerce-project/blob/main/README.md) [![Documentation ES](https://img.shields.io/badge/Documentation-ES-green)](https://github.com/LucasCallamullo/generic-ecommerce-project/blob/main/README-es.md)

### [EN]

### ⚙️ Technologies
| ![Python Badge](https://img.shields.io/badge/python-%2314354C.svg?style=for-the-badge&logo=python&logoColor=white) | ![Django Badge](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=green) | ![MySQL Badge](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white) | ![Pandas Badge](https://img.shields.io/badge/Pandas-2C2D72?style=for-the-badge&logo=pandas&logoColor=white)
|:-:|:-:|:-:|:-:|


| ![HTML Badge](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) | ![JavaScript Badge](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E) | ![CSS Badge](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) | ![Bootstrap 5 Badge](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white) | 
|:-:|:-:|:-:|:-:|


### 🛠️ Tools 
| ![Git Badge](https://img.shields.io/badge/git%20-%23F05033.svg?&style=for-the-badge&logo=git&logoColor=white) | [![GitHub Badge](https://img.shields.io/badge/github%20-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white)](https://github.com/LucasCallamullo) | ![VSCode Badge](https://img.shields.io/badge/VSCode-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white) | ![DBeaver Badge](https://img.shields.io/badge/dbeaver-382923?style=for-the-badge&logo=dbeaver&logoColor=white)
|:-:|:-:|:-:|:-:|



## Características
* RESTful API: Implementado con Django para manejar todas las operaciones CRUD para el carrito, productos y usuarios.
* Actualizaciones en Tiempo Real: Uso de AJAX para una experiencia de usuario sin interrupciones, particularmente en acciones de carrito o inicio de sesión dentro de la aplicación.
* Base de Datos MySQL: Conexión y manipulación de datos a través del ORM de Django.
* Despliegue: La aplicación está desplegada en Railway, asegurando fácil acceso y escalabilidad.
* Interfaz Responsiva: Diseño adaptativo para diferentes dispositivos utilizando HTML, CSS y Bootstrap 5.

Desplegado en Railway: [https://generic-ecommerce-project-production.up.railway.app](https://generic-ecommerce-project-production.up.railway.app)

<br></br>

## Principales Endpoints de la API

- **POST /carrito/update/**: Endpoint AJAX para gestionar las acciones del carrito (agregar, reducir, eliminar productos). Devuelve un HTML renderizado si tiene éxito; de lo contrario, muestra mensajes de advertencia al usuario como fuera de stock, producto agregado o producto eliminado. La solicitud debe incluir los siguientes detalles en el cuerpo:
  - **Datos del cuerpo de la solicitud:**
    - `producto_id` (int): ID del producto a agregar.
    - `value` (int): Cantidad del producto.
    - `action` (str): Acción a realizar (`add`, `less`, `remove`).
    - `cart_view` (str): Indica si el usuario está en la vista del carrito (`true`, `false`).

- **GET /search-product/**: Endpoint AJAX para filtrar productos por nombre, categoría, subcategoría o consulta de búsqueda previa. Responde con HTML para actualizar dinámicamente la interfaz de usuario. Los parámetros de filtro se obtienen mediante el método GET.
  - **Parámetros de la URL:**
    - `topQuery` (str): Cadena de búsqueda previa para los productos.
    - `categoryId` (int): ID de la categoría para filtrar.
    - `subCategoryId` (int): ID de la subcategoría para filtrar.
    - `inputNow` (str): Entrada actual para búsqueda en tiempo real (activada con 3 o más letras).

## Otras Funcionalidades
La mayoría de las funcionalidades del sitio se renderizan directamente a través de vistas de Django, proporcionando una experiencia de usuario directa y sin interrupciones. Las operaciones CRUD para productos y usuarios se manejan a través de estas vistas.

## Instalación y Configuración
1. **Clone the repository:**:
   ```bash
   git clone https://github.com/LucasCallamullo/generic-ecommerce-project.git
   cd Generic-E-Commerce

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt

3. **Apply Migrations: Run the migrations to create the tables in the database**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate

4. **Run the load_data_project Script: This command will load initial data into your database using pandas and openpyxl**
   ```bash
   python manage.py load_data_project
