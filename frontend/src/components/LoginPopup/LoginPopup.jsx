import React, { useState, useContext, useEffect } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import userService from "../../services/UserService";

const LoginPopup = ({ setShowLogin }) => {
  const { setToken, setUserData } = useContext(StoreContext);

  // States: "Login" | "Sign Up" | "Verify Register OTP" | "Forgot Password" | "Reset Password OTP"
  const [currState, setCurrState] = useState("Login");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  // Eye toggle states
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  // Form input data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // Resend OTP countdown timer
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearMessages = () => {
    setStatusMsg({ type: "", text: "" });
  };

  // Switch modal mode cleanly
  const switchState = (newState) => {
    setCurrState(newState);
    clearMessages();
    setShowPass(false);
    setShowConfirmPass(false);
    setDevOtp("");
  };

  // =========================
  // 1. LOGIN HANDLER
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const response = await userService.login({
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        setToken(response.token);
        if (response.user && setUserData) {
          setUserData(response.user);
        }
        localStorage.setItem("token", response.token);
        setShowLogin(false);
      } else {
        setStatusMsg({ type: "error", text: response.message || "Invalid credentials" });
      }
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to login. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 2. SIGN UP: SEND OTP
  // =========================
  const handleRequestRegisterOTP = async (e) => {
    e.preventDefault();
    clearMessages();

    if (formData.password !== formData.confirmPassword) {
      setStatusMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (formData.password.length < 8) {
      setStatusMsg({ type: "error", text: "Password must be at least 8 characters long." });
      return;
    }

    setLoading(true);

    try {
      const response = await userService.sendOTP({
        email: formData.email,
        purpose: "register",
        name: formData.name,
      });

      if (response.success) {
        const receivedOtp = response.devOtp || response.data?.devOtp || "";
        if (receivedOtp) {
          setDevOtp(receivedOtp);
        }
        setStatusMsg({
          type: "success",
          text: (response.isLive || response.data?.isLive)
            ? `Verification code sent to ${formData.email}`
            : `Verification code generated for ${formData.email}`,
        });
        setCurrState("Verify Register OTP");
        setResendTimer(60);
      } else {
        setStatusMsg({ type: "error", text: response.message || "Could not send verification code." });
      }
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to send OTP. Please check your email.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 3. VERIFY OTP & REGISTER
  // =========================
  const handleVerifyRegisterOTP = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!formData.otp || formData.otp.trim().length !== 6) {
      setStatusMsg({ type: "error", text: "Please enter a valid 6-digit OTP code." });
      return;
    }

    setLoading(true);

    try {
      const response = await userService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: formData.otp.trim(),
      });

      if (response.success) {
        setToken(response.token);
        if (response.user && setUserData) {
          setUserData(response.user);
        }
        localStorage.setItem("token", response.token);
        setShowLogin(false);
      } else {
        setStatusMsg({ type: "error", text: response.message || "Registration failed." });
      }
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.response?.data?.message || "Invalid or expired OTP. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 4. FORGOT PASSWORD: SEND OTP
  // =========================
  const handleForgotPassRequestOTP = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!formData.email) {
      setStatusMsg({ type: "error", text: "Please enter your registered email." });
      return;
    }

    setLoading(true);

    try {
      const response = await userService.sendOTP({
        email: formData.email,
        purpose: "forgot_password",
      });

      if (response.success) {
        const receivedOtp = response.devOtp || response.data?.devOtp || "";
        if (receivedOtp) {
          setDevOtp(receivedOtp);
        }
        setStatusMsg({
          type: "success",
          text: (response.isLive || response.data?.isLive)
            ? `Reset code sent to ${formData.email}`
            : `Reset code generated for ${formData.email}`,
        });
        setCurrState("Reset Password OTP");
        setResendTimer(60);
      } else {
        setStatusMsg({ type: "error", text: response.message || "Failed to send reset code." });
      }
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to send reset code.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 5. RESET PASSWORD WITH OTP
  // =========================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!formData.otp || formData.otp.trim().length !== 6) {
      setStatusMsg({ type: "error", text: "Please enter a valid 6-digit code." });
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setStatusMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (formData.newPassword.length < 8) {
      setStatusMsg({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }

    setLoading(true);

    try {
      const response = await userService.resetPassword({
        email: formData.email,
        otp: formData.otp.trim(),
        newPassword: formData.newPassword,
      });

      if (response.success) {
        alert("Password reset successfully! Please login with your new password.");
        switchState("Login");
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "", otp: "" }));
      } else {
        setStatusMsg({ type: "error", text: response.message || "Failed to reset password." });
      }
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to reset password. Please check OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Eye Icon SVG component
  const EyeIcon = ({ visible }) => (
    <svg
      className="password-eye-svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {visible ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );

  return (
    <div className="login-popup">
      <div className="login-popup-container">
        {/* Header */}
        <div className="login-popup-title">
          <h2>
            {currState === "Login" && "Welcome Back"}
            {currState === "Sign Up" && "Create Account"}
            {currState === "Verify Register OTP" && "Verify Email"}
            {currState === "Forgot Password" && "Forgot Password"}
            {currState === "Reset Password OTP" && "Set New Password"}
          </h2>

          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt="Close"
            className="login-popup-close-btn"
          />
        </div>

        {/* Status Message Notification */}
        {statusMsg.text && (
          <div className={`login-feedback-alert ${statusMsg.type}`}>
            <span>{statusMsg.type === "error" ? "⚠️" : "✅"}</span>
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* ================= FORM: LOGIN ================= */}
        {currState === "Login" && (
          <form onSubmit={handleLogin}>
            <div className="login-popup-input">
              <div className="field-group">
                <label>Email Address</label>
                <input
                  name="email"
                  onChange={onChangeHandler}
                  value={formData.email}
                  type="email"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="field-group">
                <div className="label-with-link">
                  <label>Password</label>
                  <span
                    className="forgot-pass-link"
                    onClick={() => switchState("Forgot Password")}
                  >
                    Forgot Password?
                  </span>
                </div>
                <div className="password-input-wrap">
                  <input
                    name="password"
                    onChange={onChangeHandler}
                    value={formData.password}
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-eye"
                    onClick={() => setShowPass(!showPass)}
                    title={showPass ? "Hide password" : "Show password"}
                  >
                    <EyeIcon visible={showPass} />
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? "Signing in..." : "Login to Account"}
            </button>

            <div className="login-popup-condition">
              <input type="checkbox" required defaultChecked />
              <p>By continuing, I agree to the terms of use & privacy policy</p>
            </div>

            <p className="login-switch-text">
              Don't have an account?{" "}
              <span onClick={() => switchState("Sign Up")}>Create account</span>
            </p>
          </form>
        )}

        {/* ================= FORM: SIGN UP (PASSWORD + CONFIRM PASSWORD) ================= */}
        {currState === "Sign Up" && (
          <form onSubmit={handleRequestRegisterOTP}>
            <div className="login-popup-input">
              <div className="field-group">
                <label>Full Name *</label>
                <input
                  name="name"
                  onChange={onChangeHandler}
                  value={formData.name}
                  type="text"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="field-group">
                <label>Email Address *</label>
                <input
                  name="email"
                  onChange={onChangeHandler}
                  value={formData.email}
                  type="email"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="field-group">
                <label>Password (min 8 chars) *</label>
                <div className="password-input-wrap">
                  <input
                    name="password"
                    onChange={onChangeHandler}
                    value={formData.password}
                    type={showPass ? "text" : "password"}
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-eye"
                    onClick={() => setShowPass(!showPass)}
                    title={showPass ? "Hide password" : "Show password"}
                  >
                    <EyeIcon visible={showPass} />
                  </button>
                </div>
              </div>

              <div className="field-group">
                <label>Confirm Password *</label>
                <div className="password-input-wrap">
                  <input
                    name="confirmPassword"
                    onChange={onChangeHandler}
                    value={formData.confirmPassword}
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="Re-enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-eye"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    title={showConfirmPass ? "Hide password" : "Show password"}
                  >
                    <EyeIcon visible={showConfirmPass} />
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? "Sending OTP Code..." : "Verify Email with OTP →"}
            </button>

            <div className="login-popup-condition">
              <input type="checkbox" required />
              <p>By continuing, I agree to the terms of use & privacy policy</p>
            </div>

            <p className="login-switch-text">
              Already have an account?{" "}
              <span onClick={() => switchState("Login")}>Login here</span>
            </p>
          </form>
        )}

        {/* ================= FORM: VERIFY REGISTER OTP ================= */}
        {currState === "Verify Register OTP" && (
          <form onSubmit={handleVerifyRegisterOTP}>
            <div className="otp-step-header">
              <span className="otp-mail-icon">📩</span>
              <p>
                We've sent a 6-digit verification code to <strong>{formData.email}</strong>.
              </p>
            </div>

            {devOtp && (
              <div
                className="otp-dev-badge"
                onClick={() => setFormData((prev) => ({ ...prev, otp: devOtp }))}
                title="Click to auto-fill code"
              >
                <div className="otp-dev-left">
                  <span className="otp-dev-icon">🔑</span>
                  <div>
                    <span className="otp-dev-label">Test Code: <strong>{devOtp}</strong></span>
                    <span className="otp-dev-hint">Click here to auto-fill instantly</span>
                  </div>
                </div>
                <button type="button" className="otp-autofill-btn">Auto-fill ⚡</button>
              </div>
            )}

            <div className="login-popup-input">
              <div className="field-group">
                <label>Enter 6-Digit OTP Code</label>
                <input
                  name="otp"
                  onChange={onChangeHandler}
                  value={formData.otp}
                  type="text"
                  maxLength="6"
                  className="otp-code-input"
                  placeholder="0 0 0 0 0 0"
                  autoFocus
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Complete Registration"}
            </button>

            <div className="resend-otp-row">
              {resendTimer > 0 ? (
                <span className="resend-countdown">Resend code in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleRequestRegisterOTP}
                  disabled={loading}
                >
                  Resend OTP Code
                </button>
              )}
              <span className="step-back-btn" onClick={() => switchState("Sign Up")}>
                Edit Details
              </span>
            </div>
          </form>
        )}

        {/* ================= FORM: FORGOT PASSWORD (STEP 1) ================= */}
        {currState === "Forgot Password" && (
          <form onSubmit={handleForgotPassRequestOTP}>
            <p className="forgot-desc">
              Enter your registered email address and we'll send you a 6-digit OTP to reset your password.
            </p>

            <div className="login-popup-input">
              <div className="field-group">
                <label>Registered Email</label>
                <input
                  name="email"
                  onChange={onChangeHandler}
                  value={formData.email}
                  type="email"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? "Sending Reset Code..." : "Send Reset Code →"}
            </button>

            <p className="login-switch-text">
              Remembered your password?{" "}
              <span onClick={() => switchState("Login")}>Back to Login</span>
            </p>
          </form>
        )}

        {/* ================= FORM: RESET PASSWORD (STEP 2 - OTP + NEW PASSWORD) ================= */}
        {currState === "Reset Password OTP" && (
          <form onSubmit={handleResetPassword}>
            <div className="otp-step-header">
              <span className="otp-mail-icon">🔑</span>
              <p>
                Enter the 6-digit code sent to <strong>{formData.email}</strong> and create your new password.
              </p>
            </div>

            {devOtp && (
              <div
                className="otp-dev-badge"
                onClick={() => setFormData((prev) => ({ ...prev, otp: devOtp }))}
                title="Click to auto-fill code"
              >
                <div className="otp-dev-left">
                  <span className="otp-dev-icon">🔑</span>
                  <div>
                    <span className="otp-dev-label">Test Code: <strong>{devOtp}</strong></span>
                    <span className="otp-dev-hint">Click here to auto-fill instantly</span>
                  </div>
                </div>
                <button type="button" className="otp-autofill-btn">Auto-fill ⚡</button>
              </div>
            )}

            <div className="login-popup-input">
              <div className="field-group">
                <label>6-Digit Reset Code *</label>
                <input
                  name="otp"
                  onChange={onChangeHandler}
                  value={formData.otp}
                  type="text"
                  maxLength="6"
                  className="otp-code-input"
                  placeholder="0 0 0 0 0 0"
                  required
                />
              </div>

              <div className="field-group">
                <label>New Password (min 8 chars) *</label>
                <div className="password-input-wrap">
                  <input
                    name="newPassword"
                    onChange={onChangeHandler}
                    value={formData.newPassword}
                    type={showPass ? "text" : "password"}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-eye"
                    onClick={() => setShowPass(!showPass)}
                    title={showPass ? "Hide password" : "Show password"}
                  >
                    <EyeIcon visible={showPass} />
                  </button>
                </div>
              </div>

              <div className="field-group">
                <label>Confirm New Password *</label>
                <div className="password-input-wrap">
                  <input
                    name="confirmNewPassword"
                    onChange={onChangeHandler}
                    value={formData.confirmNewPassword}
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-eye"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    title={showConfirmPass ? "Hide password" : "Show password"}
                  >
                    <EyeIcon visible={showConfirmPass} />
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? "Resetting Password..." : "Update Password & Login"}
            </button>

            <div className="resend-otp-row">
              {resendTimer > 0 ? (
                <span className="resend-countdown">Resend in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleForgotPassRequestOTP}
                  disabled={loading}
                >
                  Resend Reset Code
                </button>
              )}
              <span className="step-back-btn" onClick={() => switchState("Login")}>
                Cancel
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPopup;
