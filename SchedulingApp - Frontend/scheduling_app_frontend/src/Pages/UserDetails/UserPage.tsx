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
  const { id } = useParams<{ id: string }>();
  const { data } = useGetUserByUserIdQuery(id);
  const [verifyPassword] = useVerifyPasswordMutation();

  console.log(id);

  const userData: userModel = useSelector(
    (state: RootState) => state.userAuthStore
  );

  console.log(userData);

  useEffect(() => {
    if (data && data.result) {
      //console.log(data.result.password)
      const tempData = {
        userName: data.result.userName,
        name: data.result.name,
        password: data.result.password,
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
    setShowPassword(!showPassword);
  };

  const handlePasswordVerification = async () => {
    console.log({ userId: id, password: passwordInput });
    try {
      let response = await verifyPassword({
        Id: id,
        password: passwordInput,
      }).unwrap();
      console.log(response);
      if (response.isSuccess) {
        setUserDetailsInput((prev) => ({ ...prev, Password: passwordInput }));
        setShowPassword(true);
        setPasswordDialogOpen(false);
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
        return "#e74c3c"; // Crvena za admin
      case "customer":
        return "#27ae60"; // Zelena za customer
      default:
        return "#7f8c8d"; // Siva za ostalo
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
            disabled={true}
            onChange={handleUserInput}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => {
                      if (!isPasswordVerified) {
                        setPasswordDialogOpen(true);
                      } else {
                        setShowPassword(!showPassword);
                      }
                    }}
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
            type="submit"
            className="btn btn-lg form-control mt-3"
            style={{ backgroundColor: "#4da172", color: "white" }}
            onClick={() =>
              navigate("/userDetails/userDetailsUpdate/" + userData.id)
            }
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
      >
        <DialogTitle>Potvrdite Identitet: </DialogTitle>
        <DialogTitle>Unesite svoju lozinku</DialogTitle>
        <DialogContent>
          <TextField
            type="password"
            className="form-control"
            required
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPasswordDialogOpen(false)}
            color="secondary"
          >
            Otkaži
          </Button>
          <Button onClick={handlePasswordVerification} color="primary">
            Potvrdi
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UserPage;
