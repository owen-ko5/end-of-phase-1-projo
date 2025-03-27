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
    console.log("Cart Updated:", cart);
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
        .then(localProducts => {
            fetch(`https://api.fda.gov/drug/label.json?search=active_ingredient:${searchQuery}+OR+generic_name:${searchQuery}&limit=5`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("No results found from OpenFDA.");
                    }
                    return response.json();
                })
                .then(apiData => {
                    if (!apiData.results || apiData.results.length === 0) {
                        throw new Error("No medicine found.");
                    }

                    let externalProducts = apiData.results.map(item => ({
                        id: item.id || Math.random(),
                        name: item.openfda.brand_name ? item.openfda.brand_name[0] : "Unknown Medicine",
                        description: item.purpose ? item.purpose[0] : "No description available",
                        price: (Math.random() * 50).toFixed(2),
                        stock: Math.floor(Math.random() * 100),
                        image: "https://via.placeholder.com/100"
                    }));
                    let allProducts = [...localProducts, ...externalProducts];
                    let filteredProducts = allProducts.filter(product =>
                        product.name.toLowerCase().includes(searchQuery) ||
                        product.description.toLowerCase().includes(searchQuery)
                    );

                    if (filteredProducts.length === 0) {
                        document.getElementById("product-list").innerHTML = "<p>No products found.</p>";
                    } else {
                        displayProducts(filteredProducts);
                    }
                })
                .catch(error => {
                    console.error("Error fetching external data:", error);
                    document.getElementById("product-list").innerHTML = "<p>No products found.</p>";
                });
        })
        .catch(error => console.error("Error fetching local products:", error));
}
document.getElementById("add-product-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const newProduct = {
        name: document.getElementById("product-name").value,
        image: document.getElementById("product-image").value,
        description: document.getElementById("product-description").value,
        price: parseFloat(document.getElementById("product-price").value),
        stock: parseInt(document.getElementById("product-stock").value),
        category: document.getElementById("product-category").value
    };
    fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newProduct)
    })
    .then(response => response.json())
    .then(addedProduct => {
        console.log("Product added:", addedProduct);
        alert("Product successfully added!");
        fetchProducts();
        document.getElementById("add-product-form").reset();
    })
    .catch(error => console.error("Error adding product:", error));
});

