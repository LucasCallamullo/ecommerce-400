

'''
¿Cómo integrar ImgBB en Django?
En ImgBB, puedes subir imágenes con su API y recibir la URL para guardarla en tu base de datos.

Crea una cuenta en ImgBB https://imgbb.com
Obtén tu API Key en https://api.imgbb.com/




# NOTE Instala requests si no lo tienes: 
pip install requests

# views.py
import requests
from django.http import JsonResponse

def upload_to_imgbb(request):
    if request.method == "POST" and request.FILES.get("image"):
        image = request.FILES["image"].read()
        api_key = "TU_API_KEY"

        response = requests.post(
            "https://api.imgbb.com/1/upload",
            params={"key": api_key},
            files={"image": image}
        )

        data = response.json()
        if data["success"]:
            return JsonResponse({"image_url": data["data"]["url"]})
        else:
            return JsonResponse({"error": "Error uploading image"}, status=400)

    return JsonResponse({"error": "No image uploaded"}, status=400)


# html form
<form id="upload-form">
    {% csrf_token %}
    <input type="file" id="image-input" name="image">
    <button type="submit">Subir Imagen</button>
</form>

<script>
    document.getElementById("upload-form").onsubmit = async function(event) {
        event.preventDefault();
        let formData = new FormData();
        formData.append("image", document.getElementById("image-input").files[0]);
    
        try {
            let response = await fetch("/upload-to-imgbb/", {
                method: "POST",
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: formData
            });
    
            if (!response.ok) {
                throw new Error("Error en la subida de imagen");
            }
    
            let data = await response.json();
            console.log("Imagen subida: ", data.image_url);
            openAlert("Imagen Subida");
    
        } catch (error) {
            console.error("Error:", error);
            openAlert("Error al subir la imagen.");
        }
    };
</script>
'''