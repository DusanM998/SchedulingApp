import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetUserByUserIdQuery } from '../../apis/authApi';
import { userModel } from '../../Interfaces';
import { useSelector } from 'react-redux';
import { RootState } from '../../Storage/Redux/store';
import { inputHelper } from '../../Helper';
import { MainLoader } from '../../Components/Page/Common';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const userDetailsData = {
  userName: "",
  name: "",
  password: "",
};

function UserPage() {

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [userDetailsInput, setUserDetailsInput] = useState(userDetailsData);
  const [showPassword, setShowPassword] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { data } = useGetUserByUserIdQuery(id);

  console.log(id);

  const userData: userModel = useSelector((state: RootState) => state.userAuthStore);

  useEffect(() => {
    if (data && data.result) {
      const tempData = {
        userName: data.result.userName,
        name: data.result.name,
        password: data.result.password
      };
      setUserDetailsInput(tempData);
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

  return (
    <div className='border rounded pb-5 pt-3'>
      {loading && <MainLoader />}
      <h1 style={{ fontWeight: "300", color: "#305985" }} className='text-center'>Podaci o Korisniku</h1>
      <hr />
      <form className="col-10 mx-auto">
        <div className="form-group mt-3">
          Korisničko ime/E-mail
          <input
            type="text"
            value = {userDetailsInput.userName}
            className="form-control"
            name="userName"
            required
            disabled={true}
            onChange={handleUserInput}
          />
        </div>
        <div className='form-group mt-3'>
          Ime
          <input
              type="text"
              value = {userDetailsInput.name}
              className="form-control"
              name="name"
              required
              disabled={true}
              onChange={handleUserInput}
            />
        </div>
        <div className='form-group mt-3'>
          Lozinka
          <TextField
            type={showPassword ? "text" : "password"}
            className="form-control"
            required
            name="password"
            value={userDetailsInput.password}
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
        <div className='form-group mt-3'>
          <button
            type="submit"
            className='btn btn-lg form-control mt-3'
            style={{ backgroundColor: "#4da172", color: "white" }}
            onClick={() => navigate("/userDetails/userDetailsUpdate/" + userData.id)}
          >
            Izmeni Informacije
          </button>
          <button
            type='submit'
            className='btn btn-lg form-control mt-3'
            style={{ backgroundColor: "#999393" }}
            disabled={loading}
            onClick={() => navigate("/")}
          >
            Otkaži
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserPage
