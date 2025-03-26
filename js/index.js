document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

let cart = [];

function fetchProducts() {
    fetch("http://localhost:3000/products") 
        .then(response => response.json())
        .then(products => {
            displayProducts(products);
        })
        .catch(error => console.error("Error fetching products:", error));
}

function displayProducts(products) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = ""; 

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
            <p><strong>Stock:</strong> ${product.stock} available</p>
            <button onclick="addToCart(${product.id})">🛒 Add to Cart</button>
        `;

        productList.appendChild(productCard);
    });
}

function addToCart(productId) {
    fetch(`http://localhost:3000/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            updateCart();
        })
        .catch(error => console.error("Error adding to cart:", error));
}

function updateCart() {
    const cartList = document.getElementById("cart");
    cartList.innerHTML = "";

    cart.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${item.name} - $${item.price.toFixed(2)} x ${item.quantity}
            <button onclick="removeFromCart(${item.id})">❌</button>
        `;
        cartList.appendChild(li);
    });
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Total amount: $${total.toFixed(2)}. Your order is placed! 🚚`);

    cart = [];
    updateCart();
}

function filterProducts() {
    const searchQuery = document.getElementById("search").value.toLowerCase();

    fetch("http://localhost:3000/products")
        .then(response => response.json())
        .then(products => {
            const filteredProducts = products.filter(product =>
                product.name.toLowerCase().includes(searchQuery) ||
                product.description.toLowerCase().includes(searchQuery)
            );
            displayProducts(filteredProducts);
        })
        .catch(error => console.error("Error searching products:", error));
}
document.getElementById("contact-form").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;
    
    alert(`Thank you, ${name}! Your message has been received. We will get back to you via ${email}.`);
    
    this.reset(); // Clear the form after submission
});

