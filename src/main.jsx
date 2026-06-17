import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeSeedData } from './data/seed';
import './style.css';

import {
  FaHome,
  FaInfoCircle,
  FaPhoneAlt,
  FaShoppingCart,
  FaHeart,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaBoxOpen,
  FaPlusCircle,
  FaUsers,
  FaClipboardList,
  FaTachometerAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaClock,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaGlobe,
  FaEdit,
  FaCamera,
  FaSave,
  FaShieldAlt,
  FaDumbbell,
  FaVolleyballBall,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaTrash,
  FaEye,
  FaStore,
  FaLock,
  FaStar,
} from 'react-icons/fa';

import { GiCricketBat, GiShuttlecock, GiSoccerBall } from 'react-icons/gi';

initializeSeedData();

const KEYS = {
  products: 'sportzone_products',
  users: 'sportzone_users',
  requests: 'sportzone_requests',
  cart: 'sportzone_cart',
  wishlist: 'sportzone_wishlist',
  auth: 'sportzone_auth_user',
};

const getData = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setData = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const currency = (value) => `LKR ${Number(value).toLocaleString()}`;
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^0[0-9]{9}$/.test(phone);
const isStrongPassword = (password) => password.length >= 6;
const isValidImageUrl = (url) =>
  url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image');

function App() {
  const [page, setPage] = useState('home');
  const [authUser, setAuthUser] = useState(() =>
    JSON.parse(localStorage.getItem(KEYS.auth) || 'null')
  );
  const [products, setProducts] = useState(() => getData(KEYS.products));
  const [users, setUsers] = useState(() => getData(KEYS.users));
  const [cart, setCart] = useState(() => getData(KEYS.cart));
  const [wishlist, setWishlist] = useState(() => getData(KEYS.wishlist));
  const [requests, setRequests] = useState(() => getData(KEYS.requests));
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notice, setNotice] = useState('');

  const isAdmin = authUser?.role === 'admin';
  const isUser = authUser?.role === 'user';

  useEffect(() => setData(KEYS.products, products), [products]);
  useEffect(() => setData(KEYS.users, users), [users]);
  useEffect(() => setData(KEYS.cart, cart), [cart]);
  useEffect(() => setData(KEYS.wishlist, wishlist), [wishlist]);
  useEffect(() => setData(KEYS.requests, requests), [requests]);

  function showNotice(message) {
    setNotice(message);
    setTimeout(() => setNotice(''), 2500);
  }

  function login(email, password) {
    if (!email || !password) return showNotice('Email and password are required.');
    if (!isValidEmail(email)) return showNotice('Please enter a valid email address.');

    const foundUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (!foundUser) return showNotice('Invalid email or password.');

    if (foundUser.status === 'Banned') {
      return showNotice('Your account is banned. Please contact admin.');
    }

    localStorage.setItem(KEYS.auth, JSON.stringify(foundUser));
    setAuthUser(foundUser);
    setPage(foundUser.role === 'admin' ? 'admin' : 'products');
    showNotice(`Welcome back, ${foundUser.name}`);
  }

  function register(form) {
    if (!form.name || !form.email || !form.phone || !form.address || !form.password) {
      return showNotice('All fields are required.');
    }

    if (form.name.length < 3) return showNotice('Name must have at least 3 characters.');
    if (!isValidEmail(form.email)) return showNotice('Please enter a valid email address.');
    if (!isValidPhone(form.phone)) return showNotice('Phone number must be 10 digits and start with 0.');
    if (!isStrongPassword(form.password)) return showNotice('Password must have at least 6 characters.');
    if (users.some((user) => user.email === form.email)) return showNotice('Email already exists.');

    const newUser = {
      id: `U${Date.now()}`,
      role: 'user',
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      address: form.address,
      status: 'Active',
      profileImage: 'https://source.unsplash.com/400x400/?customer,portrait',
    };

    setUsers([newUser, ...users]);
    showNotice('Registration successful. Please login.');
    setPage('login');
  }

  function logout() {
    localStorage.removeItem(KEYS.auth);
    setAuthUser(null);
    setPage('home');
    showNotice('Logged out successfully.');
  }

  function updateProfile(form) {
    if (!form.name || !form.phone || !form.address) {
      return showNotice('Name, phone, and address are required.');
    }

    if (form.name.length < 3) return showNotice('Name must have at least 3 characters.');
    if (!isValidPhone(form.phone)) return showNotice('Phone number must be 10 digits and start with 0.');

    const updatedUsers = users.map((user) =>
      user.id === authUser.id ? { ...user, ...form } : user
    );

    const updatedAuth = { ...authUser, ...form };

    setUsers(updatedUsers);
    setAuthUser(updatedAuth);
    localStorage.setItem(KEYS.auth, JSON.stringify(updatedAuth));
    showNotice('Profile updated successfully.');
  }

  function addToCart(product) {
    if (!authUser) {
      showNotice('Please login before adding products to cart.');
      return setPage('login');
    }

    if (authUser.role === 'admin') return showNotice('Admin cannot add products to cart.');
    if (authUser.status === 'Banned') return showNotice('Banned users cannot use cart.');
    if (product.stock <= 0) return showNotice('This product is out of stock.');

    const alreadyExists = cart.some(
      (item) => item.userId === authUser.id && item.productId === product.id
    );

    if (alreadyExists) return showNotice('Product already exists in cart.');

    const newCartItem = {
      id: `C${Date.now()}`,
      userId: authUser.id,
      productId: product.id,
      quantity: 1,
    };

    setCart([newCartItem, ...cart]);
    showNotice('Product added to cart.');
  }

  function updateCartQuantity(cartItemId, quantity) {
    if (Number(quantity) < 1) return showNotice('Quantity must be at least 1.');

    setCart(
      cart.map((item) =>
        item.id === cartItemId ? { ...item, quantity: Number(quantity) } : item
      )
    );
  }

  function addToWishlist(product) {
    if (!authUser) {
      showNotice('Please login before adding products to wishlist.');
      return setPage('login');
    }

    if (authUser.role === 'admin') return showNotice('Admin cannot add products to wishlist.');

    const alreadyExists = wishlist.some(
      (item) => item.userId === authUser.id && item.productId === product.id
    );

    if (alreadyExists) return showNotice('Product already exists in wishlist.');

    const newWishlistItem = {
      id: `W${Date.now()}`,
      userId: authUser.id,
      productId: product.id,
    };

    setWishlist([newWishlistItem, ...wishlist]);
    showNotice('Product saved to wishlist.');
  }

  function requestProduct(cartItem) {
    if (authUser.status === 'Banned') return showNotice('Banned users cannot request products.');

    const product = products.find((item) => item.id === cartItem.productId);

    if (!product) return showNotice('Product not found.');
    if (cartItem.quantity > product.stock) return showNotice('Requested quantity is higher than available stock.');

    const alreadyPending = requests.some(
      (request) =>
        request.userId === authUser.id &&
        request.productId === cartItem.productId &&
        request.status === 'Pending'
    );

    if (alreadyPending) return showNotice('You already have a pending request for this product.');

    const newRequest = {
      id: `R${Date.now()}`,
      userId: authUser.id,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      status: 'Pending',
      message: `I would like to request ${cartItem.quantity} item(s) of ${product.name}.`,
      adminResponse: '',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setRequests([newRequest, ...requests]);
    setCart(cart.filter((item) => item.id !== cartItem.id));
    showNotice('Product request sent to admin.');
    setPage('requests');
  }

  function createProduct(form) {
    if (!form.name || !form.category || !form.price || !form.stock || !form.status || !form.image || !form.description) {
      return showNotice('All product fields are required.');
    }

    if (form.name.length < 3) return showNotice('Product name must have at least 3 characters.');
    if (Number(form.price) <= 0) return showNotice('Product price must be greater than 0.');
    if (Number(form.stock) < 0) return showNotice('Stock cannot be negative.');
    if (!isValidImageUrl(form.image)) return showNotice('Please enter a valid image URL.');

    const newProduct = {
      id: `P${Date.now()}`,
      name: form.name,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      status: form.status,
      image: form.image,
      description: form.description,
      highlights: ['Premium quality', 'Best for training', 'Store pickup available'],
    };

    setProducts([newProduct, ...products]);
    showNotice('Product created successfully.');
    setPage('manage-products');
  }

  function deleteProduct(id) {
    setProducts(products.filter((product) => product.id !== id));
    showNotice('Product deleted.');
  }

  function updateProductStatus(id, status) {
    setProducts(products.map((product) => (product.id === id ? { ...product, status } : product)));
    showNotice('Product status updated.');
  }

  function updateRequestStatus(id, status) {
    setRequests(
      requests.map((request) =>
        request.id === id
          ? {
              ...request,
              status,
              adminResponse:
                status === 'Accepted'
                  ? 'Your product is available. You can visit our store.'
                  : 'Sorry, your product request is currently not available.',
            }
          : request
      )
    );

    showNotice(`Request ${status.toLowerCase()}.`);
  }

  function toggleBanUser(id) {
    setUsers(
      users.map((user) =>
        user.id === id
          ? { ...user, status: user.status === 'Banned' ? 'Active' : 'Banned' }
          : user
      )
    );

    showNotice('User status updated.');
  }

  const visibleProducts = products.filter((product) => product.status === 'Available');
  const myCart = cart.filter((item) => item.userId === authUser?.id);
  const myWishlist = wishlist.filter((item) => item.userId === authUser?.id);
  const myRequests = requests.filter((item) => item.userId === authUser?.id);

  return (
    <div>
      <Navbar authUser={authUser} isAdmin={isAdmin} setPage={setPage} logout={logout} />

      {notice && <div className="toast">{notice}</div>}

      {page === 'home' && (
        <Home products={visibleProducts} setPage={setPage} setSelectedProduct={setSelectedProduct} />
      )}

      {page === 'about' && <About />}
      {page === 'contact' && <Contact />}
      {page === 'login' && <Login login={login} setPage={setPage} />}
      {page === 'register' && <Register register={register} setPage={setPage} />}

      {page === 'products' && (
        <Products
          products={visibleProducts}
          setSelectedProduct={setSelectedProduct}
          setPage={setPage}
          addToCart={addToCart}
          addToWishlist={addToWishlist}
        />
      )}

      {page === 'details' && selectedProduct && (
        <ProductDetails product={selectedProduct} addToCart={addToCart} addToWishlist={addToWishlist} />
      )}

      {page === 'profile' && isUser && <Profile authUser={authUser} updateProfile={updateProfile} />}

      {page === 'cart' && isUser && (
        <Cart
          items={myCart}
          products={products}
          requestProduct={requestProduct}
          updateCartQuantity={updateCartQuantity}
          remove={(id) => setCart(cart.filter((item) => item.id !== id))}
        />
      )}

      {page === 'wishlist' && isUser && (
        <Wishlist
          items={myWishlist}
          products={products}
          addToCart={addToCart}
          remove={(id) => setWishlist(wishlist.filter((item) => item.id !== id))}
        />
      )}

      {page === 'requests' && isUser && <UserRequests requests={myRequests} products={products} />}

      {page === 'admin' && isAdmin && (
        <AdminDashboard users={users} products={products} requests={requests} setPage={setPage} />
      )}

      {page === 'create-product' && isAdmin && <CreateProduct createProduct={createProduct} />}

      {page === 'manage-products' && isAdmin && (
        <ManageProducts products={products} deleteProduct={deleteProduct} updateProductStatus={updateProductStatus} />
      )}

      {page === 'manage-requests' && isAdmin && (
        <ManageRequests requests={requests} users={users} products={products} updateRequestStatus={updateRequestStatus} />
      )}

      {page === 'manage-users' && isAdmin && <ManageUsers users={users} toggleBanUser={toggleBanUser} />}

      <Footer setPage={setPage} />
    </div>
  );
}

function Navbar({ authUser, isAdmin, setPage, logout }) {
  return (
    <nav className="navbar">
      <button className="brand" onClick={() => setPage('home')}>
        <GiSoccerBall /> SportZone
      </button>

      <div className="navlinks">
        {!authUser && (
          <>
            <button onClick={() => setPage('home')}><FaHome /> Home</button>
            <button onClick={() => setPage('about')}><FaInfoCircle /> About</button>
            <button onClick={() => setPage('products')}><FaBoxOpen /> Products</button>
            <button onClick={() => setPage('contact')}><FaPhoneAlt /> Contact</button>
            <button onClick={() => setPage('login')}><FaSignInAlt /> Login</button>
            <button className="primary" onClick={() => setPage('register')}><FaUserPlus /> Register</button>
          </>
        )}

        {authUser?.role === 'user' && (
          <>
            <button onClick={() => setPage('home')}><FaHome /> Home</button>
            <button onClick={() => setPage('products')}><FaBoxOpen /> Products</button>
            <button onClick={() => setPage('cart')}><FaShoppingCart /> Cart</button>
            <button onClick={() => setPage('wishlist')}><FaHeart /> Wishlist</button>
            <button onClick={() => setPage('requests')}><FaClipboardList /> Requests</button>
            <button onClick={() => setPage('profile')}><FaUser /> Profile</button>
            <button onClick={logout}><FaSignOutAlt /> Logout</button>
          </>
        )}

        {isAdmin && (
          <>
            <button onClick={() => setPage('admin')}><FaTachometerAlt /> Dashboard</button>
            <button onClick={() => setPage('create-product')}><FaPlusCircle /> Create Product</button>
            <button onClick={() => setPage('manage-products')}><FaBoxOpen /> Products</button>
            <button onClick={() => setPage('manage-requests')}><FaClipboardList /> Requests</button>
            <button onClick={() => setPage('manage-users')}><FaUsers /> Users</button>
            <button onClick={logout}><FaSignOutAlt /> Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

function Home({ products, setPage, setSelectedProduct }) {
  const workflow = [
    [<FaUser />, 'Register/Login', 'Create account and access the product system.'],
    [<FaSearch />, 'Browse Products', 'Search cricket, volleyball, badminton, football, and gym products.'],
    [<FaShoppingCart />, 'Add to Cart', 'Save required products before sending a request.'],
    [<FaClipboardList />, 'Request Admin', 'Send product availability request to admin.'],
    [<FaStore />, 'Visit Store', 'After approval, visit the shop and collect items.'],
  ];

  return (
    <main>
      <section className="hero hero-pro">
        <div className="hero-left">
          <p className="eyebrow">SportZone Product Request Platform</p>
          <h1>Request sports products online before visiting the store.</h1>
          <p>
            A professional sports store system where customers browse products,
            add items to cart or wishlist, request availability, and receive
            confirmation from the admin.
          </p>

          <div className="actions">
            <button className="primary large" onClick={() => setPage('products')}><FaBoxOpen /> Browse Products</button>
            <button className="ghost large" onClick={() => setPage('about')}><FaInfoCircle /> View Workflow</button>
          </div>
        </div>

        <div className="hero-workflow">
          <h3>How the System Works</h3>

          {workflow.map(([icon, title, text]) => (
            <div className="workflow-item" key={title}>
              <div className="workflow-icon">{icon}</div>
              <div>
                <h4>{title}</h4>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow-dark">Featured Products</p>
            <h2>Close-up sports products for real store experience</h2>
            <p>These products are prepared for screenshots and student assignment reference.</p>
          </div>
        </div>

        <div className="grid">
          {products.slice(0, 6).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={() => {
                setSelectedProduct(product);
                setPage('details');
              }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function About() {
  const slides = [
  {
    image:
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1400&q=90',
    title: 'Sports Products in One Platform',
    text: 'Customers can browse cricket, volleyball, badminton, football, and gym products from one place.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1400&q=90',
    title: 'Request Before Visiting',
    text: 'Users can request product availability and wait for admin confirmation before visiting the store.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=90',
    title: 'Admin Controlled Store Flow',
    text: 'Admin can manage products, approve requests, reject requests, and control user access.',
  },
];

  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="about-modern">
      <div className="about-hero">
        <div>
          <p className="eyebrow-dark">About SportZone</p>
          <h1>A real-world sports product request system</h1>
          <p>
            SportZone is designed for sports shops, schools, clubs, coaches,
            players, and gym users who want to check product availability before
            visiting the physical store.
          </p>

          <div className="about-actions">
            <button className="primary"><FaUser /> Customer Friendly</button>
            <button><FaShieldAlt /> Admin Managed</button>
            <button><FaStore /> Store Pickup Flow</button>
          </div>
        </div>

        <div className="carousel">
          <img src={slides[active].image} alt={slides[active].title} />

          <div className="carousel-content">
            <h3>{slides[active].title}</h3>
            <p>{slides[active].text}</p>

            <div className="carousel-dots">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  className={active === index ? 'dot active-dot' : 'dot'}
                  onClick={() => setActive(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="info-grid about-info">
        <div className="info-card icon-card">
          <div className="big-icon"><FaBoxOpen /></div>
          <h3>Product Browsing</h3>
          <p>Users can explore sports products with images, categories, price, stock details, and descriptions.</p>
        </div>

        <div className="info-card icon-card">
          <div className="big-icon"><FaShoppingCart /></div>
          <h3>Cart and Wishlist</h3>
          <p>Customers can save favourite products and request items from the cart when they are ready.</p>
        </div>

        <div className="info-card icon-card">
          <div className="big-icon"><FaTachometerAlt /></div>
          <h3>Admin Dashboard</h3>
          <p>Admin can monitor users, products, requests, accepted requests, rejected requests, and banned users.</p>
        </div>
      </div>

      <div className="workflow-box light-workflow">
        <h2>Complete User Journey</h2>

        <div className="workflow">
          <span><FaUser /> Register</span>
          <span><FaLock /> Login</span>
          <span><FaSearch /> Search Products</span>
          <span><FaHeart /> Wishlist</span>
          <span><FaShoppingCart /> Cart</span>
          <span><FaClipboardList /> Request</span>
          <span><FaCheckCircle /> Admin Approval</span>
          <span><FaStore /> Store Visit</span>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact-modern">
      <div className="contact-hero">
        <p className="eyebrow-dark">Contact SportZone</p>
        <h1>Need products for your team, school, club, or gym?</h1>
        <p>Send us your inquiry or visit our store after your product request is accepted by the admin.</p>
      </div>

      <div className="contact-layout">
        <div className="contact-details">
          <div className="info-card contact-icon-card">
            <div className="big-icon"><FaMapMarkerAlt /></div>
            <h3>Store Location</h3>
            <p>SportZone Sports Store, Hospital Road, Jaffna, Sri Lanka</p>
          </div>

          <div className="info-card contact-icon-card">
            <div className="big-icon"><FaPhoneAlt /></div>
            <h3>Phone Numbers</h3>
            <p>077 123 4567</p>
            <p>075 987 6543</p>
          </div>

          <div className="info-card contact-icon-card">
            <div className="big-icon"><FaEnvelope /></div>
            <h3>Email Support</h3>
            <p>support@sportzone.lk</p>
            <p>orders@sportzone.lk</p>
          </div>

          <div className="info-card contact-icon-card">
            <div className="big-icon"><FaClock /></div>
            <h3>Opening Hours</h3>
            <p>Monday to Saturday</p>
            <p>9.00 AM - 6.00 PM</p>
          </div>
        </div>

        <div className="map-card">
          <iframe
            title="SportZone Location"
            src="https://www.google.com/maps?q=Jaffna%20Sri%20Lanka&output=embed"
            loading="lazy"
          ></iframe>
        </div>
      </div>

      <div className="card contact-form modern-form">
        <h2><FaEnvelope /> Send Product Inquiry</h2>

        <div className="form-two">
          <input placeholder="Your Name" />
          <input placeholder="Email Address" />
        </div>

        <div className="form-two">
          <input placeholder="Phone Number" />
          <input placeholder="Product Category" />
        </div>

        <textarea placeholder="Tell us what product you are looking for..." />

        <button className="primary"><FaEnvelope /> Submit Inquiry</button>
      </div>
    </section>
  );
}

function Login({ login, setPage }) {
  const [form, setForm] = useState({
    email: 'user@sportzone.lk',
    password: 'user123',
  });

  return (
    <section className="auth">
      <div className="card form-card">
        <h1><FaSignInAlt /> Login</h1>
        <p className="form-subtitle">Login as a customer or admin to continue.</p>

        <input
          placeholder="Email Address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="primary" onClick={() => login(form.email, form.password)}>
          <FaSignInAlt /> Login
        </button>

        <p>New user? <button onClick={() => setPage('register')}>Create account</button></p>

        <div className="demo-box">
          <b>Demo Accounts</b><br />
          User: user@sportzone.lk / user123<br />
          Admin: admin@sportzone.lk / admin123<br />
          Banned: dilshan@sportzone.lk / user123
        </div>
      </div>
    </section>
  );
}

function Register({ register, setPage }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });

  return (
    <section className="auth">
      <div className="card form-card">
        <h1><FaUserPlus /> Create Account</h1>
        <p className="form-subtitle">Register as a customer to request sports products.</p>

        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email Address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Phone Number Eg: 0771234567"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password - minimum 6 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="primary" onClick={() => register(form)}>
          <FaUserPlus /> Create Account
        </button>

        <p>Already registered? <button onClick={() => setPage('login')}>Login here</button></p>
      </div>
    </section>
  );
}

function Products({ products, setSelectedProduct, setPage, addToCart, addToWishlist }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [stockStatus, setStockStatus] = useState('All');

  const categories = ['All', ...new Set(products.map((p) => p.category))];

  const filtered = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase());

    const matchesCategory = category === 'All' || product.category === category;

    const matchesPrice =
      priceRange === 'All' ||
      (priceRange === 'Below 10000' && product.price < 10000) ||
      (priceRange === '10000 - 25000' && product.price >= 10000 && product.price <= 25000) ||
      (priceRange === 'Above 25000' && product.price > 25000);

    const matchesStock =
      stockStatus === 'All' ||
      (stockStatus === 'In Stock' && product.stock > 0) ||
      (stockStatus === 'Low Stock' && product.stock > 0 && product.stock <= 8);

    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  });

  return (
    <section className="section">
      <div className="products-header">
        <div>
          <p className="eyebrow-dark"><FaStore /> Sports Store</p>
          <h1>Explore Sports Products</h1>
          <p>Search and filter professional sports products before adding them to cart or wishlist.</p>
        </div>
      </div>

      <div className="filter-panel">
        <div>
          <label><FaSearch /> Search Products</label>
          <input
            placeholder="Search by name, category, or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div>
          <label><FaFilter /> Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        <div>
          <label>Price Range</label>
          <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
            <option>All</option>
            <option>Below 10000</option>
            <option>10000 - 25000</option>
            <option>Above 25000</option>
          </select>
        </div>

        <div>
          <label>Stock</label>
          <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)}>
            <option>All</option>
            <option>In Stock</option>
            <option>Low Stock</option>
          </select>
        </div>
      </div>

      <div className="result-bar">
        <p>Showing <b>{filtered.length}</b> product(s)</p>

        <button
          onClick={() => {
            setQuery('');
            setCategory('All');
            setPriceRange('All');
            setStockStatus('All');
          }}
        >
          Clear Filters
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h2>No products found</h2>
          <p>Try changing your search keyword or filter options.</p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={() => {
                setSelectedProduct(product);
                setPage('details');
              }}
              addToCart={() => addToCart(product)}
              addToWishlist={() => addToWishlist(product)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ProductCard({ product, onView, addToCart, addToWishlist }) {
  return (
    <div className="card product-card">
      <img src={product.image} alt={product.name} />

      <div className="product-body">
        <span className="badge">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>

        <div className="price-row">
          <b>{currency(product.price)}</b>
          <span>{product.stock} in stock</span>
        </div>

        <div className="actions">
          <button onClick={onView}><FaEye /> View</button>
          {addToCart && <button className="primary" onClick={addToCart}><FaShoppingCart /> Cart</button>}
          {addToWishlist && <button onClick={addToWishlist}><FaHeart /> Wishlist</button>}
        </div>
      </div>
    </div>
  );
}

function ProductDetails({ product, addToCart, addToWishlist }) {
  return (
    <section className="details">
      <img src={product.image} alt={product.name} />

      <div>
        <span className="badge">{product.category}</span>
        <h1>{product.name}</h1>
        <h2>{currency(product.price)}</h2>
        <p>{product.description}</p>

        <ul>
          {product.highlights?.map((item) => (
            <li key={item}><FaStar /> {item}</li>
          ))}
        </ul>

        <div className="actions">
          <button className="primary" onClick={() => addToCart(product)}><FaShoppingCart /> Add to Cart</button>
          <button onClick={() => addToWishlist(product)}><FaHeart /> Add to Wishlist</button>
        </div>
      </div>
    </section>
  );
}

function Profile({ authUser, updateProfile }) {
  const [form, setForm] = useState(authUser);

  function handleImage(e) {
    const file = e.target.files[0];

    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please select a valid image file.');

    const reader = new FileReader();

    reader.onload = () => setForm({ ...form, profileImage: reader.result });

    reader.readAsDataURL(file);
  }

  return (
    <section className="profile-page">
      <div className="profile-cover">
        <div>
          <p className="eyebrow">Customer Account</p>
          <h1>My Profile</h1>
          <p>Manage your personal details, contact information, and profile image before requesting products from SportZone.</p>
        </div>
      </div>

      <div className="profile-layout">
        <div className="profile-card-pro">
          <div className="profile-image-wrap">
            <img src={form.profileImage} alt={form.name} />

            <label className="profile-upload">
              <FaCamera />
              <input type="file" accept="image/*" onChange={handleImage} />
            </label>
          </div>

          <h2>{form.name}</h2>
          <p>{form.email}</p>

          <div className="profile-status">
            <FaShieldAlt />
            <span>{form.status}</span>
          </div>

          <div className="profile-mini-info">
            <div><FaUser /><span>{form.role}</span></div>
            <div><FaPhoneAlt /><span>{form.phone}</span></div>
            <div><FaMapMarkerAlt /><span>{form.address}</span></div>
          </div>
        </div>

        <div className="card profile-form-pro">
          <div className="profile-form-head">
            <div>
              <h2><FaEdit /> Edit Profile</h2>
              <p>Update your customer profile information.</p>
            </div>
          </div>

          <label><FaUser /> Full Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <label><FaEnvelope /> Email Address</label>
          <input value={form.email} disabled />

          <label><FaPhoneAlt /> Phone Number</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

          <label><FaMapMarkerAlt /> Address</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

          <button className="primary save-profile-btn" onClick={() => updateProfile(form)}>
            <FaSave /> Save Profile
          </button>
        </div>
      </div>
    </section>
  );
}

function Cart({ items, products, requestProduct, updateCartQuantity, remove }) {
  return (
    <section className="section">
      <h1><FaShoppingCart /> My Cart</h1>

      {items.length === 0 && <p>Your cart is empty.</p>}

      <div className="list">
        {items.map((item) => {
          const product = products.find((p) => p.id === item.productId);

          return (
            <div className="row-card" key={item.id}>
              <img src={product?.image} alt={product?.name} />

              <div>
                <h3>{product?.name}</h3>
                <p>{currency(product?.price || 0)}</p>
                <input type="number" min="1" value={item.quantity} onChange={(e) => updateCartQuantity(item.id, e.target.value)} />
              </div>

              <button className="primary" onClick={() => requestProduct(item)}><FaClipboardList /> Request Product</button>
              <button onClick={() => remove(item.id)}><FaTrash /> Remove</button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Wishlist({ items, products, addToCart, remove }) {
  return (
    <section className="section">
      <h1><FaHeart /> My Wishlist</h1>

      {items.length === 0 && <p>Your wishlist is empty.</p>}

      <div className="list">
        {items.map((item) => {
          const product = products.find((p) => p.id === item.productId);

          return (
            <div className="row-card" key={item.id}>
              <img src={product?.image} alt={product?.name} />

              <div>
                <h3>{product?.name}</h3>
                <p>{currency(product?.price || 0)}</p>
              </div>

              <button className="primary" onClick={() => addToCart(product)}><FaShoppingCart /> Move to Cart</button>
              <button onClick={() => remove(item.id)}><FaTrash /> Remove</button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function UserRequests({ requests, products }) {
  return (
    <section className="section">
      <h1><FaClipboardList /> My Product Requests</h1>

      {requests.length === 0 && <p>No product requests found.</p>}

      <div className="list">
        {requests.map((request) => {
          const product = products.find((p) => p.id === request.productId);

          return (
            <div className="row-card" key={request.id}>
              <img src={product?.image} alt={product?.name} />

              <div>
                <h3>{product?.name}</h3>
                <p>{request.message}</p>
                <b className={`status ${request.status.toLowerCase()}`}>{request.status}</b>
                <p>{request.adminResponse || 'Waiting for admin response.'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AdminDashboard({ users, products, requests, setPage }) {
  const stats = [
    ['Total Users', users.filter((user) => user.role === 'user').length, <FaUsers />],
    ['Total Products', products.length, <FaBoxOpen />],
    ['Total Requests', requests.length, <FaClipboardList />],
    ['Accepted', requests.filter((r) => r.status === 'Accepted').length, <FaCheckCircle />],
    ['Rejected', requests.filter((r) => r.status === 'Rejected').length, <FaTimesCircle />],
    ['Banned Users', users.filter((u) => u.status === 'Banned').length, <FaShieldAlt />],
  ];

  return (
    <section className="section">
      <h1><FaTachometerAlt /> Admin Dashboard</h1>

      <div className="stats">
        {stats.map(([label, value, icon]) => (
          <div className="stat" key={label}>
            <h2>{icon} {value}</h2>
            <p>{label}</p>
          </div>
        ))}
      </div>

      <div className="actions">
        <button className="primary" onClick={() => setPage('create-product')}><FaPlusCircle /> Create Product</button>
        <button onClick={() => setPage('manage-products')}><FaBoxOpen /> Manage Products</button>
        <button onClick={() => setPage('manage-requests')}><FaClipboardList /> Manage Requests</button>
        <button onClick={() => setPage('manage-users')}><FaUsers /> Manage Users</button>
      </div>
    </section>
  );
}

function CreateProduct({ createProduct }) {
  const [form, setForm] = useState({
    name: '',
    category: 'Cricket',
    price: '',
    stock: '',
    status: 'Available',
    image: 'https://source.unsplash.com/900x700/?cricket-bat,closeup',
    description: '',
  });

  return (
    <section className="auth">
      <div className="card form-card wide-form">
        <h1><FaPlusCircle /> Create New Product</h1>
        <p className="form-subtitle">Add a new sports product to the store.</p>

        <input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>Football</option>
          <option>Cricket</option>
          <option>Volleyball</option>
          <option>Badminton</option>
          <option>Gym</option>
        </select>

        <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input type="number" placeholder="Stock Quantity" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />

        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option>Available</option>
          <option>Out of Stock</option>
          <option>Hidden</option>
        </select>

        <input placeholder="Product Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <textarea placeholder="Product Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <button className="primary" onClick={() => createProduct(form)}><FaPlusCircle /> Create Product</button>
      </div>
    </section>
  );
}

function ManageProducts({ products, deleteProduct, updateProductStatus }) {
  return (
    <section className="section">
      <h1><FaBoxOpen /> Manage Products</h1>

      <div className="list">
        {products.map((product) => (
          <div className="row-card" key={product.id}>
            <img src={product.image} alt={product.name} />

            <div>
              <h3>{product.name}</h3>
              <p>{product.category} · {currency(product.price)} · Stock: {product.stock}</p>

              <select value={product.status} onChange={(e) => updateProductStatus(product.id, e.target.value)}>
                <option>Available</option>
                <option>Out of Stock</option>
                <option>Hidden</option>
              </select>
            </div>

            <button onClick={() => deleteProduct(product.id)}><FaTrash /> Delete</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function ManageRequests({ requests, users, products, updateRequestStatus }) {
  return (
    <section className="section">
      <h1><FaClipboardList /> Manage Requests</h1>

      {requests.length === 0 && <p>No product requests found.</p>}

      <div className="list">
        {requests.map((request) => {
          const product = products.find((p) => p.id === request.productId);
          const user = users.find((u) => u.id === request.userId);

          return (
            <div className="row-card" key={request.id}>
              <img src={product?.image} alt={product?.name} />

              <div>
                <h3>{product?.name}</h3>
                <p>Requested by {user?.name} · Qty {request.quantity}</p>
                <p>{request.message}</p>
                <b className={`status ${request.status.toLowerCase()}`}>{request.status}</b>
              </div>

              <button className="primary" onClick={() => updateRequestStatus(request.id, 'Accepted')}><FaCheckCircle /> Accept</button>
              <button onClick={() => updateRequestStatus(request.id, 'Rejected')}><FaTimesCircle /> Reject</button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ManageUsers({ users, toggleBanUser }) {
  return (
    <section className="section">
      <h1><FaUsers /> Manage Users</h1>

      <div className="list">
        {users.filter((user) => user.role === 'user').map((user) => (
          <div className="row-card" key={user.id}>
            <img src={user.profileImage} alt={user.name} />

            <div>
              <h3>{user.name}</h3>
              <p>{user.email} · {user.phone} · {user.status}</p>
              <p>{user.address}</p>
            </div>

            <button onClick={() => toggleBanUser(user.id)}>
              <FaShieldAlt /> {user.status === 'Banned' ? 'Unban User' : 'Ban User'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer({ setPage }) {
  return (
    <footer className="footer-pro">
      <div className="footer-grid">
        <div>
          <h2><GiSoccerBall /> SportZone</h2>
          <p>A professional sports product request system for students, clubs, coaches, players, gyms, and sports stores.</p>

          <div className="social-icons">
            <span><FaGlobe /></span>
            <span><FaFacebookF /></span>
            <span><FaInstagram /></span>
            <span><FaYoutube /></span>
          </div>
        </div>

        <div>
          <h3>Navigation</h3>
          <button onClick={() => setPage('home')}><FaHome /> Home</button>
          <button onClick={() => setPage('about')}><FaInfoCircle /> About</button>
          <button onClick={() => setPage('products')}><FaBoxOpen /> Products</button>
          <button onClick={() => setPage('contact')}><FaPhoneAlt /> Contact</button>
        </div>

        <div>
          <h3>Product Categories</h3>
          <p><GiCricketBat /> Cricket Products</p>
          <p><FaVolleyballBall /> Volleyball Items</p>
          <p><GiShuttlecock /> Badminton Equipment</p>
          <p><FaDumbbell /> Gym and Fitness Tools</p>
        </div>

        <div>
          <h3>Store Info</h3>
          <p><FaMapMarkerAlt /> Jaffna, Sri Lanka</p>
          <p><FaPhoneAlt /> 077 123 4567</p>
          <p><FaEnvelope /> support@sportzone.lk</p>
          <p><FaClock /> Mon - Sat, 9 AM - 6 PM</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 SportZone Product Request System. All rights reserved.</p>
        <p>React + LocalStorage Demo for Full-Stack Assignment Reference</p>
      </div>
    </footer>
  );
}

createRoot(document.getElementById('root')).render(<App />);