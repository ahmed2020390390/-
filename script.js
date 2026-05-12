// بيانات المنتجات
const products = [
    { id: 1, name: 'السمسم', category: 'seeds', price: 100, emoji: '🌾' },
    { id: 2, name: 'حبة البركة', category: 'seeds', price: 150, emoji: '⚫' },
    { id: 3, name: 'عين الجمل', category: 'nuts', price: 500, emoji: '🥜' },
    { id: 4, name: 'الفستق', category: 'nuts', price: 750, emoji: '🥒' },
    { id: 5, name: 'البندق', category: 'nuts', price: 900, emoji: '🌰' },
    { id: 6, name: 'الكاجو', category: 'nuts', price: 790, emoji: '💛' },
    { id: 7, name: 'اللوز', category: 'nuts', price: 600, emoji: '🤎' },
    { id: 8, name: 'عسل النحل', category: 'seeds', price: 179, emoji: '🍯' },
    { id: 9, name: 'حبوب اللقاح', category: 'seeds', price: 690, emoji: '💛' },
    { id: 10, name: 'العكبر', category: 'seeds', price: 3000, emoji: '✨' },
    { id: 11, name: 'بهار لحمة', category: 'spices', price: 280, emoji: '🟤' },
    { id: 12, name: 'بهار فراخ', category: 'spices', price: 270, emoji: '🌶️' },
    { id: 13, name: 'الفلفل', category: 'spices', price: 290, emoji: '🌶️' },
    { id: 14, name: 'الكمون', category: 'spices', price: 300, emoji: '🟫' },
    { id: 15, name: 'الكزبرة', category: 'spices', price: 125, emoji: '🍃' },
    { id: 16, name: 'بهار سمك', category: 'spices', price: 200, emoji: '🐟' },
    { id: 17, name: 'الحلبة', category: 'spices', price: 100, emoji: '🟤' },
    { id: 18, name: 'الينسون', category: 'spices', price: 100, emoji: '⭐' },
    { id: 19, name: 'الكراوية', category: 'spices', price: 110, emoji: '🟤' },
    { id: 20, name: 'الزعفران', category: 'spices', price: 450, emoji: '🟡' }
];

// متغيرات عامة
let cart = [];
let currentFilter = 'all';

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    setupEventListeners();
    createGemEffect();
});

// عرض المنتجات
function renderProducts(productsToShow) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    productsToShow.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price} جنيه</div>
                <div class="product-controls">
                    <input type="number" class="quantity-input" value="1" min="1" max="100">
                    <button class="add-btn" onclick="addToCart(${product.id})">أضف للسلة</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// الحصول على اسم الفئة
function getCategoryName(category) {
    const categories = {
        'nuts': 'مكسرات',
        'seeds': 'بذور وعسل',
        'spices': 'بهارات'
    };
    return categories[category] || 'جميع المنتجات';
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // أزرار التصفية
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.category;
            filterProducts();
        });
    });

    // فتح/إغلاق السلة
    document.getElementById('cart-btn').addEventListener('click', showCart);
    document.getElementById('close-cart').addEventListener('click', closeCart);

    // فتح/إغلاق نموذج الدفع
    document.getElementById('checkout-btn').addEventListener('click', showCheckout);
    document.getElementById('close-checkout').addEventListener('click', closeCheckout);

    // نموذج الدفع
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);

    // إغلاق الـ modals عند الضغط خارجهم
    window.addEventListener('click', (e) => {
        const cartModal = document.getElementById('cart-modal');
        const checkoutModal = document.getElementById('checkout-modal');
        
        if (e.target === cartModal) closeCart();
        if (e.target === checkoutModal) closeCheckout();
    });
}

// تصفية المنتجات
function filterProducts() {
    let filtered = products;
    if (currentFilter !== 'all') {
        filtered = products.filter(p => p.category === currentFilter);
    }
    renderProducts(filtered);
}

// إضافة للسلة
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const quantityInput = event.target.parentElement.querySelector('.quantity-input');
    const quantity = parseInt(quantityInput.value);

    if (quantity > 0) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                ...product,
                quantity: quantity
            });
        }

        // تحديث الـ UI
        updateCartCount();
        showSuccessMessage(`تمت إضافة ${product.name} إلى السلة`);
        quantityInput.value = '1';
    }
}

// تحديث عدد العناصر في السلة
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// عرض السلة
function showCart() {
    const modal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">السلة فارغة</div>';
        totalPrice.textContent = '0 جنيه';
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-quantity">الكمية: ${item.quantity}</div>
                </div>
                <div class="cart-item-price">${item.price * item.quantity} جنيه</div>
                <button class="remove-btn" onclick="removeFromCart(${index})">حذف</button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalPrice.textContent = `${total} جنيه`;
    }

    modal.classList.add('show');
}

// إغلاق السلة
function closeCart() {
    document.getElementById('cart-modal').classList.remove('show');
}

// حذف من السلة
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    showCart();
}

// عرض نموذج الدفع
function showCheckout() {
    if (cart.length === 0) {
        showSuccessMessage('السلة فارغة!', false);
        return;
    }

    const modal = document.getElementById('checkout-modal');
    const orderItemsSummary = document.getElementById('order-items-summary');
    const orderTotal = document.getElementById('order-total');

    // عرض ملخص الطلب
    orderItemsSummary.innerHTML = cart.map(item => `
        <div class="order-summary-item">
            <span>${item.name} x${item.quantity}</span>
            <span>${item.price * item.quantity} جنيه</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderTotal.textContent = total;

    closeCart();
    modal.classList.add('show');
}

// إغلاق نموذج الدفع
function closeCheckout() {
    document.getElementById('checkout-modal').classList.remove('show');
}

// معالجة الدفع والتوجيه إلى واتساب
function handleCheckout(e) {
    e.preventDefault();

    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();

    // التحقق من البيانات
    if (!name || !phone || !address) {
        showSuccessMessage('يرجى ملء جميع الحقول', false);
        return;
    }

    // التحقق من صحة رقم الهاتف
    if (!/^01[0-9]{9}$/.test(phone)) {
        showSuccessMessage('يرجى إدخال رقم هاتف صحيح', false);
        return;
    }

    // إنشاء الرسالة للواتساب
    const orderItems = cart.map(item => 
        `• ${item.name} x${item.quantity} = ${item.price * item.quantity} جنيه`
    ).join('\n');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const message = `
مرحبا! لدي طلب جديد من متجر الجودة ✨

*بيانات العميل:*
الاسم: ${name}
الهاتف: ${phone}
العنوان: ${address}

*تفاصيل الطلب:*
${orderItems}

*الإجمالي: ${total} جنيه*

شكراً لك! 🙏
`;

    // إرسال إلى واتساب
    const whatsappNumber = '201033972717'; // رقم الواتساب: 01033972717
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // حفظ البيانات محليا (اختياري)
    saveOrder({ name, phone, address, items: cart, total, date: new Date().toLocaleString() });

    // فتح واتساب
    window.open(whatsappUrl, '_blank');

    // إعادة تعيين
    setTimeout(() => {
        cart = [];
        updateCartCount();
        closeCheckout();
        document.getElementById('checkout-form').reset();
        showSuccessMessage('تم إرسال طلبك بنجاح! شكراً لتسوقك معنا 🎉');
    }, 500);
}

// حفظ الطلب محليا
function saveOrder(order) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
}

// عرض رسالة النجاح/الخطأ
function showSuccessMessage(message, isSuccess = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.style.backgroundColor = isSuccess ? '#00cc88' : '#ff6b6b';
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideDown 0.3s ease reverse';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// تأثير توقع الأحجار الكريمة
class GemParticle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.size = Math.random() * 15 + 5;
        this.speedY = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.opacity = Math.random() * 0.5 + 0.5;
        
        // ألوان الأحجار الكريمة
        const colors = ['#00ccff', '#0099ff', '#00ffff', '#66ffff', '#00ff99', '#ff00ff', '#ff0099'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        this.opacity -= 0.003;

        // إعادة تعيين عندما يتجاوز الحافة
        if (this.y > this.canvas.height || this.opacity <= 0) {
            this.y = -this.size;
            this.x = Math.random() * this.canvas.width;
            this.speedY = Math.random() * 3 + 2;
            this.speedX = (Math.random() - 0.5) * 2;
            this.opacity = Math.random() * 0.5 + 0.5;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // رسم الحجر الكريم
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size * 0.7, -this.size * 0.3);
        ctx.lineTo(this.size, 0);
        ctx.lineTo(this.size * 0.7, this.size * 0.7);
        ctx.lineTo(0, this.size);
        ctx.lineTo(-this.size * 0.7, this.size * 0.7);
        ctx.lineTo(-this.size, 0);
        ctx.lineTo(-this.size * 0.7, -this.size * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // إضاءة الحجر
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }
}

let gems = [];

function createGemEffect() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // ضبط حجم الـ canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // إنشاء جزيئات البداية
    for (let i = 0; i < 20; i++) {
        gems.push(new GemParticle(canvas));
    }

    function animate() {
        // مسح الـ canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // تحديث ورسم الجزيئات
        gems.forEach(gem => {
            gem.update();
            gem.draw(ctx);
        });

        // إضافة جزيئات جديدة عشوائيا
        if (Math.random() < 0.3) {
            gems.push(new GemParticle(canvas));
        }

        // الحفاظ على عدد معقول من الجزيئات
        if (gems.length > 100) {
            gems = gems.slice(-80);
        }

        requestAnimationFrame(animate);
    }

    animate();

    // إعادة ضبط حجم الـ canvas عند تغيير حجم النافذة
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
