
// Array de productos disponibles (se cargará desde JSON)
let productos = [];

// Array del carrito de compras
let carrito = [];

// Referencias a elementos del DOM
const productosContainer = document.getElementById('products-container');
const cartSection = document.getElementById('cart-section');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartContainer = document.getElementById('cart-container');
const emptyCart = document.getElementById('empty-cart');
const totalAmount = document.getElementById('total-amount');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.getElementById('clear-cart');
const loginBtn = document.querySelector('.login-btn');

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async function () {
    await cargarProductos();
    mostrarProductos();
    actualizarCarrito();

    // Event listeners
    checkoutBtn.addEventListener('click', procederPago);
    clearCartBtn.addEventListener('click', mostrarModalVaciarCarrito);
    loginBtn.addEventListener('click', mostrarModalLogin);
});

// Función para cargar productos desde JSON
async function cargarProductos() {
    try {
        const response = await fetch('./productos.json');
        productos = await response.json();
    } catch (error) {
        console.error('Error cargando productos:', error);
        // Productos de respaldo
        productos = [
            {
                id: 1,
                nombre: "Producto de ejemplo",
                precio: 99.99,
                descripcion: "Error cargando productos desde JSON",
                imagen: "📦"
            }
        ];
    }
}

// Mostrar productos en la página
function mostrarProductos() {
    productosContainer.innerHTML = '';

    productos.forEach(producto => {
        const productoCard = document.createElement('div');
        productoCard.className = 'product-card';

        productoCard.innerHTML = `
            <div class="product-image">${crearImagenProducto(producto)}</div>
            <div class="product-info">
                <h3 class="product-name">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion}</p>
                <div class="product-price">$${producto.precio.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="agregarAlCarrito(${producto.id})">
                    Agregar al Carrito
                </button>
            </div>
        `;
        productosContainer.appendChild(productoCard);
    });
}

// Agregar producto al carrito
function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    const item = carrito.find(i => i.id === productoId);

    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    mostrarMensaje(`${producto.nombre} agregado al carrito`);
    actualizarCarrito();
}

// Actualizar visualización del carrito
function actualizarCarrito() {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    cartCount.textContent = totalItems;

    actualizarTotal();
    cartItems.innerHTML = '';

    if (carrito.length === 0) {
        cartContainer.style.display = 'none';
        emptyCart.style.display = 'block';
        return;
    }

    cartContainer.style.display = 'block';
    emptyCart.style.display = 'none';

    carrito.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        cartItem.innerHTML = `
            <div class="cart-item-header">
                <div class="cart-item-image">${crearImagenCarrito(item)}</div>
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <div class="cart-item-price">$${item.precio.toFixed(2)}</div>
                </div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                <input type="number" class="quantity-input" value="${item.cantidad}" 
                       onchange="actualizarCantidad(${item.id}, this.value)" min="1">
                <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
            </div>
            <div class="item-total">
                Total: $${(item.precio * item.cantidad).toFixed(2)}
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
}

// Cambiar cantidad con botones +/-
function cambiarCantidad(productoId, cambio) {
    const item = carrito.find(n => n.id === productoId);
    if (item) {
        item.cantidad += cambio;
        if (item.cantidad <= 0) {
            eliminarDelCarrito(item.id);
        } else {
            actualizarCarrito();
        }
    }
}

// Actualizar cantidad desde input
function actualizarCantidad(productoId, nuevaCantidad) {
    const cantidad = parseInt(nuevaCantidad);
    const item = carrito.find(n => n.id === productoId);

    if (item) {
        if (isNaN(cantidad) || cantidad <= 0) {
            eliminarDelCarrito(item.id);
        } else {
            item.cantidad = cantidad;
            actualizarCarrito();
        }
    }
}

// Eliminar producto del carrito
function eliminarDelCarrito(productoId) {
    carrito = carrito.filter(c => c.id !== productoId);
    actualizarCarrito();
}

// Calcular total del carrito
function actualizarTotal() {
    const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    totalAmount.textContent = total.toFixed(2);
}

// Proceder al pago
function procederPago() {
    if (carrito.length === 0) {
        mostrarMensaje("El carrito está vacío. Agrega productos antes de pagar.");
        return;
    }

    mostrarModal({
        icono: '💳',
        titulo: 'Confirmar compra',
        mensaje: `Total a pagar: $${totalAmount.textContent}\n\n¿Deseas confirmar la compra?`,
        textoConfirmar: 'Confirmar',
        textoCancel: 'Cancelar',
        onConfirmar: () => {
            vaciarCarrito();
            mostrarMensaje("✅ ¡Compra realizada con éxito!");
        }
    });
}

// Vaciar carrito
function vaciarCarrito() {
    carrito = [];
    actualizarCarrito();
}
