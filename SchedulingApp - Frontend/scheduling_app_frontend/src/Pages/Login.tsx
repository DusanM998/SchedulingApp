import React, { useState } from 'react'
import { useLoginUserMutation } from '../apis/authApi';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { inputHelper, toastNotify } from '../Helper';
import { apiResponse, userModel } from '../Interfaces';
import { jwtDecode } from 'jwt-decode';
import { setLoggedInUser } from '../Storage/Redux/userAuthSlice';
import { MainLoader } from '../Components/Page/Common';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function Login() {

    const [error, setError] = useState("");
    const [loginUser] = useLoginUserMutation();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [userInput, setUserInput] = useState({
        userName: "",
        password: ""
    });

    const handleUserInput = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const tempData = inputHelper(e, userInput);
        setUserInput(tempData);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const response: apiResponse = await loginUser({
            userName: userInput.userName,
            password: userInput.password
        });

        if (response.data) {
            console.log(response.data);
            const { token } = response.data.result;
            const { name, id, email, role }: userModel = jwtDecode(token);
            localStorage.setItem("token", token);

            dispatch(setLoggedInUser({ name, id, email, role }));

            toastNotify("Uspešna prijava!");

            navigate("/");
        }
        else if (response.error) {
            toastNotify(response.error.data.errorMessages[0], "error");
            setError(response.error.data.errorMessages[0]);
        }

        setLoading(false);
    }

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

  return (
    <div className='container text-center'>
      {loading && <MainLoader />}
      <form method="post" onSubmit={handleSubmit}>
        <h1 className='mt-5'>Prijava</h1>
        <div className='mt-5'>
            <div className='col-sm-6 offset-sm-3 col-xs-12 mt-4'>
                <input
                    type='text'
                    className='form-control'
                    placeholder='Unesite Korisničko Ime'
                    required
                    name='userName'
                    value={userInput.userName}
                    onChange={handleUserInput}>
                </input>
            </div>
            <div className='col-sm-6 offset-sm-3 col-xs-12 mt-4'>
                <TextField
                    type = {showPassword ? "text" : "password"}
                    className='form-control'
                    placeholder='Unesite Lozinku'
                    required
                    name='password'
                    value={userInput.password}
                    onChange={handleUserInput}
                    fullWidth
                    InputProps = {{
                        endAdornment: (
                            <InputAdornment position='end'>
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={toggleShowPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}>
                    
                </TextField>
            </div>
        </div>
        <div className='mt-2'>
            {error && <p className='text-danger'>{error}</p>}
            <button
                type='submit'
                className='btn btn-outlined rounded-pill text-white mx-2'
                style={{width: "200px", backgroundColor: "#4da172"}}>
                Login
            </button>
            <button 
                className="btn btn-outlined rounded-pill text-white mx-2"
                style={{ width: "200px", backgroundColor:"#999393" }}
                disabled={loading}
                onClick={() => navigate("/")}>
                Otkaži
            </button>
        </div>
      </form>
    </div>
  )
}

export default Login
