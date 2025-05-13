document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('cartToggle');
    const menu = document.getElementById('cartMenu');
  
    if (toggle) {
      toggle.addEventListener('click', async (e) => {
        e.preventDefault();
        menu.classList.toggle('hidden');
        await loadCart(); // Load every time it opens
      });
    }
  
    async function loadCart() {
      try {
        const res = await fetch('/cart-json');
        const data = await res.json();
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
  
        cartItems.innerHTML = '';
        let total = 0;
  
        if (data.cart.length === 0) {
          cartItems.innerHTML = '<li>No items in cart</li>';
        } else {
          data.cart.forEach(item => {
            total += item.price * item.quantity;
            const li = document.createElement('li');
            li.textContent = `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
            cartItems.appendChild(li);
          });
        }
  
        cartTotal.textContent = total.toFixed(2);
      } catch (err) {
        console.error('Error loading cart:', err);
      }
    }
  });
  