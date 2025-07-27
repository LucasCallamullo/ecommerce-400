






cadena = "ALGO"



def es_vocal(car):
    return "aeiou"
def es_digito(car):
    return "0123456789"







def main():
    
    
    for i in cadena:
        
        # dentro de la palabra 
        if i != " " and i != ".":
            
            indice += 1
            
            # PUNTO 4
            # Consigna, que comienze con "de"
            
            # PUNTO 4

            if tiene_d and i.lower() == "i":
                # aca guardas normal si tiene di
                tiene_di = True
                tiene_d = False
                
                # aca realmente te guardas si empieza o no con di, cuando la sigla del indice vale 2
                if indice == 2:
                    r4_comienza_di = True
                
            elif i.lower() == "d":
                tiene_d = True
                
            else:
                tiene_d = False





def main():
    
    
    # 1. Determinar la cantidad de palabras que tienen un dígito en la segunda y en la cuarta posición, pero de tal
    # forma que el resto de sus caracteres son letras mayúsculas. Por ejemplo, en el texto: "La pieza D3A5CED
    # reemplaza a la a4j5TY pero no a la 234DFR." hay solo una palabra que cumple: "D3A5CED". El resto de las
    # palabras no tienen los dígitos pedidos o tienen alguna minúscula.
    indice = 0
    r1 = 0
    r1_tiene_digitos = 0
    r1_tiene_mayuscula = True    # vas a decir que son todas mayus hasta demostrar lo contrario
    
    for i in cadena:
        
        if i != " " and i != ".":
            indice += 1

            r1_valide_digito = r1_validar_digitos(i)
            r1_valide_mayus = r1_validar_mayus(i)    # retornos True si es mayus ( no te importa )
                                                    # or False si NO es mayus ( este es el bueno )

            # aca me falto decir esto es un or, porque te dice en el digito 2 y 4, pero realmente
            # se refiere a que tiene que tener tanto en el 2 como en el 4
            if r1_valide_digito and (indice == 2 or indice == 4):
                r1_tiene_digitos += 1

            # en este indice va un and, porque el or diría si es uno o el otro lo cual no es cierto tiene 
            # que no ser ninguno de los dos, despues tu bandera de mayus debería estar en falso, porque
            # te importa el caso de que no sea mayus
            if not r1_valide_mayus and (indice != 2 and indice != 4):
                r1_tiene_mayuscula = False    # como no te toco una mayus en indices distintos a esos apagas
                                            # porque ya no se cumple que sean todas mayus


        else: #fuera
            if r1_tiene_digitos == 2 and r1_tiene_mayuscula:
                r1 += 1

            #apagar
            indice = 0
            r1_tiene_digitos = 0
            r1_tiene_mayuscula = True
                
                
def main():
    
    
    for i in cadena:
        
        # dentro de la palabra 
        if i != " " and i != ".":
            
            indice += 1
            
            # PUNTO 4
            # Consigna, que comienze con "de"
            
            if tiene_d and i.lower() == "e" and indice == 2:  # en verdad no hace falta doble verificacion
                tiene_de = True
                tiene_d = False    
            elif i.lower() == "d" and indice == 1:           # con verificar en alguno de los dos ya estaría
                tiene_d = True
            else:
                tiene_d = False



def main():
    
    # Determinar cuántas palabras comienzan con la letra "l" (ele) y tienen el digito "3".
    contador_de_letras = 0    # bien esto es para contar y verificar si es la primera letra 
    contador_de_I = 0        # no esta mal, aunque realmente podría ser una bandera porque te dice
                            # COMIENZA o NO COMIENZA
    tiene_3 = False        # bien esto bandera para saber si TIENE o NO TIENE
    
    for car in cadena:
        # fuera de la palabra
        if car in " .":
            # Punto 1
            # como haces un contador deberias verificarlo asi, sino sería la bandera en True
            if contador_de_I == 1 and tiene_3:        # tiene 3 es para saber si tenía el digito 3
                r1 += 1
        
            # resetear banderas / contadores            # siempre reinicia al final
            contador_de_letras = 0
            contador_de_I = 0
            tiene_3 = False
            
        # dentro de la palabra
        else:
            # Punto 1
            contador_de_letras += 1     # siempre al principio asi va sumando acordate
                                        # esto sería como un indice acordate para saber en que posicion estas     
            # ahora para verificar si comienza con L ( minus o mayus)
            if contador_de_letras == 1 and car in "lL":    
                contador_de_I += 1    # aunque capaz sería mas logica una bandera igual sirve un contador
                                    # mientras sepas como verificar despues
            # verifica si tiene el 3, en cualquier parte, no especifica
            if car == "3":    # o car in "3" tambien sirve
                tiene_3 = True
                
            





def principal():
    m= open("entrada.txt")
    texto= m.read()
    m.close()
    r1= 0
    r2 = 0
    contador_de_letras = 0
    contador_de_I = 0
    tiene_3 = False
    tiene_vocal = 0
    tiene_3_y_t = False
    tiene_digito_4ta_posicion = False



    #fuera de la palabra
    for car in texto:
        if car in " .":
            if contador_de_letras == 1 and contador_de_I == 1 and tiene_3:
                r1+= 1
            contador_de_letras = 0
            contador_de_I = 0
            tiene_3 = False

            if contador_de_letras == 1 and es_vocal(car) and contador_de_letras == 3 and tiene_3_y_t:
                r3 += 1

            if es_digito(car) <= 1:
                if contador_de_letras == 4 :
                    r4+= 1

        #dentro de la palabra
    else:
        contador_de_letras += 1
        if car in "i":
            contador_de_I += 1

        if car in "3":
            tiene_3 = True

        if es_vocal(car):
            tiene_vocaL += 1

        if car in "t":
            tiene_3_y_t = True

        if es_digito(car):
            tiene_digit0_4ta_posicion = True

def main():
    
    
    # Determinar cuántas palabras tienen al menos dos vocales e incluyen la "c".
    r1 = 0    # contador de palabras
    cont_vocales = 0    # contador de vocales, porque te piden DOS o más
    tiene_c = False    # bandera porque solo te piden que TIENE o NO TIENE
    
    for car in cadena:
        # fuera de la palabra
        if car in " .":
            # Punto 1
            if cont_vocales >= 2 and tiene_c:
                r1 += 1
                
            # resetear banderas / contadores
            cont_vocales = 0
            tiene_c = False
            
        # dentro de la palabra
        else:
            # Punto 1
            if es_vocal(car):
                cont_vocales += 1
                
            if car.lower() == "c":
                tiene_c = True







def es_vocal(car):
    return "aeiou"
def es_digito(car):
    return "0123456789"








def principal():
    m= open("entrada.txt")
    texto= m.read()
    m.close()
    r1= 0
    r2 = 0
    contador_de_letras = 0
    r1_tiene_mas_de_6_caracteres = False
    r2_tiene_mas_de_4_caracteres = False
    tiene_2_vocales_y_letra_c = False
    tiene_al_menos_un_digito = False
    tiene_1_o_5 = False
    tiene_a_e = False
    tiene_s_y_tiene_digito_multiplo_de_3 = False



    #fuera de la palabra
    for car in texto:
        if car in " .":

            #ejercicio 1
            if r1_tiene_mas_de_6_caracteres:
                r1+= 1
            #resetear contadores
            contador_de_letras = 0
            r1_tiene_mas_de_6_caracteres = False
            #ejercicio 2
            if r2_tiene_mas_de_4_caracteres:
                r2+= 1

            contador_de_letras = 0
            r2_tiene_mas_de_4_caracteres = False

            #ejercicio 3
            if tiene_2_vocales_y_letra_c:
                r3+= 1
            contador_de_letras = 0
            tiene_2_vocales_y_letra_c = False

            #ejercicio 4
            if tiene_al_menos_un_digito:
                r4 += 1
            contador_de_letras = 0
            tiene_al_menos_un_digito = False
            
            #ejercicio 5
            if tiene_1_o_5:
                r5 += 1
            contador_de_letras = 0 
            tiene_1_o_5 = False
            
            
            #ejercicio 6
            if tiene_a_e:
                r6 += 1
            contador_de_letras = 0
            tiene_a_e = False
            
            #ejercicio 7
            if tiene_s_y_tiene_digito_multiplo_de_3:
                r7 += 1
            contador_de_letras = 0
            tiene_s_y_tiene_digito_multiplo_de_3 = False
            
                
            

        #dentro de la palabra
        else:
            #ejercicio 1
            contador_de_letras += 1
            if contador_de_letras > 6:
                r1_tiene_mas_de_6_caracteres = True
        #ejercicio 2
            if contador_de_letras > 4 and car in "a":
                r2_tiene_mas_de_4_caracteres = True

        #ejercicio 3
            if es_vocal(car) <= 2 and car in "c":
                tiene_2_vocales_y_letra_c = True
        #ejercicio 4
            if es_digito(car) > 1:
                tiene_al_menos_un_digito = True
                
        #ejercicio 5
            if car in "1" or car in "5":
                tiene_1_o_5 = True
                
                
        if contador_de_letras == 4 and car in "a" or car in "e":
            tiene_a_e = True
            
        if car in "s" and es_digito(car) % 3 == 0:
            tiene_s_y_tiene_digito_multiplo_de_3 = True


















def principal():

    cadena = "algo"
    
    # Determinar la cantidad de palabras que terminan con un dígito 
    # pero no tienen ninguna mayúscula.
    r1 = 0
    ult_car = ""    # ultimo caracter
    tiene_mayus = False    # para detectar si tiene mayus

    for i in cadena:
        
        # dentro de la palabra
        if i != " " and i != ".":

            # la teoría es guardarte el caracter que toco asi sabes cual es el ultimo            
            ult_car = i
            
            if "A" <= i <= "Z":
                tiene_mayus = True
            
        # fuera de la palabra
        else:
            
            # preguntar si tenes un digito guardado en tu ult_car
            if ult_car in "0123456789" and not tiene_mayus:
                r1 += 1
              
            # reiniciar banderas
            ult_car = ""    # ultimo caracter
            tiene_mayus = False    # para detectar si tiene mayus