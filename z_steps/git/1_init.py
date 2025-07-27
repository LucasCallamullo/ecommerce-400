



"""  
# ==========================================================================
#             Mantener actualizado tu proyecto, hacer commits
# ==========================================================================

# NOTE Para actualizar con cambios desde tu github usar
git pull origin main  

# NOTE Para realizar commits en tu proyecto con tus modificaciones usar:
git add .
git commit -m "update responsive css"
git push origin main


# =============================================================================
#                 Iniciar el proyecto con git              
# =============================================================================

# NOTE ir aplicando paso por paso en nuestra terminal del proyecto

echo "# generic-ecommerce-project" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin url_repository
git push -u origin main


# NOTE crear un archivo .gitignore para no subir carpetas innecesarias

# NOTE .gitignore    ( Example )

# Ignorar el entorno virtual
venv/
.venv/

# Archivos de caché de Python
__pycache__/
*.pyc

# Migraciones
*/migrations/

# Ignorar mi carpeta de steps y proofs
z_retirados/
z-steps/

# Carpeta del collecstatic que se genera
staticfiles

# Base de datos de prueba
db.sqlite3

# archivo de entorno .env no subir posee keys
.env


# NOTE agregar nuestro archivo .gitignore

git add .gitignore
git commit -m "Add .gitignore file"
git push origin main


# ==========================================================================
#             Clonar repositorio 
# ==========================================================================

# NOTE en caso de estar trabajando con un repositorio, ir a tu terminal en tu nueva carpeta de proyecto

git clone https://github.com/LucasCallamullo/generic-ecommerce-project.git
cd c20-12-m-python-react


# =============================================================================
#             FUNCIONALIDADES AVANZADAS DE GIT
# =============================================================================

# NOTE Ver el estado actual del repositorio y las ramas
git status                # Muestra los cambios no añadidos al stage
git branch                # Lista todas las ramas locales
git branch -r             # Lista todas las ramas remotas

# NOTE Crear y trabajar con ramas
git branch nombre_rama    # Crea una nueva rama
git checkout nombre_rama  # Cambia a la rama especificada
git checkout -b nombre_rama # Crea y cambia a una nueva rama

# NOTE Fusionar ramas
git merge nombre_rama     # Fusiona la rama especificada con la rama actual

# NOTE Guardar cambios temporales
git stash                 # Guarda los cambios no confirmados en una pila temporal
git stash apply           # Recupera los cambios guardados en la pila

# NOTE Eliminar ramas
git branch -d nombre_rama     # Elimina una rama local (solo si está fusionada)
git branch -D nombre_rama     # Fuerza la eliminación de una rama local

# NOTE Ver historial de commits
git log                   # Muestra el historial de commits
git log --oneline         # Muestra el historial de commits en formato compacto
git log --graph           # Muestra un gráfico del historial de commits

# NOTE Deshacer cambios
git reset archivo         # Quita un archivo del área de stage
git checkout archivo      # Restaura un archivo al estado del último commit
git reset --soft HEAD~1   # Deshace el último commit, manteniendo los cambios en el área de stage
git reset --hard HEAD~1   # Deshace el último commit y elimina los cambios

# NOTE Trabajar con etiquetas
git tag nombre_etiqueta   # Crea una etiqueta en el último commit
git tag                   # Lista todas las etiquetas
git push origin nombre_etiqueta  # Sube una etiqueta al repositorio remoto

# NOTE Eliminar archivos del repositorio pero mantenerlos localmente
git rm --cached archivo   # Elimina un archivo del control de versiones, pero no del disco
git rm -r --cached carpeta # Lo mismo, pero para carpetas

# NOTE Ver diferencias entre commits o ramas
git diff                  # Muestra las diferencias entre los cambios no confirmados
git diff commit1 commit2  # Compara las diferencias entre dos commits
git diff nombre_rama_1 nombre_rama_2  # Compara dos ramas

# NOTE Configuración de usuario global o local
git config --global user.name "Tu Nombre"  # Configura tu nombre globalmente
git config --global user.email "tuemail@ejemplo.com"  # Configura tu correo globalmente
git config user.name "Tu Nombre"           # Configura tu nombre solo para el repositorio actual
git config user.email "tuemail@ejemplo.com" # Configura tu correo solo para el repositorio actual

# NOTE Configuración avanzada para ignorar cambios locales en archivos específicos
git update-index --assume-unchanged archivo # Ignora cambios en un archivo (temporalmente)
git update-index --no-assume-unchanged archivo # Vuelve a rastrear cambios en un archivo

# =============================================================================
#             TIPS Y TRUCOS
# =============================================================================

# NOTE Clonar un repositorio solo con una rama específica (útil para proyectos grandes)
git clone -b nombre_rama --single-branch url_repositorio

# NOTE Buscar en el historial de commits
git log --grep="término_de_búsqueda"  # Busca commits que contengan el término

# NOTE Configurar alias para comandos frecuentes (en .gitconfig o directamente en la terminal)
git config --global alias.st status   # Ahora puedes usar `git st` en lugar de `git status`
git config --global alias.co checkout # Alias para cambiar ramas más rápido

# NOTE Subir cambios a un branch remoto diferente
git push origin nombre_rama_local:nombre_rama_remota

# NOTE Restablecer cambios locales con la versión remota
git fetch origin             # Obtiene los cambios remotos
git reset --hard origin/main # Restablece tu rama local con el estado de la remota


"""