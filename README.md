## Proyecto WebApp Ecommerce

### Description
This project is a fully functional Ecommerce WebApp developed with Django for the back-end and a responsive front-end using HTML, CSS (Bootstrap), and JavaScript. The application allows users to efficiently manage carts, products and accounts through a CRUD system, real-time content updates using AJAX. Additionally, the use of Pandas and Excel simplifies the initial loading of product data, allowing for quick and efficient setup by importing product details directly from Excel files, making it easy to have a fully functional page with minimal effort.

[![Static Badge](https://img.shields.io/badge/Documentation-EN-blue)](#english-doc) [![Documentation ES](https://img.shields.io/badge/Documentation-ES-green)](https://github.com/LucasCallamullo/generic-ecommerce-project/blob/main/README-es.md)

<a id="english-doc"></a>
### [EN]

### Technologies
- #### Back-End
| [![Python Badge](https://img.shields.io/badge/python-%2314354C.svg?style=for-the-badge&logo=python&logoColor=white)](#features-id) | [![Django Badge](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=green)](#features-id) | [![DRF Badge](https://img.shields.io/badge/django%20rest-ff1709?style=for-the-badge&logo=django&logoColor=white)](#features-id) | [![MySQL Badge](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)](#features-id) | [![Pandas Badge](https://img.shields.io/badge/Pandas-2C2D72?style=for-the-badge&logo=pandas&logoColor=white)](#features-id) |
|:-:|:-:|:-:|:-:|:-:|

- ####  Fornt-End
| [![HTML Badge](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#features-id) | [![JavaScript Badge](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)](#features-id) | [![CSS Badge](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#features-id) | [![Bootstrap 5 Badge](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)](#features-id) | 
|:-:|:-:|:-:|:-:|

- #### Tools 
| [![Postman Badge](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=Postman&logoColor=white)](#postman-id) | [![Git Badge](https://img.shields.io/badge/git%20-%23F05033.svg?&style=for-the-badge&logo=git&logoColor=white)](#features-id) | [![GitHub Badge](https://img.shields.io/badge/github%20-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white)](https://github.com/LucasCallamullo) | [![DBeaver Badge](https://img.shields.io/badge/dbeaver-382923?style=for-the-badge&logo=dbeaver&logoColor=white)](#features-id)
|:-:|:-:|:-:|:-:|

- #### Deploy
| [![Railway Badge](https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white)](https://generic-ecommerce-project-production.up.railway.app) |
|:-:|
Deployed to Railway: https://web-production-8e84.up.railway.app

<br></br>
### Features
<a id="features-id"></a>
* **Django Web Application**: Utilizes Django’s architecture to handle server-side rendering, dynamic content loading, and data filtering through internal endpoints.

* **Django Rest Framework (DRF)**: Provides scalable JSON-based API endpoints, enabling future expansion for client-side rendering and interactivity.

* **MySQL Database**: Managed through Django's ORM, with efficient database handling tools like DBeaver for easy management.

* **AJAX with Vanilla JavaScript**: Implements real-time page updates for dynamic content replacement (e.g., cart updates, product filters) via server-rendered HTML.

* **Responsive Frontend**: Built with HTML, CSS, Bootstrap 5, and Swiper.js for improved visual interaction and mobile-friendly design.

* **Deployment on Railway**: Deployed for easy access and scalability, with proper configuration for production deployment.

* **Payment Integration**: Mercado Pago API integration for secure payment processing.

* **Bulk Product Import with Pandas**: Uses Pandas to import large product datasets from Excel, streamlining bulk data entry.

<br></br>
<a id="postman-id"></a>
### API Endpoints - Postman Collection 
* You can access the Postman collection using the following public link: [Postman Collection](https://documenter.getpostman.com/view/41618970/2sAYQiAnKz).
* (Optional) You can import the Postman collection and envoirments from the folder docs/

<br></br>

### Installation and Setup
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

4. **Run the load_data Script: This command will load initial data into your database using pandas and openpyxl**
   ```bash
   python manage.py load_data_project


### [ES]
[![Documentation ES](https://img.shields.io/badge/Documentation-ES-green)](https://github.com/LucasCallamullo/generic-ecommerce-project/blob/main/README-es.md)

### Images:
![](https://media.discordapp.net/attachments/1028131678209720431/1333499973337350235/image.png?ex=67991e20&is=6797cca0&hm=5954c4aae4a0b55d03b6aec65e5ea2760162838de60435e6b13e6f01962b5677&=&format=webp&quality=lossless&width=768&height=388)

![](https://media.discordapp.net/attachments/1028131678209720431/1333500687346176030/image.png?ex=67991ecb&is=6797cd4b&hm=7cef51f2987d2c1613b28c292bbf9bfc2c842e8333803e91024084677d86b3a1&=&format=webp&quality=lossless&width=768&height=390)
> Some screens of the app

<br></br>

### 💻 Contact Back-End Developer / Full-Stack Developer:

| ![GitHub Badge](https://img.shields.io/badge/github-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white) | ![LinkedIn Badge](https://img.shields.io/badge/linkedin-%230077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white) | ![YouTube Badge](https://img.shields.io/badge/YouTube%20-%23FF0000.svg?&style=for-the-badge&logo=YouTube&logoColor=white) | ![Gmail Badge](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white) |
|:---:|:---:|:---:|:---:|
| [GitHub](https://github.com/LucasCallamullo) | [LinkedIn](https://www.linkedin.com/in/lucas-callamullo/) | [YouTube](https://www.youtube.com/@lucas_clases_python) |  [Email](mailto:lucascallamullo98@gmail.com) |
