export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#ecfeff",
                    100: "#cffafe",
                    200: "#a5f3fc",
                    500: "#06b6d4",
                    700: "#0e7490",
                    900: "#164e63"
                },
                accent: {
                    500: "#22c55e",
                    700: "#15803d"
                }
            },
            fontFamily: {
                sans: ["Be Vietnam Pro", "ui-sans-serif", "system-ui"]
            },
            boxShadow: {
                glow: "0 12px 40px rgba(14, 116, 144, 0.15)"
            }
        }
    },
    plugins: [],
};
