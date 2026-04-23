export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const API = "https://demo-6g4k.onrender.com/api";

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await axios.get(`${API}/auth`, {
                        headers: {
                            'x-auth-token': token
                        }
                    });
                    setUser(res.data);
                } catch (err) {
                    logout();
                }
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API}/auth/login`, {
                email,
                password
            });

            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);

            return true;
        } catch (err) {
            console.log(err.response?.data?.msg || "Login failed");
            return false;
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const res = await axios.post(`${API}/auth/register`, {
                name,
                email,
                password,
                role
            });

            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);

            return true;
        } catch (err) {
            console.log(err.response?.data?.msg || "Registration failed");
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
