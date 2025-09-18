import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetUserByUserIdQuery,
  useVerifyPasswordMutation,
} from "../../apis/authApi";
import { userModel } from "../../Interfaces";
import { useSelector } from "react-redux";
import { RootState } from "../../Storage/Redux/store";
import { inputHelper } from "../../Helper";
import { MainLoader } from "../../Components/Page/Common";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const userDetailsData = {
  userName: "",
  name: "",
  password: "",
  phoneNumber: "",
  role: "",
};

function UserPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [userDetailsInput, setUserDetailsInput] = useState(userDetailsData);
  const [showPassword, setShowPassword] = useState(false);
  const [imageToBeDisplayed, setImageToBeDisplayed] = useState<string>();
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isUpdateNavigation, setIsUpdateNavigation] = useState(false);
  const [showDialogPassword, setShowDialogPassword] = useState(false);

  // Dobijam user ID iz URL parametara
  const { id } = useParams<{ id: string }>();
  const { data } = useGetUserByUserIdQuery(id);
  const [verifyPassword] = useVerifyPasswordMutation();

  const userData: userModel = useSelector(
    (state: RootState) => state.userAuthStore
  );

  useEffect(() => {
    if (data && data.result) {
      const tempData = {
        userName: data.result.userName,
        name: data.result.name,
        password: "", // Password is not returned from the backend
        phoneNumber: data.result.phoneNumber,
        role: data.result.role,
      };
      setUserDetailsInput(tempData);
      setImageToBeDisplayed(data.result.image);
    }
  }, [data]);

  const handleUserInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const tempData = inputHelper(e, userDetailsInput);
    setUserDetailsInput(tempData);
  };

  const toggleShowPassword = () => {
    if (!isPasswordVerified) {
      setIsUpdateNavigation(false);
      setPasswordDialogOpen(true);
    } else {
      setShowPassword(!showPassword);
    }
  };

  const toggleShowDialogPassword = () => {
    setShowDialogPassword(!showDialogPassword);
  };

  const handleUpdateClick = () => {
    if (!isPasswordVerified) {
      setPasswordDialogOpen(true);
      setIsUpdateNavigation(true);
    } else {
      navigate("/userDetails/userDetailsUpdate/" + userData.id);
    }
  };

  const handlePasswordVerification = async () => {
    try {
      let response = await verifyPassword({
        Id: id,
        password: passwordInput,
      }).unwrap();
      if (response.isSuccess) {
        setIsPasswordVerified(true);
        setPasswordDialogOpen(false);
        setPasswordInput("");
        if (isUpdateNavigation) {
          navigate("/userDetails/userDetailsUpdate/" + userData.id);
        } else {
          // Store the entered password temporarily for display
          setUserDetailsInput((prev) => ({ ...prev, password: passwordInput }));
          setShowPassword(true);
        }
      } else {
        alert("Neispravna lozinka!");
      }
    } catch (error) {
      alert("Greška pri autentifikaciji.");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "#e74c3c";
      case "customer":
        return "#27ae60";
      default:
        return "#7f8c8d";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "Admin";
      case "customer":
        return "Customer";
      default:
        return role || "Nepoznato";
    }
  };

  return (
    <div className="border rounded pb-5 pt-3">
      {loading && <MainLoader />}
      <h1
        style={{ fontWeight: "300", color: "#305985" }}
        className="text-center"
      >
        Podaci o Korisniku
      </h1>
      <hr />
      <div className="mt-4 d-flex justify-content-center position-relative">
        {imageToBeDisplayed && (
          <img
            src={imageToBeDisplayed}
            alt=""
            className="img-fluid rounded-circle"
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
          />
        )}
      </div>
      <form className="col-10 mx-auto">
        <div className="form-group mt-3">
          Korisničko ime/E-mail
          <input
            type="text"
            value={userDetailsInput.userName}
            className="form-control"
            name="userName"
            required
            disabled={true}
            onChange={handleUserInput}
          />
        </div>
        <div className="form-group mt-3">
          Ime
          <input
            type="text"
            value={userDetailsInput.name}
            className="form-control"
            name="name"
            required
            disabled={true}
            onChange={handleUserInput}
          />
        </div>
        <div className="form-group mt-3">
          Status Korisnika
          <div
            className="form-control d-flex align-items-center"
            style={{
              backgroundColor: "#f8f9fa",
              color: getRoleColor(userDetailsInput.role),
              fontWeight: "bold",
            }}
          >
            <span
              className="badge me-2"
              style={{
                backgroundColor: getRoleColor(userDetailsInput.role),
                color: "white",
              }}
            >
              {userDetailsInput.role?.toUpperCase()}
            </span>
            {getRoleDisplayName(userDetailsInput.role)}
          </div>
        </div>
        <div className="form-group mt-3">
          Lozinka
          <TextField
            type={showPassword ? "text" : "password"}
            className="form-control"
            required
            name="password"
            value={userDetailsInput.password}
            disabled={!isPasswordVerified} // Enable only after verification
            onChange={handleUserInput}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
        <div className="form-group mt-3">
          Broj Telefona
          <PhoneInput value={userDetailsInput.phoneNumber} disabled={true} />
        </div>
        <div className="form-group mt-3">
          <button
            type="button"
            className="btn btn-lg form-control mt-3"
            style={{ backgroundColor: "#4da172", color: "white" }}
            onClick={handleUpdateClick}
          >
            Izmeni Informacije
          </button>
          <button
            type="button"
            className="btn btn-lg form-control mt-3"
            style={{ backgroundColor: "#999393" }}
            disabled={loading}
            onClick={() => navigate("/")}
          >
            Otkaži
          </button>
        </div>
      </form>

      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        PaperProps={{
          style: {
            borderRadius: "15px",
            padding: "20px",
            minWidth: "400px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{ textAlign: "center", fontWeight: "bold", color: "#305985" }}
        >
          Potvrda Identiteta
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, color: "#555" }}>
            Molimo unesite vašu lozinku za nastavak
          </Typography>
          <TextField
            type={showDialogPassword ? "text" : "password"}
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Unesite lozinku"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                "&:hover fieldset": {
                  borderColor: "#4da172",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#4da172",
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle dialog password visibility"
                    onClick={toggleShowDialogPassword}
                    edge="end"
                  >
                    {showDialogPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
          <Button
            onClick={() => setPasswordDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: "#999393",
              color: "#999393",
              borderRadius: "10px",
              textTransform: "none",
              "&:hover": {
                borderColor: "#777",
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            Otkaži
          </Button>
          <Button
            onClick={handlePasswordVerification}
            variant="contained"
            sx={{
              backgroundColor: "#4da172",
              color: "white",
              borderRadius: "10px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#3d8c5b",
              },
            }}
          >
            Potvrdi
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UserPage;
