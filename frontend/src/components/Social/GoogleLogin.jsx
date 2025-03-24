import { FcGoogle } from "react-icons/fc";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GoogleLogin = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userCredential = await googleLogin();
      const user = userCredential.user;
      console.log("Google user:", user); // Log user object for debugging

      if (user) {
        const userImp = {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: "customer",
        };

        if (userImp.email && userImp.name) {
          try {
            const response = await axios.post("http://localhost:3000/api/auth/register", userImp);
            console.log("Registration response:", response.data);
            navigate("/"); // Navigate after successful registration
            console.log("Registration Successful");
          } catch (err) {
            console.error("Error during registration:", err.response || err);
            alert("Registration failed. Please try again.");
          }
        } else {
          console.error("User data is missing: ", userImp);
          alert("Missing user data. Please try again.");
        }
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert("Failed to log in with Google. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center my-3">
      <button
        onClick={handleLogin}
        className="flex items-center outline-none bg-white border border-gray-300 rounded-lg shadow-md px-6 py-4 text-sm font-medium text-gray-800 hover:bg-gray-300 focus:outline-none"
      >
        <FcGoogle className="h-6 w-6 mr-2" />
        <span>Continue with Google</span>
      </button>
    </div>
  );
};

export default GoogleLogin;
