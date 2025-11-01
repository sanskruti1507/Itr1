// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors'); // Added cors for API routes

// Import Mongoose Models
const User = require('./models/User');
const Cart = require('./models/Cart');
const Order = require('./models/order');
const Contact = require('./models/contact');

const app = express();
const PORT = process.env.PORT || 3000;

// 📦 Static Cake Prices (This is good for server-side validation)
const cakePrices = {
    'Chocolate Cake': 600,
    'Mocha Coffee Cake': 500,
    'Black Forest Cake': 450,
    'Butterscotch Caramel Crunch Cake': 400,
    'Red Velvet Delight Cake': 650,
    'Classic Vanilla Bean Cake': 600,
    'Spring Blossom Floral Cake': 800,
    'Fresh Flowers Cake': 900,
    'Flower Basket Cake': 850,
    'Sparkle Drip Opulence Cake': 700,
    'Elegant Fondant Cake': 1000,
    'Glaze Cake': 950,
    'Eggless Vanilla Delight': 700,
    'Midnight Chocolate Surprise': 750,
    'Classic Dry Fruit Cake': 900,
    'Assorted Cupcakes': 550,
    'Chocolate Truffle Pastry': 200,
    'Red Velvet Jar Cake': 300,
    'Decadent Chocolate Cake': 650,
    'Decadent Chocolate Truffle Cake': 750,
    'Crunchy Kitkat Cake': 700,
    'Ferrero Rocher Cake': 700,
    'Cookies & Cream Oreo Cake': 600,
    'Classic New York Cheesecake': 600,
    'Indian Rasmalai Cake': 899,
    'Decadent Fudge Brownie Cake': 600,
    'Ice Cream Cake': 700,
    'Gulab Jamun Cake': 799,
    'Kaju Katli Cake': 650,
    'Motichoor Ladoo Cake': 995,
    'Magical Unicorn Cake': 795,
    'Enchanting Princess Cake': 895,
    'Favorite Cartoon Character Cake': 1200,
    'Custom Order Cake': 600,
    'Custom Fruit Cake': 600,
    'Custom Symbol Cake': 1200
};

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors()); // Enable CORS for all routes (important for API calls from different origins)

// ✅ Session Middleware
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }
}));

// ✅ Serve HTML Views
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/signup.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'signup.html')));
app.get('/profile.html', (req, res) => {
    if (!req.session.username) return res.redirect('/login.html');
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});
app.get('/home.html', (req, res) => {
    if (!req.session.username) return res.redirect('/login.html');
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});
app.get('/about.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'about.html')));
app.get('/cake.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'cake.html')));
app.get('/contact.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'contact.html')));
app.get('/cart.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'cart.html')));
app.get('/payment.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'payment.html')));
app.get('/order.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'order.html')));
app.get('/myOrders.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'myOrders.html')));

// --- Authentication & User Routes ---
app.post('/signup', async (req, res) => {
    const { username, password, fullName, email, phone, address, gender, dob } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.send('<h2>User already exists. <a href="/signup.html">Try again</a></h2>');
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, fullName, email, phone, address, gender, dob });
        await newUser.save();
        console.log(`✅ New user registered: ${username}`);
        res.redirect('/login.html');
    } catch (error) {
        console.error('❌ Signup error:', error);
        res.status(500).send('Signup failed');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.send('<h2>User not found. <a href="/login.html">Try again</a></h2>');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.send('<h2>Invalid password. <a href="/login.html">Try again</a></h2>');
        req.session.username = user.username;
        req.session.user = {
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            gender: user.gender,
            dob: user.dob
        };
        res.redirect('/profile.html');
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).send('Login failed');
    }
});

app.get('/profiledata', (req, res) => {
    if (!req.session.username) return res.status(401).json({ error: 'Unauthorized' });
    res.json({ username: req.session.username, ...req.session.user });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) console.error('Logout error:', err);
        res.redirect('/login.html');
    });
});

// --- Cart & Order Routes ---
app.post('/cart/add', async (req, res) => {
    try {
        const { name, description, imageUrl, selectedOption, price } = req.body;
        const username = req.session.username;
        if (!username) return res.status(401).json({ error: 'Please log in first' });
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });
        let cart = await Cart.findOne({ userId: user._id });
        if (!cart) {
            cart = new Cart({ userId: user._id, items: [] });
        }
        const existingItem = cart.items.find(
            item => item.name === name && item.selectedOption === selectedOption
        );
        const correctPrice = cakePrices[name];
if (existingItem) {
  existingItem.quantity += 1;
} else {
  let cleanImageUrl = imageUrl || '';
  if (cleanImageUrl.includes('<img')) {
    const match = cleanImageUrl.match(/src=["']([^"']+)["']/);
    cleanImageUrl = match ? match[1] : '';
  }

  cart.items.push({
    name,
    description,
    imageUrl: cleanImageUrl,
    selectedOption,
    price: correctPrice,
    quantity: 1
  });
}

        await cart.save();
        res.json({ message: 'Added to cart', cart });
    } catch (err) {
        console.error('❌ Cart Add Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/submit', async (req, res) => {
  try {
    const { address, paymentMethod, paymentDetails } = req.body;
    const username = req.session.username;
    if (!username) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // ✅ Pull items directly from the Cart schema
    const cart = await Cart.findOne({ userId: user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const items = cart.items.map(item => ({
      name: item.name,
      description: item.description || 'No description',
      imageUrl: item.imageUrl || 'https://placehold.co/100x100?text=No+Image',
      selectedOption: item.selectedOption || 'N/A',
      price: parseFloat(item.price),
      quantity: item.quantity || 1
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = new Order({
      userId: user._id,
      items,
      address,
      paymentMethod,
      paymentDetails,
      totalAmount
    });

    await newOrder.save();

    // Optional: clear cart after placing order
    await Cart.deleteOne({ userId: user._id });

    res.status(200).json({ message: 'Order placed successfully!', orderId: newOrder._id });
  } catch (err) {
    console.error('❌ Submit Order Error:', err);
    res.status(500).json({ message: 'Failed to place order. Please try again.' });
  }
});


// ✅ Return user's cart as an order (for My Orders page)
app.get('/api/orders', async (req, res) => {
    try {
        const username = req.session.username;
        if (!username) {
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const orders = await Order.find({ userId: user._id }).sort({ orderDate: -1 });

        const formattedOrders = orders.map(order => ({
            orderId: order._id.toString(),
            orderDate: order.orderDate,
            totalAmount: order.totalAmount,
            status: 'Delivered', // Static or dynamic logic can be added later
            items: order.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: parseFloat(item.price),
                imageUrl: item.imageUrl,
                description: item.description,
                selectedOption: item.selectedOption
            }))
        }));

        res.json(formattedOrders);
    } catch (err) {
        console.error('❌ Error in /api/orders:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ✅ Contact Form Route
app.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();

    res.json({ success: true, message: 'Contact form submitted successfully.' });
  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});


// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});