module.exports = {
    origin: (origin, callback) => {
        const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
        // If origin is undefined (like simple requests/Postman), or matches allowedOrigin
        if (!origin || origin === allowedOrigin) {
            callback(null, true);
        } else {
            console.error('CORS Error: Origin', origin, 'does not match', allowedOrigin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
};
