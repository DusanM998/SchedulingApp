import React, { useState } from 'react'
import { useRegisterUserMutation } from '../apis/authApi'
import { useNavigate } from 'react-router-dom';
import { inputHelper, toastNotify } from '../Helper';
import apiResponse from '../Interfaces/apiResponse';
import { MainLoader } from '../Components/Page/Common';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { SD_Roles } from '../Utility/SD';

function Register() {

    const [registerUser] = useRegisterUserMutation();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [userInput, setUserInput] = useState({
        userName: "",
        password: "",
        role: "",
        name: "",
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const tempData = inputHelper(e, userInput);
        setUserInput(tempData);
    };

    const handleSelectChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const tempData = inputHelper(e, userInput);
        setUserInput(tempData);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
    
        //registerUser mutacija sluzi za slanje POST zahteva na server 
        const response: apiResponse = await registerUser({
          userName: userInput.userName,
          password: userInput.password,
          role: userInput.role,
          name: userInput.name,
        });
    
        if (response.data) {
          //console.log(response.data);
          toastNotify("Uspešna registracija!");
          navigate("/login");
        }
        else if(response.error){
          toastNotify(response.error.data.errorMessages[0], "error");
        }
    
        setLoading(false);
    }
    
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

  return (
    <div className="container text-center">
      {loading && <MainLoader />}
      <form method='post' onSubmit={handleSubmit}>
        <h1 className='mt-5'>Registruj se</h1>
        <div className='mt-5'>
            <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Unesite Korisničko Ime"
                    required
                    name = "userName"
                    value = {userInput.userName}
                    onChange={handleInputChange}
                />
            </div>
            <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Unesite Ime"
                    required
                    name = "name"
                    value={userInput.name}
                    onChange={handleInputChange}
                />
            </div>
            <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
                <TextField
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Unesite Novu Lozinku"
                    required
                    name="password"
                    value={userInput.password}
                    onChange={handleInputChange}
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
            <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
                <select
                    className="form-control form-select"
                    required
                    name = "role"
                    value={userInput.role}
                    onChange={handleSelectChange}>
                    <option value="">--Izaberi Ulogu--</option>
                    <option value={`${SD_Roles.CUSTOMER}`}>Customer</option>
                    <option value={`${SD_Roles.ADMIN}`}>Admin</option>
                </select>
            </div>
            <div className="mt-5">
                <button type="submit"
                    className="btn btn-outlined rounded-pill text-white mx-2"
                    style={{ width: "200px", backgroundColor:"#4da172" }}
                    disabled={loading}>
                    Registruj se
                    </button>
                    <button type="submit"
                    className="btn btn-outlined rounded-pill text-white mx-2"
                    style={{ width: "200px", backgroundColor:"#999393" }}
                        disabled={loading}
                        onClick={() => navigate("/")}>
                    Otkaži
                </button>
            </div>
        </div>
      </form>
    </div>
  )
}

export default Register
