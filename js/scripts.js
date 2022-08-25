
class Destino {
    constructor (ciudadDestino, paisDestino, precio, imgURL){
        this.ciudadDestino = ciudadDestino
        this.paisDestino = paisDestino
        this.precio = precio
        this.imgURL = imgURL
    }
}

let tablaCarro = document.getElementById("tabla-carro")
let modalBody = document.getElementById("modal-body")
let precioFinal = 0
let itemIdUnico = 1
let carrito = []

fetch("destinos.json").then((response) => response.json())
.then((data) => {
    let destinos = []
    data.forEach(destino => {
        destinos.push(new Destino(destino.ciudadDestino,destino.paisDestino,
            destino.precio,destino.imgURL))
    });
    popularCarritoConSesion()
    mostrarDestinos(destinos)
})

function popularCarritoConSesion(){
    carrito = obtenerCarritoDeSession()

    for (const item of carrito){
        crearFilaCarrito(item.idDestino, item.cantidad, item)
        itemIdUnico = item.idDestino+1
    }

    let subtotal = document.getElementById("subtotal")
    if(subtotal == undefined){
        let total = document.createElement("p")
        total.id = "subtotal"
        total.classList.add("d-flex", "justify-content-end")
        total.innerText = precioFinal != 0 ? "Total: $" + precioFinal : ""
        modalBody.append(total)
    } else subtotal.innerText = precioFinal != 0 ? "Total: $" + precioFinal : ""
}
function mostrarDestinos(destinos){
    
    let section = document.getElementById("grid-destinos")
    
    for (const destino of destinos){
        let article = document.createElement("article")
        article.classList.add("card", "align-items-center", "bg-light", "pb-5", "mb-5", "mx-4")

        let imagen = document.createElement("img")
        imagen.classList.add("card-img-top")
        imagen.setAttribute("src", destino.imgURL)
        imagen.setAttribute("alt", destino.ciudadDestino)
        article.append(imagen)

        let titulo = document.createElement("h4")
        titulo.classList.add("card-title", "m-4")
        titulo.innerText = `${destino.ciudadDestino}, ${destino.paisDestino}`
        article.append(titulo)

        let divPrecio = document.createElement("div")
        divPrecio.classList.add("card-text", "align-self-start", "pt-3", "ms-4", "my-4")
        article.append(divPrecio)

        let precio = document.createElement("p")
        precio.classList.add("card-precio")
        precio.innerText = `Precio por persona: $${destino.precio}`
        divPrecio.append(precio)

        let divCantBtnAgregar = document.createElement("div")
        divCantBtnAgregar.classList.add("d-flex", "align-items-center", "align-self-start", "pt-4", "ms-4")
        article.append(divCantBtnAgregar)

        let labelCant = document.createElement("label")
        labelCant.classList.add("me-2")
        labelCant.setAttribute("for", `cantidad_${destinos.indexOf(destino)}`)
        labelCant.innerText = "Cantidad:"
        divCantBtnAgregar.append(labelCant)

        let selectCant = document.createElement("select")
        selectCant.classList.add("form-select", "form-select-sm")
        selectCant.id = `select-cantidad_${destinos.indexOf(destino)}`
        selectCant.setAttribute("name", "cantidad")
        selectCant.setAttribute("title", "cantidad")
        divCantBtnAgregar.append(selectCant)

        for(let i = 1; i <= 5; i++){
            let opcion = document.createElement("option")
            opcion.value = `${i}`
            opcion.innerText = `${i}`
            selectCant.append(opcion)
        }

        let linkBtnAgregar = document.createElement("a")
        linkBtnAgregar.classList.add("btn", "btn-outline-primary", "btn-sm", "ms-3")
        linkBtnAgregar.id = `btn-destino_${destinos.indexOf(destino)}`
        linkBtnAgregar.addEventListener("click", () => agregarAlCarrito(destino,selectCant))
        linkBtnAgregar.addEventListener("click", () => itemAgregado())
        linkBtnAgregar.innerText = "Comprar"
        divCantBtnAgregar.append(linkBtnAgregar)

        section.append(article)
    }
}

function agregarAlCarrito(destino, selectCant){
    
    let cantidad = selectCant.value
    selectCant.value = "1"
    if(carrito.length != 0 && carrito.find(carro => carro.ciudadDestino == destino.ciudadDestino) != undefined){
        return actualizarCantidad(destino, cantidad)
    }

    let itemIdLocal = itemIdUnico
    crearFilaCarrito(itemIdUnico, cantidad, destino)
    let subtotal = document.getElementById("subtotal")
    if(subtotal == undefined){
        let total = document.createElement("p")
        total.id = "subtotal"
        total.classList.add("d-flex", "justify-content-end")
        total.innerText = "Total: $" + precioFinal
        modalBody.append(total)
    } else subtotal.innerText = "Total: $" + precioFinal

    let itemCarrito = {"idDestino": itemIdLocal, "ciudadDestino": destino.ciudadDestino, "paisDestino": destino.paisDestino, 
        "cantidad": cantidad, "precio": destino.precio, "precioExt": obtenerPrecio(destino.precio, cantidad)}
    carrito.push(itemCarrito)
    sessionStorage.setItem("carrito", JSON.stringify(carrito))
    itemIdUnico++
}

function crearFilaCarrito(itemIdLocal, cantidad, item){
    
    let fila = document.createElement("tr")
    let filaCant = document.createElement("td")
    filaCant.id = `cant_${itemIdLocal}`
    filaCant.classList.add("ps-4")
    filaCant.innerText = cantidad
    fila.append(filaCant)

    let filaDestino = document.createElement("td")
    filaDestino.innerText = `${item.ciudadDestino}, ${item.paisDestino}`
    fila.append(filaDestino)

    let filaPrecio = document.createElement("td")
    filaPrecio.id = `precio_${itemIdLocal}`
    filaPrecio.innerHTML = `${calcularPrecio(cantidad,item.precio)}`
    fila.append(filaPrecio)

    let filaBorrar = document.createElement("td")
    filaBorrar.classList.add("ps-4")
    fila.append(filaBorrar)

    let filaBorrarBtn = document.createElement("button")
    filaBorrarBtn.id = `item${itemIdLocal}`
    filaBorrarBtn.classList.add("borrar")
    filaBorrarBtn.setAttribute("type", "button")
    filaBorrarBtn.addEventListener("click", () => {borrarItem(fila, itemIdLocal)})
    filaBorrar.append(filaBorrarBtn)

    let filaBorrarBtnImg = document.createElement("img")
    filaBorrarBtnImg.setAttribute("src", "img/iconos/delete.png")
    filaBorrarBtnImg.setAttribute("alt", "trash-can")
    filaBorrarBtn.append(filaBorrarBtnImg)

    tablaCarro.append(fila)
}

function itemAgregado(){
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      })
      
      Toast.fire({
        icon: 'success',
        title: 'Item agregado al carro!'
      })
}

function borrarItem(item, idDestino){
    let carritoSession = obtenerCarritoDeSession()
    let itemCarrito = carritoSession.find(destino => destino.idDestino == idDestino)
    precioFinal -= itemCarrito.precioExt

    let subtotal = document.getElementById("subtotal")
    if (precioFinal != 0 && subtotal != undefined){
        subtotal.innerText = "Total: $" + precioFinal
    } else if (subtotal != undefined){
        subtotal.remove()
    }

    item.remove()
    carrito = carrito.filter(carro => carro.idDestino != idDestino)
    sessionStorage.setItem("carrito",JSON.stringify(carrito))
}

function calcularPrecio(cantidad, precio){
    if(cantidad >= 2){
        precioFinal += cantidad*precio*0.75
        return `$${cantidad*precio*0.75} <s>($${cantidad*precio})</s>`
    } else {
        precioFinal += cantidad*precio
        return "$" + cantidad*precio
    }
}

function obtenerPrecio(precio, cantidad){
    if(cantidad >= 2){
        return cantidad*precio*0.75
    } else {
        return cantidad*precio
    }
}

function obtenerCarritoDeSession(){
    let carrito = JSON.parse(sessionStorage.getItem("carrito"))
    return [...carrito || []] ;
}

function actualizarCantidad(destino, cantidad){
    let item = carrito.find(carro => carro.ciudadDestino == destino.ciudadDestino)
    let index = carrito.indexOf(item)
    let cantidadNueva = parseInt(item.cantidad)+parseInt(cantidad)
    if (cantidadNueva > 5){
        cantidadNueva = 5
    } 
    let nuevoItem = {"idDestino": item.idDestino, "ciudadDestino": item.ciudadDestino, "paisDestino": destino.paisDestino,
        "cantidad": `${cantidadNueva}`, "precio": item.precio, "precioExt": obtenerPrecio(item.precio, cantidadNueva)} 
    precioFinal -= carrito[index].precioExt
    carrito[index] = nuevoItem
    sessionStorage.setItem("carrito",JSON.stringify(carrito))
    let filaCant = document.getElementById(`cant_${item.idDestino}`)
    filaCant.innerText = cantidadNueva
    let filaPrecio = document.getElementById(`precio_${item.idDestino}`)
    filaPrecio.innerHTML = `${calcularPrecio(item.precio, cantidadNueva)}`
    let subtotal = document.getElementById("subtotal")
    subtotal.innerText = "Total: $" + precioFinal
}

const confirmarLimpiarCarro = () => {
    Swal.fire({
    title: 'Limpiar Carrito',
    text: "¿Esta seguro que desea limpiar su carrito?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, borrar todo!'
  }).then((result) => {
    if (result.isConfirmed) {
        limpiarCarro();
        Swal.fire(
            'Limpio!',
            'Su carrito fue vaciado!',
            'success'
          )
    }
  });
}

let btnLimpiar = document.getElementById("btn-limpiar")
btnLimpiar.addEventListener("click", confirmarLimpiarCarro)
function limpiarCarro(){
    tablaCarro.innerHTML = ""
    let tablaHeader = document.createElement("tr")
    let headerCant = document.createElement("th")
    headerCant.innerText = "Cantidad"
    let headerDestino = document.createElement("th")
    headerDestino.innerText = "Destino"
    let headerPrecio = document.createElement("th")
    headerPrecio.innerText = "Precio"
    let headerBorrar = document.createElement("th")
    headerBorrar.innerText = "Eliminar"
    tablaHeader.append(headerCant)
    tablaHeader.append(headerDestino)
    tablaHeader.append(headerPrecio)
    tablaHeader.append(headerBorrar)
    tablaCarro.append(tablaHeader)

    let subtotal = document.getElementById("subtotal")
    if (subtotal != undefined){
        subtotal.remove()
    }
    precioFinal = 0

    carrito = []
    itemIdUnico = 1
    sessionStorage.clear()
}

const textBanner = document.getElementById('text-banner');
textBanner.innerHTML = textBanner.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

anime.timeline({loop: true})
  .add({
    targets: '#text-banner .letter',
    opacity: [0,1],
    easing: "easeInOutQuad",
    duration: 2250,
    delay: (el, i) => 30 * (i+1)
  }).add({
    targets: '#text-banner',
    opacity: 0,
    duration: 1000,
    easing: "easeOutExpo",
    delay: 500
  });

const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl)
        });